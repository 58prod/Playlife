-- ============================================================================
-- PLAYLIFE — ANNUAIRE DES STRUCTURES (carte)
-- ============================================================================
-- Ajoute la géolocalisation et le code pays aux structures, pour l'annuaire
-- cartographique. Idempotent. À exécuter AVANT les fichiers supabase/seed/annuaire-structures-*.sql
-- ============================================================================

ALTER TABLE public.structures ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE public.structures ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.structures ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.structures ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE public.structures ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.structures.country_code IS 'Code pays ISO 3166-1 alpha-2 (ex : SN)';
COMMENT ON COLUMN public.structures.google_place_id IS 'Identifiant Google Maps (évite les doublons à l''import)';
COMMENT ON COLUMN public.structures.source IS 'Origine de la fiche : proposition d''un utilisateur (NULL) ou import (ex : annuaire-2026)';

-- Clé d'unicité utilisée par l'import (ON CONFLICT)
CREATE UNIQUE INDEX IF NOT EXISTS structures_google_place_id_key
    ON public.structures (google_place_id) WHERE google_place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_structures_country_code ON public.structures (country_code);

-- Coordonnées cohérentes
ALTER TABLE public.structures DROP CONSTRAINT IF EXISTS structures_coordinates_check;
ALTER TABLE public.structures ADD CONSTRAINT structures_coordinates_check CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
);

-- ============================================================================
-- CONFIDENTIALITÉ — coordonnées réservées aux membres connectés
-- ============================================================================
-- Les visiteurs anonymes ne peuvent plus lire l'adresse, les contacts ni la
-- position exacte des structures (protection des enfants accueillis).
-- L'annuaire public passe par la fonction get_structures_annuaire() qui
-- arrondit la position (~10 km) pour les visiteurs non connectés.

REVOKE SELECT ON public.structures FROM anon;
GRANT SELECT (id, name, type, description, city, country, country_code, website_url, image_url, status, validated_by_playlife, created_at)
    ON public.structures TO anon;

DROP FUNCTION IF EXISTS public.get_structures_annuaire();
CREATE FUNCTION public.get_structures_annuaire()
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    description TEXT,
    city TEXT,
    country TEXT,
    country_code TEXT,
    website_url TEXT,
    image_url TEXT,
    validated_by_playlife BOOLEAN,
    created_at TIMESTAMPTZ,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    postal_code TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    google_place_id TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        s.id, s.name, s.type, s.description, s.city, s.country, s.country_code,
        s.website_url, s.image_url, s.validated_by_playlife, s.created_at,
        CASE WHEN auth.uid() IS NOT NULL THEN s.latitude  ELSE round(s.latitude::numeric, 1)::double precision  END,
        CASE WHEN auth.uid() IS NOT NULL THEN s.longitude ELSE round(s.longitude::numeric, 1)::double precision END,
        CASE WHEN auth.uid() IS NOT NULL THEN s.address END,
        CASE WHEN auth.uid() IS NOT NULL THEN s.postal_code END,
        CASE WHEN auth.uid() IS NOT NULL THEN s.contact_name END,
        CASE WHEN auth.uid() IS NOT NULL THEN s.contact_email END,
        CASE WHEN auth.uid() IS NOT NULL THEN s.contact_phone END,
        CASE WHEN auth.uid() IS NOT NULL THEN s.google_place_id END
    FROM public.structures s
    WHERE s.status = 'validée'
    ORDER BY s.name;
$$;

REVOKE ALL ON FUNCTION public.get_structures_annuaire() FROM public;
GRANT EXECUTE ON FUNCTION public.get_structures_annuaire() TO anon, authenticated;

COMMENT ON FUNCTION public.get_structures_annuaire() IS
    'Annuaire public des structures validées. Coordonnées complètes pour les membres connectés, position arrondie (~10 km) et sans contacts pour les visiteurs.';
