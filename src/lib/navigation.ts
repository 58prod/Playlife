/** Destination après connexion : ?redirect=/chemin (interne uniquement) ou ?create=true */
export function postAuthDestination(params: URLSearchParams): string {
    if (params.get('create') === 'true') return '/missions?create=true';
    const redirect = params.get('redirect');
    return redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard';
}
