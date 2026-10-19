-- ============================================================================
-- Troisième type de profil : « autre »
--
-- À l'inscription, le visiteur choisit entre « Voyageur solidaire »,
-- « Animateur / Enseignant » et « Autre ». Le trigger ne connaissait que les
-- deux premiers et rabattait tout le reste sur « voyageur » : un membre qui
-- choisissait « Autre » se retrouvait donc enregistré comme voyageur.
--
-- Les colonnes profiles.role et profiles.user_type sont de simples TEXT sans
-- contrainte : il n'y a aucun type énuméré à faire évoluer, seule la fonction
-- appelée à la création du compte change.
--
-- Le type des missions (missions.mission_type) n'est pas concerné : une mission
-- reste portée soit par un voyageur, soit par un groupe.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_type TEXT := CASE
        WHEN NEW.raw_user_meta_data->>'role' IN ('voyageur', 'animateur', 'autre')
            THEN NEW.raw_user_meta_data->>'role'
        ELSE 'voyageur'
    END;
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

COMMENT ON COLUMN public.profiles.user_type IS 'Type d''utilisateur (voyageur/animateur/autre)';
