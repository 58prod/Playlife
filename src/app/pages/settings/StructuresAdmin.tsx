import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Building2, CheckCircle, ChevronDown, Edit2, Plus, Save, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { STRUCTURE_TYPES } from '@/lib/countries';
import { formatDate } from '@/lib/format';
import { countryLabel, fetchAllStructures, normalize } from '@/lib/structures';
import type { Database, Structure, StructureStatus } from '@/types/database.types';

type StructureUpdate = Database['public']['Tables']['structures']['Update'];
import { useConfirm } from '@/app/components/ConfirmDialog';
import { adminInputClass, EmptyState, FilterTabs, paginate, Pagination, SectionTitle } from './shared';

type Filter = 'pending' | 'validated' | 'refused' | 'all';

const EDITABLE_FIELDS = ['name', 'type', 'status', 'address', 'postal_code', 'city', 'country', 'contact_name', 'contact_email', 'contact_phone', 'website_url', 'description'] as const;
type EditableStructure = { [K in (typeof EDITABLE_FIELDS)[number]]: string };

const EMPTY_STRUCTURE: EditableStructure = {
    name: '', type: '', status: 'validée', address: '', postal_code: '', city: '', country: '',
    contact_name: '', contact_email: '', contact_phone: '', website_url: '', description: '',
};

const STATUS_BADGES: Record<StructureStatus, { label: string; className: string }> = {
    'validée': { label: 'Validée', className: 'bg-green-100 text-green-700' },
    'refusée': { label: 'Refusée', className: 'bg-red-100 text-red-700' },
    'à valider playlife': { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
};

function toEditable(structure: Structure): EditableStructure {
    return Object.fromEntries(EDITABLE_FIELDS.map(k => [k, (structure[k] as string | null) ?? ''])) as EditableStructure;
}

function toPayload(data: EditableStructure): StructureUpdate & { name: string } {
    const entries = EDITABLE_FIELDS.map(k => [k, data[k].trim() || null]);
    return { ...Object.fromEntries(entries), name: data.name.trim(), status: data.status as StructureStatus };
}

export function StructuresAdmin() {
    const { user } = useAuth();
    const confirm = useConfirm();
    const [structures, setStructures] = useState<Structure[]>([]);
    const [filter, setFilter] = useState<Filter>('pending');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<EditableStructure>(EMPTY_STRUCTURE);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState('');

    const fetchStructures = useCallback(async () => {
        try {
            const data = await fetchAllStructures();
            setStructures(data.sort((a, b) => b.created_at.localeCompare(a.created_at)));
        } catch (error) {
            toast.error(`Chargement des structures impossible : ${errorMessage(error)}`);
        }
    }, []);

    useEffect(() => { fetchStructures(); }, [fetchStructures]);

    const q = normalize(search.trim());
    const searched = q ? structures.filter(s => normalize([s.name, s.city, countryLabel(s), s.type, s.origin_info].join(' ')).includes(q)) : structures;
    const byStatus = (status: StructureStatus) => searched.filter(s => (s.status ?? 'à valider playlife') === status);
    const lists: Record<Filter, Structure[]> = {
        pending: byStatus('à valider playlife'),
        validated: byStatus('validée'),
        refused: byStatus('refusée'),
        all: searched,
    };
    const { pageItems, totalPages, safePage } = paginate(lists[filter], page);

    const update = async (id: string, changes: StructureUpdate, successMessage: string) => {
        const { error } = await supabase.from('structures').update(changes).eq('id', id);
        if (error) { toast.error(errorMessage(error)); return false; }
        toast.success(successMessage);
        await fetchStructures();
        return true;
    };

    const handleDelete = async (structure: Structure) => {
        const ok = await confirm({ title: 'Supprimer cette structure ?', message: <>« {structure.name} » sera définitivement supprimée.</>, confirmLabel: 'Supprimer', danger: true });
        if (!ok) return;
        const { error } = await supabase.from('structures').delete().eq('id', structure.id);
        if (error) { toast.error(errorMessage(error)); return; }
        toast.success('Structure supprimée.');
        fetchStructures();
    };

    const startEditing = (structure: Structure) => {
        setCreating(false);
        setDraft(toEditable(structure));
        setEditingId(structure.id);
        setExpandedId(structure.id);
    };

    const saveEdit = async () => {
        if (!editingId || !draft.name.trim()) { toast.error('Le nom est requis.'); return; }
        if (await update(editingId, toPayload(draft), 'Structure enregistrée.')) setEditingId(null);
    };

    const saveNew = async () => {
        if (!draft.name.trim()) { toast.error('Le nom est requis.'); return; }
        const { error } = await supabase.from('structures').insert({ ...toPayload(draft), created_by: user?.id ?? null });
        if (error) { toast.error(errorMessage(error)); return; }
        toast.success('Structure créée.');
        setCreating(false);
        fetchStructures();
    };

    const editor = (onSave: () => void, onCancel: () => void, idPrefix: string) => (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {([
                    ['name', 'Nom *', 'md:col-span-2'], ['type', 'Type'], ['status', 'Statut'], ['address', 'Adresse', 'md:col-span-2'],
                    ['postal_code', 'Code postal'], ['city', 'Ville'], ['country', 'Pays'], ['contact_name', 'Contact'],
                    ['contact_email', 'Email'], ['contact_phone', 'Téléphone'], ['website_url', 'Site web', 'md:col-span-2'], ['description', 'Description', 'md:col-span-2'],
                ] as const).map(([key, label, span]) => {
                    const id = `${idPrefix}-${key}`;
                    const common = { id, value: draft[key], className: adminInputClass };
                    return (
                        <div key={key} className={span ?? ''}>
                            <label htmlFor={id} className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                            {key === 'status' ? (
                                <select {...common} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}>
                                    <option value="à valider playlife">En attente</option>
                                    <option value="validée">Validée</option>
                                    <option value="refusée">Refusée</option>
                                </select>
                            ) : key === 'type' ? (
                                <>
                                    <input {...common} list="structure-types" onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} />
                                    <datalist id="structure-types">{STRUCTURE_TYPES.map(t => <option key={t} value={t} />)}</datalist>
                                </>
                            ) : key === 'description' ? (
                                <textarea {...common} rows={3} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
                            ) : (
                                <input {...common} type={key === 'contact_email' ? 'email' : key === 'website_url' ? 'url' : 'text'} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    <Save className="w-4 h-4" aria-hidden="true" /> Enregistrer
                </button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Annuler</button>
            </div>
        </div>
    );

    return (
        <section className="mb-12" aria-label="Structures">
            <SectionTitle icon={Building2} title="Structures" count={structures.length}>
                <button type="button" onClick={() => { setCreating(v => !v); setEditingId(null); setDraft(EMPTY_STRUCTURE); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-ink-900 text-white rounded-xl text-sm font-medium hover:bg-ink-950 transition-colors">
                    <Plus className="w-4 h-4" aria-hidden="true" /> Ajouter une structure
                </button>
            </SectionTitle>

            {creating && (
                <div className="mb-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06]">
                    <h3 className="font-bold text-ink-900 mb-4">Nouvelle structure</h3>
                    {editor(saveNew, () => setCreating(false), 'new-structure')}
                </div>
            )}

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <input
                    type="search"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Rechercher (nom, ville, pays, catégorie…)"
                    aria-label="Rechercher une structure"
                    className={`${adminInputClass} lg:max-w-sm`}
                />
                <FilterTabs
                    label="Filtrer les structures"
                    value={filter}
                    onChange={v => { setFilter(v); setPage(1); setExpandedId(null); setEditingId(null); }}
                    options={[
                        { value: 'pending', label: 'À valider', count: lists.pending.length },
                        { value: 'validated', label: 'Validées', count: lists.validated.length },
                        { value: 'refused', label: 'Refusées', count: lists.refused.length },
                        { value: 'all', label: 'Toutes', count: searched.length },
                    ]}
                />
            </div>

            {pageItems.length === 0 ? (
                <EmptyState>{filter === 'pending' ? 'Aucune structure en attente de validation. 🎉' : 'Aucune structure.'}</EmptyState>
            ) : (
                <>
                    <ul className="grid grid-cols-1 gap-3">
                        {pageItems.map(structure => {
                            const expanded = expandedId === structure.id;
                            const status = structure.status ?? 'à valider playlife';
                            const badge = STATUS_BADGES[status];
                            return (
                                <li key={structure.id} className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-900/[0.06]">
                                    <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <button type="button" onClick={() => setExpandedId(expanded ? null : structure.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left" aria-expanded={expanded}>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                                            <span className="flex-1 min-w-0">
                                                <span className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-ink-900 break-words">{structure.name}</span>
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${badge.className}`}>{badge.label}</span>
                                                    {structure.validated_by_playlife && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-200">
                                                            <BadgeCheck className="w-3 h-3" aria-hidden="true" /> Label Playlife
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="block text-xs text-gray-500 mt-0.5">{[structure.type, [structure.city, countryLabel(structure)].filter(Boolean).join(', '), structure.source && 'import annuaire'].filter(Boolean).join(' · ')}</span>
                                            </span>
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            {status !== 'validée' && (
                                                <button type="button" onClick={() => update(structure.id, { status: 'validée' }, 'Structure validée.')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                                    <CheckCircle className="w-4 h-4" aria-hidden="true" /> Valider
                                                </button>
                                            )}
                                            {status !== 'refusée' && (
                                                <button type="button" onClick={() => update(structure.id, { status: 'refusée', validated_by_playlife: false }, 'Structure refusée.')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                                    <XCircle className="w-4 h-4" aria-hidden="true" /> Refuser
                                                </button>
                                            )}
                                            {status === 'validée' && (
                                                <button type="button" aria-pressed={!!structure.validated_by_playlife}
                                                    onClick={() => update(structure.id, { validated_by_playlife: !structure.validated_by_playlife }, structure.validated_by_playlife ? 'Label retiré.' : 'Label Playlife attribué.')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                                                    title="Label « Validée par Playlife » affiché sur la fiche publique">
                                                    <BadgeCheck className="w-4 h-4" aria-hidden="true" /> {structure.validated_by_playlife ? 'Retirer le label' : 'Label Playlife'}
                                                </button>
                                            )}
                                            <button type="button" onClick={() => startEditing(structure)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-500 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors">
                                                <Edit2 className="w-4 h-4" aria-hidden="true" /> Modifier
                                            </button>
                                            <button type="button" onClick={() => handleDelete(structure)} className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors" aria-label={`Supprimer ${structure.name}`}>
                                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                    {expanded && (
                                        <div className="border-t border-gray-100 bg-surface-50 p-4 text-sm">
                                            {editingId === structure.id ? editor(saveEdit, () => setEditingId(null), `edit-${structure.id}`) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                    {structure.description && <p className="md:col-span-2 text-gray-700 whitespace-pre-line">{structure.description}</p>}
                                                    {structure.contact_name && <p><span className="text-gray-500">Contact :</span> <span className="font-medium">{structure.contact_name}</span></p>}
                                                    {structure.contact_email && <p><span className="text-gray-500">Email :</span> <a href={`mailto:${structure.contact_email}`} className="font-medium hover:text-brand-500 break-all">{structure.contact_email}</a></p>}
                                                    {structure.contact_phone && <p><span className="text-gray-500">Téléphone :</span> <span className="font-medium">{structure.contact_phone}</span></p>}
                                                    {(structure.address || structure.postal_code) && <p><span className="text-gray-500">Adresse :</span> <span className="font-medium">{[structure.address, structure.postal_code].filter(Boolean).join(', ')}</span></p>}
                                                    {structure.website_url && <p className="md:col-span-2"><span className="text-gray-500">Site web :</span> <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline break-all">{structure.website_url}</a></p>}
                                                    {structure.origin_info && <p className="md:col-span-2 bg-white p-3 rounded-lg border border-gray-100"><span className="text-gray-500 block mb-1">{structure.source ? 'Note d\'import :' : 'Comment la personne connaît la structure :'}</span><span className="italic text-gray-700">{structure.origin_info}</span></p>}
                                                    <p><span className="text-gray-500">Proposée le :</span> <span className="font-medium">{formatDate(structure.created_at)}</span></p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <Pagination page={safePage} total={totalPages} onChange={p => { setPage(p); setExpandedId(null); }} label="Pages des structures" />
                </>
            )}
        </section>
    );
}
