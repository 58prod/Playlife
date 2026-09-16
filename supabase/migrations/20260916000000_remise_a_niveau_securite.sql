-- ============================================================================
-- PLAYLIFE — REMISE À NIVEAU SÉCURITÉ (v2.0.0)
-- ============================================================================
-- Script idempotent : peut être exécuté plusieurs fois, sur une base existante
-- comme sur une base neuve (après MIGRATION_COMPLETE_SECURISEE.sql).
-- Il remplace TOUTES les politiques RLS des tables Playlife et des buckets
-- Storage par un jeu cohérent, et ajoute des triggers de protection.
--
-- Failles corrigées :
--  1. La table profiles était lisible par les visiteurs anonymes
--     (emails + statut super admin exposés).
--  2. Le trigger anti-promotion ne bloquait rien : en SECURITY DEFINER,
--     current_role vaut toujours 'postgres'. Un utilisateur pouvait
--     se déclarer super admin.
--  3. Un créateur pouvait publier lui-même sa mission (visible = true)
--     sans passer par la modération.
--  4. Un utilisateur pouvait créer une structure directement « validée ».
--  5. Les photos des missions non publiées étaient lisibles par tous.
--  6. La vue public_profiles (inutilisée) exposait tous les noms.
--  7. Les buckets Storage publics étaient listables par tous.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Schéma : colonnes manquantes éventuelles
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles   ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE public.missions   ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT false;
ALTER TABLE public.structures ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.structures ADD COLUMN IF NOT EXISTS validated_by_playlife BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.missions ALTER COLUMN visible SET DEFAULT false;

-- Harmonise le type de profil : user_type devient la référence
UPDATE public.profiles SET user_type = role
WHERE user_type IS NULL AND role IN ('voyageur', 'animateur');

CREATE INDEX IF NOT EXISTS idx_missions_visible ON public.missions(visible);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON public.missions(created_by);
CREATE INDEX IF NOT EXISTS idx_mission_media_mission_id ON public.mission_media(mission_id);
CREATE INDEX IF NOT EXISTS idx_structures_status ON public.structures(status);

-- ----------------------------------------------------------------------------
-- 2. Fonctions utilitaires
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Vrai si la requête vient de l'API (utilisateur anonyme ou connecté) et
-- non de l'éditeur SQL / service_role. Pas de SECURITY DEFINER ici : on lit
-- le rôle de la requête (claims JWT), pas celui du propriétaire de la fonction.
CREATE OR REPLACE FUNCTION public.is_api_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'role', '')
           IN ('anon', 'authenticated');
$$;

-- Création automatique du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_type TEXT := CASE WHEN NEW.raw_user_meta_data->>'role' = 'animateur' THEN 'animateur' ELSE 'voyageur' END;
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, user_type)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
        NEW.email,
        v_type,
        v_type
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garde l'email du profil synchronisé avec celui du compte
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles SET email = NEW.email, updated_at = NOW() WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
AFTER UPDATE OF email ON auth.users
FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.handle_user_email_change();

-- ----------------------------------------------------------------------------
-- 3. Triggers de protection des champs sensibles
-- ----------------------------------------------------------------------------

-- PROFILES : un utilisateur ne peut modifier ni is_super_admin, ni son email, ni son id
CREATE OR REPLACE FUNCTION public.guard_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF public.is_api_user() AND NOT public.auth_is_super_admin() THEN
        IF TG_OP = 'INSERT' THEN
            NEW.is_super_admin := false;
        ELSE
            NEW.id := OLD.id;
            NEW.is_super_admin := OLD.is_super_admin;
            NEW.email := OLD.email;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_super_admin_promotion ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_super_admin_self_promotion();
DROP TRIGGER IF EXISTS trg_guard_profile_fields ON public.profiles;
CREATE TRIGGER trg_guard_profile_fields
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_fields();

-- MISSIONS : la publication (visible) est réservée aux administrateurs
CREATE OR REPLACE FUNCTION public.guard_mission_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF public.is_api_user() AND NOT public.auth_is_super_admin() THEN
        IF TG_OP = 'INSERT' THEN
            NEW.visible := false;
            NEW.created_by := auth.uid();
        ELSE
            NEW.visible := OLD.visible;
            NEW.created_by := OLD.created_by;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_mission_fields ON public.missions;
CREATE TRIGGER trg_guard_mission_fields
BEFORE INSERT OR UPDATE ON public.missions
FOR EACH ROW EXECUTE FUNCTION public.guard_mission_fields();

-- STRUCTURES : une proposition est toujours « à valider »
CREATE OR REPLACE FUNCTION public.guard_structure_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF public.is_api_user() AND NOT public.auth_is_super_admin() THEN
        NEW.status := 'à valider playlife';
        NEW.validated_by_playlife := false;
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_structure_fields ON public.structures;
CREATE TRIGGER trg_guard_structure_fields
BEFORE INSERT ON public.structures
FOR EACH ROW EXECUTE FUNCTION public.guard_structure_fields();

-- ----------------------------------------------------------------------------
-- 4. Suppression de TOUTES les anciennes politiques des tables Playlife
-- ----------------------------------------------------------------------------
DO $$
DECLARE pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('profiles', 'missions', 'structures', 'mission_media', 'site_config')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;

    -- Politiques Storage liées aux buckets Playlife
    FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND (COALESCE(qual, '') || COALESCE(with_check, '')) ~ '(avatars|missions|mission-media|slideshow)'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

DROP VIEW IF EXISTS public.public_profiles;

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structures    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config   ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5. PROFILES — privé : chacun son profil, les admins voient tout
-- ----------------------------------------------------------------------------
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.auth_is_super_admin());

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.auth_is_super_admin())
WITH CHECK (id = auth.uid() OR public.auth_is_super_admin());

-- ----------------------------------------------------------------------------
-- 6. MISSIONS
-- ----------------------------------------------------------------------------
CREATE POLICY "missions_select_published" ON public.missions
FOR SELECT TO anon, authenticated
USING (visible = true);

CREATE POLICY "missions_select_own_or_admin" ON public.missions
FOR SELECT TO authenticated
USING (created_by = auth.uid() OR public.auth_is_super_admin());

CREATE POLICY "missions_insert_own" ON public.missions
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "missions_update_own_or_admin" ON public.missions
FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR public.auth_is_super_admin())
WITH CHECK (created_by = auth.uid() OR public.auth_is_super_admin());

CREATE POLICY "missions_delete_own_or_admin" ON public.missions
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR public.auth_is_super_admin());

-- ----------------------------------------------------------------------------
-- 7. STRUCTURES
-- ----------------------------------------------------------------------------
CREATE POLICY "structures_select_validated" ON public.structures
FOR SELECT TO anon, authenticated
USING (status = 'validée');

CREATE POLICY "structures_select_own_or_admin" ON public.structures
FOR SELECT TO authenticated
USING (created_by = auth.uid() OR public.auth_is_super_admin());

CREATE POLICY "structures_insert_authenticated" ON public.structures
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() OR public.auth_is_super_admin());

CREATE POLICY "structures_update_admin" ON public.structures
FOR UPDATE TO authenticated
USING (public.auth_is_super_admin())
WITH CHECK (public.auth_is_super_admin());

CREATE POLICY "structures_delete_admin" ON public.structures
FOR DELETE TO authenticated
USING (public.auth_is_super_admin());

-- ----------------------------------------------------------------------------
-- 8. MISSION_MEDIA — visibles seulement si la mission est publiée
-- ----------------------------------------------------------------------------
CREATE POLICY "mission_media_select" ON public.mission_media
FOR SELECT TO anon, authenticated
USING (EXISTS (
    SELECT 1 FROM public.missions m
    WHERE m.id = mission_media.mission_id
      AND (m.visible = true OR m.created_by = auth.uid() OR public.auth_is_super_admin())
));

CREATE POLICY "mission_media_insert_owner" ON public.mission_media
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.missions m
    WHERE m.id = mission_media.mission_id
      AND (m.created_by = auth.uid() OR public.auth_is_super_admin())
));

CREATE POLICY "mission_media_delete_owner" ON public.mission_media
FOR DELETE TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.missions m
    WHERE m.id = mission_media.mission_id
      AND (m.created_by = auth.uid() OR public.auth_is_super_admin())
));

-- ----------------------------------------------------------------------------
-- 9. SITE_CONFIG — lecture publique, écriture admin
-- ----------------------------------------------------------------------------
CREATE POLICY "site_config_select_all" ON public.site_config
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "site_config_write_admin" ON public.site_config
FOR ALL TO authenticated
USING (public.auth_is_super_admin())
WITH CHECK (public.auth_is_super_admin());

INSERT INTO public.site_config (key, value)
VALUES ('impact_metrics', '{"value1":"23","label1":"structures aidées","value2":"580","label2":"enfants aidés"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. STORAGE — buckets publics (lecture par URL), écriture restreinte
-- ----------------------------------------------------------------------------
-- Les fichiers restent accessibles par leur URL publique, mais la liste des
-- fichiers n'est plus consultable par tout le monde. Les politiques SELECT
-- ci-dessous servent uniquement aux suppressions / remplacements.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars',       'avatars',       true, 5242880, ARRAY['image/*']),
    ('missions',      'missions',      true, 5242880, ARRAY['image/*']),
    ('mission-media', 'mission-media', true, 5242880, ARRAY['image/*']),
    ('slideshow',     'slideshow',     true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- avatars/<user_id>/…  et  missions/<user_id>/…
CREATE POLICY "storage_user_folder_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id IN ('avatars', 'missions')
       AND ((storage.foldername(name))[1] = auth.uid()::text OR public.auth_is_super_admin()));

CREATE POLICY "storage_user_folder_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('avatars', 'missions')
            AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_user_folder_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('avatars', 'missions') AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id IN ('avatars', 'missions') AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_user_folder_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id IN ('avatars', 'missions')
       AND ((storage.foldername(name))[1] = auth.uid()::text OR public.auth_is_super_admin()));

-- mission-media/<mission_id>/…  (créateur de la mission ou admin)
CREATE POLICY "storage_mission_media_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'mission-media' AND EXISTS (
    SELECT 1 FROM public.missions m
    WHERE m.id::text = (storage.foldername(name))[1]
      AND (m.created_by = auth.uid() OR public.auth_is_super_admin())));

CREATE POLICY "storage_mission_media_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mission-media' AND EXISTS (
    SELECT 1 FROM public.missions m
    WHERE m.id::text = (storage.foldername(name))[1]
      AND (m.created_by = auth.uid() OR public.auth_is_super_admin())));

CREATE POLICY "storage_mission_media_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'mission-media' AND EXISTS (
    SELECT 1 FROM public.missions m
    WHERE m.id::text = (storage.foldername(name))[1]
      AND (m.created_by = auth.uid() OR public.auth_is_super_admin())));

-- slideshow : administrateurs uniquement
CREATE POLICY "storage_slideshow_admin" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'slideshow' AND public.auth_is_super_admin())
WITH CHECK (bucket_id = 'slideshow' AND public.auth_is_super_admin());

COMMIT;

-- ----------------------------------------------------------------------------
-- 11. Vérification (affiche les politiques en place)
-- ----------------------------------------------------------------------------
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN ('profiles', 'missions', 'structures', 'mission_media', 'site_config'))
   OR (schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'storage_%')
ORDER BY tablename, policyname;
