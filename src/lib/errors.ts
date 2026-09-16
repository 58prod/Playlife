const KNOWN_MESSAGES: Array<[RegExp, string]> = [
    [/invalid login credentials/i, 'Email ou mot de passe incorrect.'],
    [/email not confirmed/i, 'Veuillez confirmer votre adresse email (lien reçu par email) avant de vous connecter.'],
    [/user already registered/i, 'Un compte existe déjà avec cette adresse email.'],
    [/password should be at least (\d+)/i, 'Le mot de passe doit contenir au moins $1 caractères.'],
    [/rate limit|too many requests/i, 'Trop de tentatives. Merci de réessayer dans quelques minutes.'],
    [/new password should be different/i, 'Le nouveau mot de passe doit être différent de l\'ancien.'],
    [/row-level security|permission denied/i, 'Action non autorisée.'],
    [/failed to fetch|network/i, 'Connexion au serveur impossible. Vérifiez votre connexion internet.'],
];

/** Traduit une erreur Supabase/JS en message lisible en français. */
export function errorMessage(error: unknown, fallback = 'Une erreur inattendue est survenue.'): string {
    const raw = error instanceof Error ? error.message
        : typeof error === 'object' && error && 'message' in error ? String((error as { message: unknown }).message)
        : '';
    if (!raw) return fallback;
    for (const [pattern, message] of KNOWN_MESSAGES) {
        const match = raw.match(pattern);
        if (match) return message.replace('$1', match[1] ?? '');
    }
    return raw;
}
