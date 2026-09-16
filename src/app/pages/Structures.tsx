import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, Building2, Globe, List, Lock, Mail, Map as MapIcon, MapPin, Navigation, Phone, Plus, Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';
import { countryFlag, countryKey, countryLabel, fetchAnnuaire, googleMapsUrl, hasCoordinates, normalize } from '@/lib/structures';
import type { Structure } from '@/types/database.types';
import { StructureForm } from '../components/StructureForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Select } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';

const StructuresMap = lazy(() => import('../components/StructuresMap'));

const PAGE = 30;
const numberFormat = new Intl.NumberFormat('fr-FR');

export default function Structures() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [structures, setStructures] = useState<Structure[] | null>(null);
    const [error, setError] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState('');
    const [type, setType] = useState('');
    const [visible, setVisible] = useState(PAGE);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
    const listRef = useRef<HTMLDivElement>(null);
    const deferredQuery = useDeferredValue(query);

    const load = useCallback(async () => {
        try {
            setStructures(await fetchAnnuaire());
            setError(false);
        } catch {
            setError(true);
            setStructures([]);
        }
    }, []);

    useEffect(() => { load(); }, [load, user?.id]);

    const all = structures ?? [];

    const countries = useMemo(() => {
        const counts = new Map<string, { label: string; count: number }>();
        for (const s of all) {
            const key = countryKey(s);
            if (!key) continue;
            const entry = counts.get(key) ?? { label: countryLabel(s), count: 0 };
            entry.count++;
            counts.set(key, entry);
        }
        return [...counts.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label, 'fr'));
    }, [all]);

    const types = useMemo(() => {
        const counts = new Map<string, number>();
        for (const s of all) if (s.type) counts.set(s.type, (counts.get(s.type) ?? 0) + 1);
        return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    }, [all]);

    const filtered = useMemo(() => {
        const q = normalize(deferredQuery.trim());
        return all.filter(s =>
            (!country || countryKey(s) === country) &&
            (!type || s.type === type) &&
            (!q || normalize([s.name, s.city, countryLabel(s), s.type, s.description].join(' ')).includes(q)));
    }, [all, country, type, deferredQuery]);

    // Revenir en haut de la liste quand les filtres changent
    useEffect(() => {
        setVisible(PAGE);
        setSelectedId(null);
        listRef.current?.scrollTo({ top: 0 });
    }, [country, type, deferredQuery]);

    const selectFromMap = (id: string) => {
        const index = filtered.findIndex(s => s.id === id);
        if (index >= visible) setVisible(Math.ceil((index + 1) / PAGE) * PAGE);
        setSelectedId(id);
        requestAnimationFrame(() => document.getElementById(`structure-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    };

    const showOnMap = (id: string) => {
        setSelectedId(id);
        setMobileView('map');
    };

    const propose = () => (user ? setIsFormOpen(true) : navigate('/login?redirect=/structures'));
    const hasFilters = !!(query || country || type);
    const resetFilters = () => { setQuery(''); setCountry(''); setType(''); };

    return (
        <div className="container-page pt-8 lg:pt-14">
            <PageHeader
                eyebrow="Annuaire"
                title="Les structures qui accueillent les enfants"
                description={structures
                    ? <>Orphelinats, foyers, associations et écoles : <strong className="text-ink-900">{numberFormat.format(all.length)} structures</strong> dans <strong className="text-ink-900">{countries.length} pays</strong>, pour trouver où remettre votre pack.</>
                    : 'Orphelinats, foyers, associations et écoles, partout dans le monde.'}
                actions={<Button size="lg" variant="secondary" icon={Plus} onClick={propose}>Proposer une structure</Button>}
            />

            {/* Filtres */}
            <div className="space-y-3 border-b border-ink-900/[0.08] pb-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Input icon={Search} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom, ville, pays…" aria-label="Rechercher une structure" className="h-11" />
                    </div>
                    <div className="sm:w-64">
                        <Select value={country} onChange={e => setCountry(e.target.value)} aria-label="Filtrer par pays" className="h-11">
                            <option value="">Tous les pays ({countries.length})</option>
                            {countries.map(([key, { label, count }]) => (
                                <option key={key} value={key}>{countryFlag(key.length === 2 ? key : null)} {label} ({count})</option>
                            ))}
                        </Select>
                    </div>
                </div>
                {types.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filtrer par type">
                        {[['', all.length] as const, ...types].map(([value, count]) => (
                            <button
                                key={value || 'all'}
                                type="button"
                                onClick={() => setType(value)}
                                aria-pressed={type === value}
                                className={cn('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition',
                                    type === value ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-800 ring-gray-200 hover:ring-gray-300')}
                            >
                                {value || 'Tous les types'}
                                <span className={cn('text-xs tabular-nums', type === value ? 'text-ink-200' : 'text-gray-500')}>{numberFormat.format(count)}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Résultats */}
            <div className="flex items-center justify-between gap-3 py-4">
                <p className="text-sm text-gray-600" aria-live="polite">
                    {structures === null ? 'Chargement…' : <><strong className="text-ink-900">{numberFormat.format(filtered.length)}</strong> {filtered.length > 1 ? 'structures' : 'structure'}</>}
                    {hasFilters && <button type="button" onClick={resetFilters} className="ml-3 inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"><X className="size-3.5" aria-hidden="true" />Effacer les filtres</button>}
                </p>
                <div className="inline-flex rounded-xl bg-ink-900/[0.05] p-1 lg:hidden" role="group" aria-label="Affichage">
                    {([['list', 'Liste', List], ['map', 'Carte', MapIcon]] as const).map(([value, label, Icon]) => (
                        <button key={value} type="button" onClick={() => setMobileView(value)} aria-pressed={mobileView === value}
                            className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition', mobileView === value ? 'bg-white text-ink-900 shadow-soft' : 'text-gray-600')}>
                            <Icon className="size-4" aria-hidden="true" />{label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                {/* Liste */}
                <div ref={listRef} className={cn('lg:h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-2 lg:[scrollbar-width:thin]', mobileView === 'map' && 'hidden lg:block')}>
                    {structures === null ? (
                        <div className="space-y-3">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            icon={Building2}
                            title={error ? 'Impossible de charger l\'annuaire' : 'Aucune structure ne correspond'}
                            description={error ? 'Merci de réessayer dans quelques instants.' : 'Essayez un autre mot-clé ou un autre pays.'}
                            action={error ? <Button variant="secondary" onClick={load}>Réessayer</Button> : hasFilters && <Button variant="secondary" onClick={resetFilters}>Effacer les filtres</Button>}
                        />
                    ) : (
                        <ul className="space-y-3">
                            {filtered.slice(0, visible).map(structure => (
                                <li key={structure.id} id={`structure-${structure.id}`}>
                                    <StructureItem structure={structure} selected={structure.id === selectedId} isMember={!!user} onShowOnMap={hasCoordinates(structure) ? () => showOnMap(structure.id) : undefined} />
                                </li>
                            ))}
                            {visible < filtered.length && (
                                <li className="pt-2 text-center">
                                    <Button variant="secondary" onClick={() => setVisible(v => v + PAGE)}>
                                        Afficher plus ({numberFormat.format(filtered.length - visible)} restantes)
                                    </Button>
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {/* Carte */}
                <div className={cn('lg:sticky lg:top-24 lg:self-start', mobileView === 'list' && 'hidden lg:block')}>
                    <div className="relative isolate h-[70dvh] overflow-hidden rounded-3xl ring-1 ring-ink-900/[0.08] shadow-soft lg:h-[calc(100dvh-8rem)]">
                        <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
                            <StructuresMap structures={filtered} selectedId={selectedId} onSelect={selectFromMap} precise={!!user} className="size-full" />
                        </Suspense>
                        {!user && structures !== null && (
                            <p className="pointer-events-none absolute inset-x-3 top-3 z-[400] mx-auto w-fit max-w-[calc(100%-1.5rem)] rounded-full bg-white/95 px-3.5 py-1.5 text-center text-xs text-gray-600 shadow-soft backdrop-blur">
                                <Lock className="mr-1 inline size-3 -translate-y-px" aria-hidden="true" />Positions approximatives · adresses précises réservées aux membres
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {isFormOpen && <StructureForm onClose={() => setIsFormOpen(false)} onSuccess={load} />}
        </div>
    );
}

function StructureItem({ structure, selected, isMember, onShowOnMap }: { structure: Structure; selected: boolean; isMember: boolean; onShowOnMap?: () => void }) {
    const place = [structure.city, countryLabel(structure)].filter(Boolean).join(', ');
    const maps = googleMapsUrl(structure);
    const flag = countryFlag(structure.country_code);
    const action = 'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-800 ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 hover:ring-gray-300';

    return (
        <article className={cn('rounded-2xl bg-white p-4 shadow-soft ring-1 transition md:p-5', selected ? 'ring-2 ring-brand-500' : 'ring-ink-900/[0.06] hover:ring-ink-900/[0.12]')}>
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-xl" aria-hidden="true">
                    {flag || <Building2 className="size-5 text-ink-400" />}
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold leading-snug break-words">{structure.name}</h2>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600"><MapPin className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{place || 'Localisation non précisée'}</span></p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {structure.type && <Badge tone="ink">{structure.type}</Badge>}
                        {structure.validated_by_playlife && <Badge tone="success" icon={BadgeCheck}>Partenaire Playlife</Badge>}
                    </div>
                </div>
            </div>

            {structure.description && <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-gray-600">{structure.description}</p>}
            {(structure.address || structure.contact_name) && (
                <p className="mt-3 text-xs text-gray-500">{[structure.address, structure.postal_code].filter(Boolean).join(', ')}{structure.contact_name && ` · Contact : ${structure.contact_name}`}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                {onShowOnMap && <button type="button" onClick={onShowOnMap} className={action}><Navigation className="size-3.5" aria-hidden="true" />Voir sur la carte</button>}
                {structure.contact_phone && <a href={`tel:${structure.contact_phone.replace(/[^\d+]/g, '')}`} className={action}><Phone className="size-3.5" aria-hidden="true" />{structure.contact_phone}</a>}
                {structure.contact_email && <a href={`mailto:${structure.contact_email}`} className={action}><Mail className="size-3.5" aria-hidden="true" />Email</a>}
                {structure.website_url && <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className={action}><Globe className="size-3.5" aria-hidden="true" />Site web<ArrowUpRight className="size-3" aria-hidden="true" /></a>}
                {isMember && maps && <a href={maps} target="_blank" rel="noopener noreferrer" className={action}><MapPin className="size-3.5" aria-hidden="true" />Google Maps<ArrowUpRight className="size-3" aria-hidden="true" /></a>}
                {!isMember && (
                    <Link to="/login?redirect=/structures" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface-100 px-2.5 text-xs font-medium text-ink-800 transition hover:bg-surface-200">
                        <Lock className="size-3.5" aria-hidden="true" />Coordonnées réservées aux membres · Se connecter
                    </Link>
                )}
            </div>
        </article>
    );
}
