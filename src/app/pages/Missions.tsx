import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, HandHeart, Heart, Plus, Receipt, Search, Users } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { fetchPhotosByMission } from '@/lib/missions';
import { useImpactMetrics } from '@/hooks/useSiteConfig';
import type { Mission } from '@/types/database.types';
import { MissionCard } from '../components/MissionCard';
import { MissionForm } from '../components/MissionForm';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { CardGridSkeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';

type Filter = 'active' | 'completed' | 'all';

export default function Missions() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const [missions, setMissions] = useState<Mission[] | null>(null);
    const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filter, setFilter] = useState<Filter>('all');
    const [query, setQuery] = useState('');

    const fetchMissions = useCallback(async () => {
        setError(null);
        try {
            const { data, error: fetchError } = await supabase.from('missions').select('*').eq('visible', true).order('created_at', { ascending: false });
            if (fetchError) throw fetchError;
            setMissions(data);
            const photos = await fetchPhotosByMission(data.filter(m => m.status === 'completed').map(m => m.id));
            setPhotoCounts(Object.fromEntries(Object.entries(photos).map(([id, list]) => [id, list.length])));
        } catch (err) {
            setError(errorMessage(err, 'Erreur lors du chargement des missions.'));
            setMissions([]);
        }
    }, []);

    useEffect(() => { fetchMissions(); }, [fetchMissions]);

    useEffect(() => {
        if (searchParams.get('create') === 'true' && user) {
            setIsFormOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, user, setSearchParams]);

    const startMission = () => (user ? setIsFormOpen(true) : navigate('/login?create=true'));

    const all = missions ?? [];
    const active = all.filter(m => m.status !== 'completed');
    const completed = all.filter(m => m.status === 'completed');
    const q = query.trim().toLocaleLowerCase('fr');
    // Missions réalisées mais non référencées : chiffre clé n°1 de l'accueil (modifiable en administration)
    // moins les missions réalisées publiées ici. Masqué si le résultat est nul ou négatif.
    const metrics = useImpactMetrics();
    const announced = Number.parseInt(metrics.value1.replace(/\D/g, ''), 10);
    const unlisted = Number.isFinite(announced) ? announced - completed.length : 0;

    const list = (filter === 'active' ? active : filter === 'completed' ? completed : all)
        .filter(m => !q || [m.title, m.city, m.country, m.description].some(v => v?.toLocaleLowerCase('fr').includes(q)));

    return (
        <div className="container-page pt-8 lg:pt-14">
            <PageHeader
                eyebrow="Missions"
                title="Les missions Playlife"
                description="Des voyageurs et des éducateurs qui remettent du matériel sportif à des enfants, partout dans le monde."
                actions={<Button size="lg" icon={Plus} onClick={startMission}>Créer une mission</Button>}
            />

            <div className="flex flex-col gap-3 border-b border-ink-900/[0.08] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <Tabs
                    label="Filtrer les missions"
                    value={filter}
                    onChange={setFilter}
                    options={[
                        { value: 'all', label: 'Toutes', count: all.length },
                        { value: 'active', label: 'En cours', count: active.length },
                        { value: 'completed', label: 'Réalisées', count: completed.length },
                    ]}
                />
                <div className="w-full sm:w-72">
                    <Input icon={Search} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un pays, une ville…" aria-label="Rechercher une mission" />
                </div>
            </div>

            <div className="mt-8">
                {error && (
                    <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-red-50 p-5 text-red-700 ring-1 ring-red-100 sm:flex-row sm:items-center" role="alert">
                        <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
                        <p className="flex-1 text-sm">{error}</p>
                        <Button variant="danger" size="sm" onClick={() => { setMissions(null); fetchMissions(); }}>Réessayer</Button>
                    </div>
                )}

                {missions === null ? (
                    <CardGridSkeleton count={6} />
                ) : list.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {list.map(m => <MissionCard key={m.id} mission={m} photoCount={photoCounts[m.id]} />)}
                        {unlisted > 0 && filter !== 'active' && !q && <UnlistedMissionsCard count={unlisted} />}
                    </div>
                ) : !error && (
                    <EmptyState
                        icon={Users}
                        title={q ? 'Aucune mission ne correspond' : filter === 'completed' ? 'Aucune mission terminée pour le moment' : 'Aucune mission en cours'}
                        description={q ? 'Essayez un autre mot-clé.' : 'Et si la prochaine mission était la vôtre ?'}
                        action={!q && <Button icon={Plus} onClick={startMission}>Créer une mission</Button>}
                    />
                )}
            </div>

            <section className="mt-20 grid gap-6 lg:grid-cols-[1fr_1fr_1fr]" aria-labelledby="tips-title">
                <div className="lg:pr-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Collecte</p>
                    <h2 id="tips-title" className="mt-3 text-2xl font-bold md:text-3xl">Conseils pour réussir votre cagnotte</h2>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06]">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><HandHeart className="size-5" aria-hidden="true" /></span>
                    <h3 className="mt-4 font-semibold">Communiquez largement</h3>
                    <p className="mt-2 text-sm text-gray-600">Partagez le lien de votre cagnotte à vos proches, votre entourage professionnel, sportif, associatif… Plus vous communiquez, plus vous augmentez vos chances de réussite.</p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06]">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><Receipt className="size-5" aria-hidden="true" /></span>
                    <h3 className="mt-4 font-semibold">Mettez en avant l'avantage fiscal</h3>
                    <p className="mt-2 text-sm text-gray-600">Via <a href="https://www.leetchi.com" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500">Leetchi</a>, chaque donateur reçoit <strong className="text-ink-900">automatiquement son reçu fiscal</strong> : <strong className="text-ink-900">66 % de réduction d'impôt</strong> pour les particuliers, 60 % pour les entreprises.</p>
                </div>
            </section>

            {isFormOpen && <MissionForm onClose={() => setIsFormOpen(false)} onSuccess={fetchMissions} />}
        </div>
    );
}

/** Carte « + N autres missions réalisées » pour les actions antérieures non référencées. */
function UnlistedMissionsCard({ count }: { count: number }) {
    return (
        <article className="relative flex min-h-80 flex-col justify-between overflow-hidden rounded-2xl bg-ink-900 p-6 text-white shadow-soft">
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
            <Heart className="relative size-8 fill-brand-500 text-brand-500" aria-hidden="true" />
            <div className="relative">
                <p className="text-6xl font-bold tabular-nums">+{count}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{count > 1 ? 'autres missions réalisées' : 'autre mission réalisée'}</h3>
                <p className="mt-2 text-sm text-ink-200">
                    Depuis 2018, Playlife a mené bien d'autres actions qui ne sont pas encore référencées sur la plateforme.
                </p>
            </div>
            <Link to="/qui-sommes-nous" className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white after:absolute after:inset-0 hover:text-brand-200">
                Découvrir l'association <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
        </article>
    );
}
