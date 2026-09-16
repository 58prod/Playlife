// Notifie l'équipe Playlife par email lorsqu'une mission est créée (à modérer).
// Déploiement : npx supabase functions deploy notify-new-mission --no-verify-jwt
// (le JWT est vérifié ci-dessous, compatible avec les nouvelles clés de signature)
// Secrets : RESEND_API_KEY (obligatoire), NOTIFY_TO_EMAIL, NOTIFY_FROM_EMAIL, SITE_URL (optionnels)
import { createClient } from 'npm:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TO_EMAIL = Deno.env.get('NOTIFY_TO_EMAIL') ?? 'missions@playlife.today';
const FROM_EMAIL = Deno.env.get('NOTIFY_FROM_EMAIL') ?? 'Playlife Connect <noreply@playlife.today>';
const SITE_URL = (Deno.env.get('SITE_URL') ?? 'https://playlife.today').replace(/\/$/, '');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

Deno.serve(async req => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const jwt = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
        auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await admin.auth.getUser(jwt);
    if (authError || !user) return json({ error: 'Unauthorized' }, 401);

    let missionId: unknown;
    try {
        ({ missionId } = await req.json());
    } catch {
        return json({ error: 'JSON invalide' }, 400);
    }
    if (typeof missionId !== 'string') return json({ error: 'missionId est requis' }, 400);

    // Les informations sont relues en base : on ne fait pas confiance au contenu envoyé par le client
    const { data: mission, error: missionError } = await admin
        .from('missions')
        .select('id, title, city, country, start_date, end_date, mission_type, created_by, visible')
        .eq('id', missionId)
        .maybeSingle();

    if (missionError || !mission) return json({ error: 'Mission introuvable' }, 404);
    if (mission.created_by !== user.id) return json({ error: 'Forbidden' }, 403);
    if (mission.visible) return json({ sent: false, reason: 'already_published' });

    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY non configurée — email non envoyé');
        return json({ sent: false, reason: 'no_api_key' });
    }

    const place = [mission.city, mission.country].filter(Boolean).join(', ');
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            subject: `[Playlife] Nouvelle mission à valider : ${mission.title}`,
            html: `
                <h2>Nouvelle mission en attente de validation</h2>
                <p><strong>Titre :</strong> ${escapeHtml(mission.title)}</p>
                <p><strong>Type :</strong> ${escapeHtml(mission.mission_type ?? '—')}</p>
                <p><strong>Lieu :</strong> ${escapeHtml(place || '—')}</p>
                <p><strong>Dates :</strong> ${escapeHtml(`${mission.start_date ?? '?'} → ${mission.end_date ?? '?'}`)}</p>
                <p><strong>Créée par :</strong> ${escapeHtml(user.email ?? user.id)}</p>
                <p><a href="${SITE_URL}/settings">Ouvrir l'administration pour la publier</a></p>
            `,
        }),
    });

    if (!res.ok) {
        console.error('Erreur Resend :', await res.text());
        return json({ sent: false, error: 'email_failed' }, 502);
    }
    return json({ sent: true });
});
