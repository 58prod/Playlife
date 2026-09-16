import { supabase } from '@/lib/supabase';
import type { Structure } from '@/types/database.types';

/** Nombre maximal de lignes renvoyées par Supabase en une requête. */
const PAGE_SIZE = 1000;

/** Charge toutes les structures (Supabase limite chaque requête à 1 000 lignes). */
export async function fetchAllStructures(options: { onlyValidated?: boolean } = {}): Promise<Structure[]> {
    const all: Structure[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
        let query = supabase.from('structures').select('*').order('name').range(from, from + PAGE_SIZE - 1);
        if (options.onlyValidated) query = query.eq('status', 'validée');
        const { data, error } = await query;
        if (error) throw error;
        all.push(...data);
        if (data.length < PAGE_SIZE) return all;
    }
}

/**
 * Annuaire public (structures validées), via la fonction SQL get_structures_annuaire() :
 * les visiteurs non connectés reçoivent une position arrondie (~10 km) et aucun contact.
 */
export async function fetchAnnuaire(): Promise<Structure[]> {
    const all: Structure[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase.rpc('get_structures_annuaire').range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        all.push(...data.map(row => ({ status: 'validée' as const, origin_info: null, created_by: null, source: null, ...row })));
        if (data.length < PAGE_SIZE) return all;
    }
}

const regionNames = new Intl.DisplayNames(['fr'], { type: 'region' });

/** Nom du pays en français, à partir du code ISO si disponible. */
export function countryLabel(structure: Pick<Structure, 'country' | 'country_code'>): string {
    if (structure.country_code) {
        try { return regionNames.of(structure.country_code) ?? structure.country ?? ''; } catch { /* code invalide */ }
    }
    return structure.country ?? '';
}

/** Emoji drapeau à partir d'un code pays ISO (ex : SN → 🇸🇳). */
export function countryFlag(code: string | null | undefined): string {
    if (!code || !/^[A-Z]{2}$/i.test(code)) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Clé de regroupement par pays (code ISO ou nom). */
export function countryKey(structure: Pick<Structure, 'country' | 'country_code'>): string {
    return structure.country_code ?? structure.country ?? '';
}

/** Texte normalisé pour la recherche : minuscules, sans accents. */
export function normalize(value: string | null | undefined): string {
    return (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function googleMapsUrl(structure: Pick<Structure, 'name' | 'google_place_id' | 'latitude' | 'longitude'>): string | null {
    if (structure.google_place_id) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(structure.name)}&query_place_id=${structure.google_place_id}`;
    }
    if (structure.latitude != null && structure.longitude != null) {
        return `https://www.google.com/maps/search/?api=1&query=${structure.latitude},${structure.longitude}`;
    }
    return null;
}

export function hasCoordinates(structure: Structure): structure is Structure & { latitude: number; longitude: number } {
    return structure.latitude != null && structure.longitude != null;
}
