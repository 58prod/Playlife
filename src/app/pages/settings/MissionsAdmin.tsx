import { useCallback, useEffect, useState } from 'react';
import { Calendar, ChevronDown, Edit2, Eye, EyeOff, MapPin, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { formatDate, formatDateRange, missionLocation, USER_TYPE_LABELS } from '@/lib/format';
import { deleteMission } from '@/lib/missions';
import type { Mission } from '@/types/database.types';
import { useConfirm } from '@/app/components/ConfirmDialog';
import { MissionForm } from '@/app/components/MissionForm';
import { EmptyState, FilterTabs, paginate, Pagination, SectionTitle } from './shared';

type Filter = 'pending' | 'visible' | 'all';

export function MissionsAdmin() {
    const confirm = useConfirm();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [filter, setFilter] = useState<Filter>('pending');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editing, setEditing] = useState<Mission | null>(null);

    const fetchMissions = useCallback(async () => {
        const { data, error } = await supabase.from('missions').select('*').order('created_at', { ascending: false });
        if (error) toast.error(`Chargement des missions impossible : ${errorMessage(error)}`);
        else setMissions(data);
    }, []);

    useEffect(() => { fetchMissions(); }, [fetchMissions]);

    const pending = missions.filter(m => !m.visible);
    const visible = missions.filter(m => m.visible);
    const list = filter === 'pending' ? pending : filter === 'visible' ? visible : missions;
    const { pageItems, totalPages, safePage } = paginate(list, page);

    const toggleVisibility = async (mission: Mission) => {
        const { error } = await supabase.from('missions').update({ visible: !mission.visible }).eq('id', mission.id);
        if (error) { toast.error(errorMessage(error)); return; }
        toast.success(mission.visible ? 'Mission masquée.' : 'Mission publiée.');
        fetchMissions();
    };

    const handleDelete = async (mission: Mission) => {
        const ok = await confirm({ title: 'Supprimer cette mission ?', message: <>« {mission.title} » et ses photos seront définitivement supprimées.</>, confirmLabel: 'Supprimer', danger: true });
        if (!ok) return;
        try {
            await deleteMission(mission);
            toast.success('Mission supprimée.');
            fetchMissions();
        } catch (error) {
            toast.error(`Suppression impossible : ${errorMessage(error)}`);
        }
    };

    return (
        <section className="mb-12" aria-label="Missions">
            <SectionTitle icon={Target} title="Missions" count={missions.length}>
                <FilterTabs
                    label="Filtrer les missions"
                    value={filter}
                    onChange={v => { setFilter(v); setPage(1); setExpandedId(null); }}
                    options={[
                        { value: 'pending', label: 'À valider', count: pending.length },
                        { value: 'visible', label: 'Publiées', count: visible.length },
                        { value: 'all', label: 'Toutes', count: missions.length },
                    ]}
                />
            </SectionTitle>

            {list.length === 0 ? (
                <EmptyState>{filter === 'pending' ? 'Aucune mission en attente de validation. 🎉' : 'Aucune mission.'}</EmptyState>
            ) : (
                <>
                    <ul className="grid grid-cols-1 gap-3">
                        {pageItems.map(mission => {
                            const expanded = expandedId === mission.id;
                            return (
                                <li key={mission.id} className={`bg-white rounded-xl border overflow-hidden ${mission.visible ? 'border-gray-200' : 'border-amber-300'}`}>
                                    <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <button type="button" onClick={() => setExpandedId(expanded ? null : mission.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left" aria-expanded={expanded}>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                                            <span className="flex-1 min-w-0">
                                                <span className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-[#22081c] break-words">{mission.title}</span>
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${mission.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {mission.status === 'completed' ? 'Terminée' : 'En cours'}
                                                    </span>
                                                    {!mission.visible && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">À valider</span>}
                                                </span>
                                                <span className="block text-xs text-gray-500 mt-0.5">
                                                    {missionLocation(mission)} · créée le {formatDate(mission.created_at)}
                                                </span>
                                            </span>
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            <button type="button" onClick={() => toggleVisibility(mission)} aria-pressed={!!mission.visible}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mission.visible ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                                {mission.visible ? <><EyeOff className="w-4 h-4" aria-hidden="true" /> Masquer</> : <><Eye className="w-4 h-4" aria-hidden="true" /> Publier</>}
                                            </button>
                                            <button type="button" onClick={() => setEditing(mission)} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-[#e6244d] rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors">
                                                <Edit2 className="w-4 h-4" aria-hidden="true" /> Modifier
                                            </button>
                                            <button type="button" onClick={() => handleDelete(mission)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors" aria-label={`Supprimer ${mission.title}`}>
                                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                    {expanded && (
                                        <div className="border-t border-gray-100 p-4 bg-gray-50 text-sm space-y-3">
                                            {mission.image_url && <img src={mission.image_url} alt="" className="w-full max-w-sm h-40 object-cover rounded-lg" />}
                                            {mission.description && <p className="text-gray-700 whitespace-pre-line">{mission.description}</p>}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {mission.mission_type && <p><span className="text-gray-500">Type :</span> <span className="font-medium">{USER_TYPE_LABELS[mission.mission_type]}</span></p>}
                                                <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" /><span className="font-medium">{missionLocation(mission)}</span></p>
                                                <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" /><span className="font-medium">{formatDateRange(mission.start_date, mission.end_date)}</span></p>
                                                {mission.fundraising_url && (
                                                    <p className="md:col-span-2"><span className="text-gray-500">Cagnotte :</span> <a href={mission.fundraising_url} target="_blank" rel="noopener noreferrer" className="text-[#e6244d] hover:underline break-all">{mission.fundraising_url}</a></p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <Pagination page={safePage} total={totalPages} onChange={p => { setPage(p); setExpandedId(null); }} label="Pages des missions" />
                </>
            )}

            {editing && <MissionForm initialData={editing} onClose={() => setEditing(null)} onSuccess={fetchMissions} />}
        </section>
    );
}
