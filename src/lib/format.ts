import type { Mission, Profile, UserType } from '@/types/database.types';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Formate une date ISO (AAAA-MM-JJ) sans décalage de fuseau horaire. */
export function formatDate(value: string | null | undefined): string {
    if (!value) return '?';
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return '?';
    return dateFormatter.format(new Date(y, m - 1, d));
}

/** « Du 12/03/2026 au 20/03/2026 », ou chaîne vide si aucune date (missions historiques). */
export function formatDateRange(start: string | null, end: string | null): string {
    if (!start && !end) return '';
    return `Du ${formatDate(start)} au ${formatDate(end)}`;
}

/** Photo d'illustration (banque d'images) et non photo réelle de la mission. */
export function isIllustration(url: string | null | undefined): boolean {
    return !!url && url.startsWith('/illustrations/');
}

export function missionLocation(mission: Pick<Mission, 'city' | 'country' | 'location'>): string {
    return [mission.city, mission.country].filter(Boolean).join(', ') || mission.location || '';
}

export const USER_TYPE_LABELS: Record<UserType, string> = {
    voyageur: 'Voyageur solidaire',
    animateur: 'Animateur / Enseignant',
};

/** Le type est stocké dans user_type (choix du profil) ou role (valeur d'inscription). */
export function profileUserType(profile: Profile | null): UserType | null {
    const value = profile?.user_type ?? profile?.role;
    return value === 'voyageur' || value === 'animateur' ? value : null;
}

/** URL d'avatar avec cache-busting stable (change uniquement quand le profil est modifié). */
export function avatarSrc(profile: Profile | null): string | null {
    if (!profile?.avatar_url) return null;
    return `${profile.avatar_url}?v=${encodeURIComponent(profile.updated_at)}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
    return `${count} ${count > 1 ? plural : singular}`;
}
