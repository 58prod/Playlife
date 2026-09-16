import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Calendar, CheckCircle, Edit2, Image as ImageIcon, Loader2, MapPin, Plus, Target, Trash2, Upload, User, Users, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { avatarSrc, formatDateRange, missionLocation, pluralize, profileUserType, USER_TYPE_LABELS } from '@/lib/format';
import { deleteMission, deleteMissionPhoto, fetchPhotosByMission } from '@/lib/missions';
import { removePublicFile, uploadPublicFile, validateUpload } from '@/lib/storage';
import type { Mission, MissionMedia, UserType } from '@/types/database.types';
import { useConfirm } from '../components/ConfirmDialog';
import { MissionForm } from '../components/MissionForm';
import { MissionStatusBadge } from '../components/MissionBadges';
import { Modal } from '../components/Modal';
import { PageLoader } from '../components/PageLoader';
import { PhotoSlideshowModal } from '../components/PhotoSlideshowModal';
import { PhotoStrip } from '../components/PhotoStrip';

/** Estimation affichée dans le tableau de bord : nombre moyen d'enfants par pack remis. */
const CHILDREN_PER_PACK = 20;

export default function Dashboard() {
    const { user } = useAuth();
    const confirm = useConfirm();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [photosByMission, setPhotosByMission] = useState<Record<string, MissionMedia[]>>({});
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [mediaUploadMission, setMediaUploadMission] = useState<Mission | null>(null);
    const [slideshowMissionId, setSlideshowMissionId] = useState<string | null>(null);

    const fetchUserMissions = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('missions')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });
        if (error) {
            toast.error(`Chargement des missions impossible : ${errorMessage(error)}`);
        } else {
            setMissions(data);
            setPhotosByMission(await fetchPhotosByMission(data.filter(m => m.status === 'completed').map(m => m.id)).catch(() => ({})));
        }
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchUserMissions(); }, [fetchUserMissions]);

    const handleDeleteMission = async (mission: Mission) => {
        const ok = await confirm({
            title: 'Supprimer cette mission ?',
            message: <>La mission « {mission.title} » et ses photos seront définitivement supprimées.</>,
            confirmLabel: 'Supprimer',
            danger: true,
        });
        if (!ok) return;
        try {
            await deleteMission(mission);
            toast.success('Mission supprimée.');
            fetchUserMissions();
        } catch (error) {
            toast.error(`Suppression impossible : ${errorMessage(error)}`);
        }
    };

    const handleCompleteMission = async (mission: Mission) => {
        const ok = await confirm({
            title: 'Marquer la mission comme terminée ?',
            message: 'Vous pourrez ensuite partager les photos de la remise du pack.',
            confirmLabel: 'Mission terminée',
        });
        if (!ok) return;
        const { error } = await supabase.from('missions').update({ status: 'completed' }).eq('id', mission.id);
        if (error) {
            toast.error(`Mise à jour impossible : ${errorMessage(error)}`);
            return;
        }
        await fetchUserMissions();
        toast.success('Bravo, mission terminée ! 🎉', {
            action: { label: 'Ajouter des photos', onClick: () => setMediaUploadMission({ ...mission, status: 'completed' }) },
        });
    };

    const handleDeletePhoto = async (photo: MissionMedia) => {
        const ok = await confirm({ title: 'Supprimer cette photo ?', message: 'Cette action est irréversible.', confirmLabel: 'Supprimer', danger: true });
        if (!ok) return;
        try {
            await deleteMissionPhoto(photo);
            setPhotosByMission(prev => ({ ...prev, [photo.mission_id]: (prev[photo.mission_id] ?? []).filter(p => p.id !== photo.id) }));
        } catch (error) {
            toast.error(`Suppression impossible : ${errorMessage(error)}`);
        }
    };

    const active = missions.filter(m => m.status !== 'completed');
    const completed = missions.filter(m => m.status === 'completed');
    const slideshowMission = missions.find(m => m.id === slideshowMissionId);
    const slideshowPhotos = slideshowMissionId ? photosByMission[slideshowMissionId] ?? [] : [];

    const stats = [
        { label: 'Mes missions', value: missions.length, icon: Target, color: 'bg-pink-50 text-[#e6244d]' },
        { label: 'En cours', value: active.length, icon: Calendar, color: 'bg-blue-50 text-blue-500' },
        { label: 'Terminées', value: completed.length, icon: CheckCircle, color: 'bg-green-50 text-green-500' },
        { label: 'Enfants aidés (estimation)', value: completed.length * CHILDREN_PER_PACK, icon: Users, color: 'bg-purple-50 text-purple-500' },
    ];

    const renderMissionCard = (mission: Mission) => {
        const isCompleted = mission.status === 'completed';
        const photos = photosByMission[mission.id] ?? [];
        return (
            <article key={mission.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col">
                {mission.image_url && (
                    <div className="h-36 overflow-hidden">
                        <img src={mission.image_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-[#22081c] line-clamp-2 flex-1 break-words">{mission.title}</h4>
                        <MissionStatusBadge mission={mission} />
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{mission.description}</p>
                    <div className="flex flex-col gap-2 mb-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-gray-500 font-medium min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-[#e6244d] shrink-0" aria-hidden="true" />
                                <span className="truncate">{missionLocation(mission)}</span>
                            </span>
                            <span className="font-bold uppercase tracking-tight text-gray-400 shrink-0">
                                {mission.mission_type === 'animateur' ? 'Animateur' : 'Voyageur'}
                            </span>
                        </div>
                        <span className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                            {formatDateRange(mission.start_date, mission.end_date)}
                        </span>
                    </div>

                    <div className="mt-auto flex gap-2 pt-2 border-t border-gray-200">
                        <button type="button" onClick={() => setEditingMission(mission)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors" aria-label={`Modifier la mission ${mission.title}`}>
                            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" /> Modifier
                        </button>
                        {isCompleted ? (
                            <button type="button" onClick={() => setMediaUploadMission(mission)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors" aria-label={`Ajouter des photos à la mission ${mission.title}`}>
                                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" /> Photos
                            </button>
                        ) : (
                            <button type="button" onClick={() => handleCompleteMission(mission)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors" aria-label={`Marquer la mission ${mission.title} comme terminée`}>
                                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> Terminée
                            </button>
                        )}
                        <button type="button" onClick={() => handleDeleteMission(mission)} className="flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors" aria-label={`Supprimer la mission ${mission.title}`}>
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                    </div>

                    {isCompleted && photos.length > 0 && (
                        <div className="mt-3 pt-1 border-t border-gray-200">
                            <PhotoStrip photos={photos} missionTitle={mission.title} onOpen={() => setSlideshowMissionId(mission.id)} />
                        </div>
                    )}
                </div>
            </article>
        );
    };

    return (
        <div className="px-4 md:px-8 py-4 md:py-6 space-y-8">
            <ProfileBanner onNewMission={() => setIsFormOpen(true)} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                <Icon className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">{label}</p>
                                <p className="text-2xl md:text-3xl font-bold text-[#22081c]">{value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#22081c]">Mes missions</h2>
                        <p className="text-gray-500 text-sm mt-1">Gérez et suivez vos missions solidaires</p>
                    </div>
                    <Link to="/missions" className="text-[#e6244d] hover:text-[#c91d41] text-sm font-medium flex items-center gap-1 shrink-0">
                        Toutes les missions <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>

                {loading ? (
                    <PageLoader label="Chargement de vos missions…" />
                ) : missions.length > 0 ? (
                    <>
                        {[{ id: 'active', title: 'Missions en cours', list: active }, { id: 'completed', title: 'Missions terminées', list: completed }]
                            .filter(section => section.list.length > 0)
                            .map(section => (
                                <section key={section.id} aria-labelledby={`${section.id}-heading`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <h3 id={`${section.id}-heading`} className="p-5 border-b border-gray-100 text-base font-bold text-[#22081c]">
                                        {section.title} <span className="text-sm font-normal text-gray-400">({section.list.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4 md:p-6">
                                        {section.list.map(renderMissionCard)}
                                    </div>
                                </section>
                            ))}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-gray-400" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#22081c] mb-2">Aucune mission</h3>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore créé de mission.</p>
                        <button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex items-center gap-2 bg-[#e6244d] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#c91d41] transition-colors">
                            <Plus className="w-5 h-5" aria-hidden="true" /> Créer ma première mission
                        </button>
                    </div>
                )}
            </div>

            {isFormOpen && <MissionForm onClose={() => setIsFormOpen(false)} onSuccess={fetchUserMissions} />}
            {editingMission && <MissionForm initialData={editingMission} onClose={() => setEditingMission(null)} onSuccess={fetchUserMissions} />}
            {mediaUploadMission && (
                <MediaUploadModal
                    mission={mediaUploadMission}
                    onClose={() => { setMediaUploadMission(null); fetchUserMissions(); }}
                />
            )}
            {slideshowMission && slideshowPhotos.length > 0 && (
                <PhotoSlideshowModal photos={slideshowPhotos} title={slideshowMission.title} onClose={() => setSlideshowMissionId(null)} onDelete={handleDeletePhoto} />
            )}
        </div>
    );
}

function ProfileBanner({ onNewMission }: { onNewMission: () => void }) {
    const { user, profile, refreshProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [userType, setUserType] = useState<UserType | ''>('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const startEditing = () => {
        setFullName(profile?.full_name ?? '');
        setUserType(profileUserType(profile) ?? '');
        setAvatarUrl(profile?.avatar_url ?? null);
        setEditing(true);
    };

    const cancel = async () => {
        // Supprime un avatar envoyé mais non enregistré
        if (avatarUrl && avatarUrl !== profile?.avatar_url) await removePublicFile('avatars', avatarUrl).catch(() => undefined);
        setEditing(false);
    };

    const handleAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !user) return;
        const invalid = validateUpload(file);
        if (invalid) { toast.error(invalid); return; }
        setUploading(true);
        try {
            const url = await uploadPublicFile('avatars', user.id, file);
            if (avatarUrl && avatarUrl !== profile?.avatar_url) await removePublicFile('avatars', avatarUrl);
            setAvatarUrl(url);
        } catch (error) {
            toast.error(`Envoi de la photo impossible : ${errorMessage(error)}`);
        } finally {
            setUploading(false);
        }
    };

    const save = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName.trim() || null,
                user_type: userType || null,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        setSaving(false);
        if (error) {
            toast.error(`Enregistrement impossible : ${errorMessage(error)}`);
            return;
        }
        if (profile?.avatar_url && profile.avatar_url !== avatarUrl) await removePublicFile('avatars', profile.avatar_url).catch(() => undefined);
        await refreshProfile();
        setEditing(false);
        toast.success('Profil mis à jour.');
    };

    const type = profileUserType(profile);
    const displayedAvatar = editing ? avatarUrl : avatarSrc(profile);

    return (
        <div className="bg-gradient-to-br from-[#22081c] to-[#3d1232] rounded-3xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden shrink-0 relative">
                    {displayedAvatar ? <img src={displayedAvatar} alt="" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-white/70" aria-hidden="true" />}
                    {uploading && <span className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" aria-label="Envoi en cours" /></span>}
                </div>

                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="space-y-3 max-w-md">
                            <div>
                                <label htmlFor="profile-name" className="block text-white/60 text-xs mb-1">Nom complet</label>
                                <input id="profile-name" type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e6244d] text-white placeholder-white/40" />
                            </div>
                            <div>
                                <label htmlFor="profile-type" className="block text-white/60 text-xs mb-1">Type de profil</label>
                                <select id="profile-type" value={userType} onChange={e => setUserType(e.target.value as UserType | '')}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e6244d] text-white">
                                    <option value="" className="bg-[#22081c]">Non précisé</option>
                                    <option value="voyageur" className="bg-[#22081c]">{USER_TYPE_LABELS.voyageur}</option>
                                    <option value="animateur" className="bg-[#22081c]">{USER_TYPE_LABELS.animateur}</option>
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <label className={`inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm hover:bg-white/20 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                                    <input type="file" accept="image/*" onChange={handleAvatar} className="sr-only" disabled={uploading} />
                                    <Upload className="w-4 h-4" aria-hidden="true" /> {avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
                                </label>
                                {avatarUrl && (
                                    <button type="button" onClick={() => setAvatarUrl(null)} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white/70 hover:text-white">
                                        <X className="w-4 h-4" aria-hidden="true" /> Retirer
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={save} disabled={saving || uploading} className="px-4 py-2 bg-[#e6244d] rounded-lg text-sm font-bold hover:bg-[#c91d41] transition-colors disabled:opacity-50">
                                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                                </button>
                                <button type="button" onClick={cancel} className="px-4 py-2 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors">Annuler</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-white/60 text-sm mb-1">Bienvenue,</p>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 truncate">{profile?.full_name || user?.email}</h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="px-3 py-1 bg-[#e6244d] rounded-full text-xs font-semibold uppercase tracking-wide">
                                    {type ? USER_TYPE_LABELS[type] : 'Membre'}
                                </span>
                                <button type="button" onClick={startEditing} className="text-white/60 hover:text-white transition-colors text-xs font-medium flex items-center gap-1">
                                    <Edit2 className="w-3 h-3" aria-hidden="true" /> Modifier le profil
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <button type="button" onClick={onNewMission} className="shrink-0 flex items-center justify-center gap-2 bg-white text-[#22081c] px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:bg-gray-100 active:scale-95">
                    <Plus className="w-5 h-5 text-[#e6244d]" aria-hidden="true" /> Nouvelle mission
                </button>
            </div>
        </div>
    );
}

function MediaUploadModal({ mission, onClose }: { mission: Mission; onClose: () => void }) {
    const { user } = useAuth();
    const [consent, setConsent] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState<string[]>([]);

    const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (!files.length || !user) return;
        setUploading(true);
        for (const file of files) {
            const invalid = validateUpload(file);
            if (invalid) { toast.error(invalid); continue; }
            try {
                const url = await uploadPublicFile('mission-media', mission.id, file);
                const { error } = await supabase.from('mission_media').insert({ mission_id: mission.id, media_url: url, media_type: 'photo', created_by: user.id });
                if (error) {
                    await removePublicFile('mission-media', url).catch(() => undefined);
                    throw error;
                }
                setUploaded(prev => [...prev, file.name]);
            } catch (error) {
                toast.error(`« ${file.name} » : ${errorMessage(error)}`);
            }
        }
        setUploading(false);
    };

    return (
        <Modal onClose={onClose} label="Ajouter des photos" className="w-full max-w-lg">
            <div className="bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#22081c]">Ajouter des photos</h2>
                        <p className="text-sm text-gray-500 mt-1 break-words">{mission.title}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Fermer">
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 cursor-pointer">
                        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#e6244d] shrink-0" />
                        <span className="text-xs text-amber-900 leading-relaxed">
                            <strong>Engagement avant publication :</strong> je confirme disposer des droits nécessaires et avoir l'accord des personnes photographiées lorsque cela est requis. Je m'engage à ne publier aucun contenu raciste, discriminatoire, violent, humiliant ou illégal. Les images doivent respecter la dignité des personnes, notamment des enfants. J'autorise Playlife à utiliser ces photos pour la communication de l'association.
                        </span>
                    </label>

                    <label className={`block border-2 border-dashed rounded-xl p-8 text-center transition-colors ${consent && !uploading ? 'border-gray-300 hover:border-[#e6244d] cursor-pointer' : 'border-gray-200 opacity-50 cursor-not-allowed'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleFiles} className="sr-only" disabled={!consent || uploading} />
                        <span className="flex flex-col items-center gap-3">
                            <span className="w-16 h-16 bg-[#e6244d]/10 rounded-full flex items-center justify-center">
                                {uploading ? <Loader2 className="w-8 h-8 text-[#e6244d] animate-spin" aria-hidden="true" /> : <Upload className="w-8 h-8 text-[#e6244d]" aria-hidden="true" />}
                            </span>
                            <span className="font-medium text-[#22081c]">
                                {uploading ? 'Envoi en cours…' : consent ? 'Cliquez pour choisir des photos' : "Cochez l'engagement ci-dessus pour continuer"}
                            </span>
                            <span className="text-sm text-gray-500">Images uniquement, 5 Mo maximum par fichier</span>
                        </span>
                    </label>

                    {uploaded.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4" role="status">
                            <p className="text-sm font-medium text-green-800 mb-2">✓ {pluralize(uploaded.length, 'photo envoyée', 'photos envoyées')}</p>
                            <ul className="text-xs text-green-700 space-y-1">
                                {uploaded.map((name, i) => <li key={i} className="truncate">• {name}</li>)}
                            </ul>
                        </div>
                    )}

                    <button type="button" onClick={onClose} disabled={uploading} className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
                        Terminer
                    </button>
                </div>
            </div>
        </Modal>
    );
}
