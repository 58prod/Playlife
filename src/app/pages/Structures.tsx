import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, Building2, Globe, Mail, MapPin, Phone, Plus, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Structure } from '@/types/database.types';
import { StructureForm } from '../components/StructureForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Select } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';

export default function Structures() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [structures, setStructures] = useState<Structure[] | null>(null);
    const [error, setError] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState('');

    const fetchStructures = useCallback(async () => {
        const { data, error: fetchError } = await supabase.from('structures').select('*').eq('status', 'validée').order('name');
        setError(!!fetchError);
        setStructures(data ?? []);
    }, []);

    useEffect(() => { fetchStructures(); }, [fetchStructures]);

    const countries = useMemo(() => [...new Set((structures ?? []).map(s => s.country).filter((c): c is string => !!c))].sort((a, b) => a.localeCompare(b, 'fr')), [structures]);

    const q = query.trim().toLocaleLowerCase('fr');
    const filtered = (structures ?? []).filter(s =>
        (!country || s.country === country) &&
        (!q || [s.name, s.city, s.country, s.type, s.description].some(v => v?.toLocaleLowerCase('fr').includes(q))));

    const propose = () => (user ? setIsFormOpen(true) : navigate('/login?redirect=/structures'));

    return (
        <div className="container-page pt-8 lg:pt-14">
            <PageHeader
                eyebrow="Annuaire"
                title="Structures partenaires"
                description="Clubs, écoles, associations : les structures locales qui accueillent les packs Playlife."
                actions={<Button size="lg" variant="secondary" icon={Plus} onClick={propose}>Proposer une structure</Button>}
            />

            <div className="flex flex-col gap-3 border-b border-ink-900/[0.08] pb-6 sm:flex-row">
                <div className="flex-1 sm:max-w-sm">
                    <Input icon={Search} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom, ville, type de structure…" aria-label="Rechercher une structure" />
                </div>
                {countries.length > 1 && (
                    <div className="sm:w-56">
                        <Select value={country} onChange={e => setCountry(e.target.value)} aria-label="Filtrer par pays">
                            <option value="">Tous les pays</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </div>
                )}
            </div>

            <div className="mt-8">
                {structures === null ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {[0, 1, 2].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(structure => <StructureCard key={structure.id} structure={structure} />)}
                    </div>
                ) : (
                    <EmptyState
                        icon={Building2}
                        title={error ? 'Impossible de charger les structures' : q || country ? 'Aucune structure ne correspond' : 'L\'annuaire se construit'}
                        description={error ? 'Merci de réessayer dans quelques instants.' : q || country ? 'Essayez une autre recherche.' : 'Vous connaissez une structure qui pourrait accueillir un pack ? Proposez-la à l\'équipe Playlife.'}
                        action={!error && !q && !country && <Button icon={Plus} onClick={propose}>Proposer une structure</Button>}
                    />
                )}
            </div>

            {isFormOpen && <StructureForm onClose={() => setIsFormOpen(false)} onSuccess={fetchStructures} />}
        </div>
    );
}

function StructureCard({ structure }: { structure: Structure }) {
    const place = [[structure.postal_code, structure.city].filter(Boolean).join(' '), structure.country].filter(Boolean).join(', ');
    const row = 'flex items-start gap-2.5 text-sm text-gray-600';
    return (
        <article className="flex flex-col rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06] transition hover:shadow-lift">
            <div className="flex items-start gap-4">
                {structure.image_url ? (
                    <img src={structure.image_url} alt="" loading="lazy" className="size-12 rounded-xl object-cover" />
                ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink-900 font-display text-lg font-bold text-white" aria-hidden="true">
                        {structure.name.charAt(0).toUpperCase()}
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold leading-snug">{structure.name}</h2>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {structure.type && <Badge tone="ink">{structure.type}</Badge>}
                        {structure.validated_by_playlife && <Badge tone="success" icon={BadgeCheck}>Validée par Playlife</Badge>}
                    </div>
                </div>
            </div>
            {structure.description && <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm text-gray-600">{structure.description}</p>}
            <div className="mt-auto space-y-2 border-t border-gray-100 pt-5 [&:not(:first-child)]:mt-5">
                {(structure.address || place) && (
                    <p className={row}><MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" /><span>{structure.address}{structure.address && place && <br />}{place}</span></p>
                )}
                {structure.contact_name && <p className={row}><User className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" /><span className="font-medium text-ink-900">{structure.contact_name}</span></p>}
                {structure.contact_email && (
                    <a href={`mailto:${structure.contact_email}`} className={`${row} break-all hover:text-brand-600`}><Mail className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />{structure.contact_email}</a>
                )}
                {structure.contact_phone && (
                    <a href={`tel:${structure.contact_phone.replace(/\s/g, '')}`} className={`${row} hover:text-brand-600`}><Phone className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />{structure.contact_phone}</a>
                )}
                {structure.website_url && (
                    <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
                        <Globe className="size-4" aria-hidden="true" /> Site web <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </a>
                )}
            </div>
        </article>
    );
}
