import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, Globe, LogIn, Mail, MapPin, Phone, Plus, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Structure } from '@/types/database.types';
import { StructureForm } from '@/app/components/StructureForm';
import { PageLoader } from '@/app/components/PageLoader';

export default function Structures() {
    const { user } = useAuth();
    const [structures, setStructures] = useState<Structure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [query, setQuery] = useState('');

    const fetchStructures = useCallback(async () => {
        const { data, error: fetchError } = await supabase
            .from('structures')
            .select('*')
            .eq('status', 'validée')
            .order('name');
        setError(!!fetchError);
        setStructures(data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchStructures(); }, [fetchStructures]);

    const normalized = query.trim().toLocaleLowerCase('fr');
    const filtered = normalized
        ? structures.filter(s => [s.name, s.city, s.country, s.type].some(v => v?.toLocaleLowerCase('fr').includes(normalized)))
        : structures;

    return (
        <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#22081c]">Structures partenaires</h1>
                    <p className="text-gray-500 mt-1">Des structures locales qui accueillent les packs Playlife.</p>
                </div>
                <button
                    type="button"
                    onClick={() => (user ? setIsFormOpen(true) : setShowLoginPrompt(true))}
                    className="flex items-center justify-center gap-2 bg-[#e6244d] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#c91d41] transition-colors"
                >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    Proposer une structure
                </button>
            </div>

            {showLoginPrompt && !user && (
                <div role="alert" className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <LogIn className="w-6 h-6 text-blue-600 shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                        <p className="font-semibold text-blue-900">Connexion requise</p>
                        <p className="text-sm text-blue-700 mt-1">Vous devez être connecté pour proposer une structure partenaire.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/login?redirect=/structures" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Se connecter</Link>
                        <button type="button" onClick={() => setShowLoginPrompt(false)} className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">Fermer</button>
                    </div>
                </div>
            )}

            {structures.length > 6 && (
                <div className="relative mb-6 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Rechercher par nom, ville, pays…"
                        aria-label="Rechercher une structure"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6244d]/20 focus:border-[#e6244d]"
                    />
                </div>
            )}

            {loading ? (
                <PageLoader label="Chargement des structures…" />
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(structure => <StructureCard key={structure.id} structure={structure} />)}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                    <p className="text-gray-600">
                        {error ? 'Impossible de charger les structures pour le moment.'
                            : normalized ? 'Aucune structure ne correspond à votre recherche.'
                            : 'Aucune structure partenaire pour le moment.'}
                    </p>
                </div>
            )}

            {isFormOpen && <StructureForm onClose={() => setIsFormOpen(false)} onSuccess={fetchStructures} />}
        </div>
    );
}

function StructureCard({ structure }: { structure: Structure }) {
    const place = [[structure.postal_code, structure.city].filter(Boolean).join(' '), structure.country].filter(Boolean).join(', ');
    return (
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                {structure.image_url ? (
                    <img src={structure.image_url} alt="" loading="lazy" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 bg-[#e6244d]/10 rounded-full flex items-center justify-center text-[#e6244d] font-bold shrink-0" aria-hidden="true">
                        {structure.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-[#22081c] break-words">{structure.name}</h2>
                    {structure.type && <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{structure.type}</span>}
                </div>
            </div>
            {structure.validated_by_playlife && (
                <p className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        Validée par Playlife
                    </span>
                </p>
            )}
            {structure.description && <p className="text-gray-600 text-sm flex-1 mb-4 whitespace-pre-line">{structure.description}</p>}
            <div className="mt-auto pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                {(structure.address || place) && (
                    <p className="flex gap-2"><MapPin className="w-3.5 h-3.5 text-[#e6244d] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{structure.address}{structure.address && place && <br />}{place}</span>
                    </p>
                )}
                {structure.contact_name && (
                    <p className="flex gap-2 font-bold text-gray-600"><User className="w-3.5 h-3.5 text-[#e6244d] shrink-0" aria-hidden="true" />{structure.contact_name}</p>
                )}
                {structure.contact_email && (
                    <a href={`mailto:${structure.contact_email}`} className="flex gap-2 hover:text-[#e6244d] break-all"><Mail className="w-3.5 h-3.5 text-[#e6244d] shrink-0" aria-hidden="true" />{structure.contact_email}</a>
                )}
                {structure.contact_phone && (
                    <a href={`tel:${structure.contact_phone.replace(/\s/g, '')}`} className="flex gap-2 hover:text-[#e6244d]"><Phone className="w-3.5 h-3.5 text-[#e6244d] shrink-0" aria-hidden="true" />{structure.contact_phone}</a>
                )}
                {structure.website_url && (
                    <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-[#e6244d] hover:underline font-bold">
                        <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />Visiter le site web
                    </a>
                )}
            </div>
        </article>
    );
}
