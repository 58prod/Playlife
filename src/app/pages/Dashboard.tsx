import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Camera, CheckCircle2, Edit2, Heart, ImagePlus, Loader2, MapPin, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { cn } from '@/lib/cn';
import { avatarSrc, formatDateRange, missionLocation, pluralize, profileUserType, USER_TYPE_LABELS } from '@/lib/format';
import { deleteMission, deleteMissionPhoto, fetchPhotosByMission } from '@/lib/missions';
import { PACK } from '@/lib/playlife';
import { removePublicFile, uploadPublicFile, validateUpload } from '@/lib/storage';
import type { Mission, MissionMedia, UserType } from '@/types/database.types';
import { useConfirm } from '../components/ConfirmDialog';
import { MissionCover } from '../components/MissionCard';
import { MissionForm } from '../components/MissionForm';
import { MissionStatusBadge } from '../components/MissionBadges';
import { Modal } from '../components/Modal';
import { PhotoSlideshowModal } from '../components/PhotoSlideshowModal';
import { PhotoStrip } from '../components/PhotoStrip';
import { Avatar } from '../components/UserMenu';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Field, Input, Select } from '../components/ui/Field';
import { Skeleton } from '../components/ui/Skeleton';


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
        { label: 'Missions', value: missions.length },
        { label: 'En cours', value: active.length },
        { label: 'Terminées', value: completed.length },
        { label: 'Enfants aidés (estim.)', value: completed.length * PACK.childrenPerPack },
    ];

    const renderMissionCard = (mission: Mission) => {
        const isCompleted = mission.status === 'completed';
        const photos = photosByMission[mission.id] ?? [];
        const action = 'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition';
        return (
            <article key={mission.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-900/[0.06]">
                <Link to={`/missions/${mission.id}`} className="relative block aspect-[16/8] overflow-hidden" aria-label={`Voir la mission ${mission.title}`}>
                    <MissionCover mission={mission} className="transition duration-500 group-hover:scale-105" />
                    <span className="absolute right-3 top-3"><MissionStatusBadge mission={mission} /></span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold leading-snug">
                        <Link to={`/missions/${mission.id}`} className="hover:text-brand-600">{mission.title}</Link>
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                        <span className="truncate">{missionLocation(mission)} · {formatDateRange(mission.start_date, mission.end_date)}</span>
                    </p>
                    {isCompleted && photos.length > 0 && (
                        <PhotoStrip photos={photos} missionTitle={mission.title} onOpen={() => setSlideshowMissionId(mission.id)} />
                    )}
                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 [&:not(:first-child)]:mt-4">
                        {isCompleted ? (
                            <button type="button" onClick={() => setMediaUploadMission(mission)} className={cn(action, 'bg-brand-50 text-brand-700 hover:bg-brand-100')}>
                                <ImagePlus className="size-4" aria-hidden="true" /> Ajouter des photos
                            </button>
                        ) : (
                            <button type="button" onClick={() => handleCompleteMission(mission)} className={cn(action, 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100')}>
                                <CheckCircle2 className="size-4" aria-hidden="true" /> Mission accomplie
                            </button>
                        )}
                        <button type="button" onClick={() => setEditingMission(mission)} className={cn(action, 'text-ink-800 hover:bg-ink-50')} aria-label={`Modifier la mission ${mission.title}`}>
                            <Edit2 className="size-4" aria-hidden="true" /> Modifier
                        </button>
                        <button type="button" onClick={() => handleDeleteMission(mission)} className={cn(action, 'ml-auto px-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600')} aria-label={`Supprimer la mission ${mission.title}`}>
                            <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <div className="container-page pt-8 lg:pt-12">
            <ProfileHeader onNewMission={() => setIsFormOpen(true)} />

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink-900/[0.06] shadow-soft ring-1 ring-ink-900/[0.06] lg:grid-cols-4">
                {stats.map(({ label, value }) => (
                    <div key={label} className="flex flex-col-reverse bg-white px-5 py-5 md:px-6">
                        <dt className="text-sm text-gray-600">{label}</dt>
                        <dd className="font-display text-3xl font-bold tabular-nums text-ink-900">{loading ? '—' : value}</dd>
                    </div>
                ))}
            </dl>

            <div className="mt-12">
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {[0, 1, 2].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
                    </div>
                ) : missions.length > 0 ? (
                    <div className="space-y-12">
                        {[{ id: 'active', title: 'Missions en cours', list: active }, { id: 'completed', title: 'Missions terminées', list: completed }]
                            .filter(section => section.list.length > 0)
                            .map(section => (
                                <section key={section.id} aria-labelledby={`${section.id}-heading`}>
                                    <h2 id={`${section.id}-heading`} className="mb-5 text-2xl font-bold">
                                        {section.title} <span className="text-base font-normal text-gray-500">({section.list.length})</span>
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {section.list.map(renderMissionCard)}
                                    </div>
                                </section>
                            ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Heart}
                        title="Votre première mission vous attend"
                        description="Créez une mission en quelques minutes : l'équipe Playlife la valide puis vous accompagne jusqu'à la remise du pack."
                        action={<Button icon={Plus} onClick={() => setIsFormOpen(true)}>Créer ma première mission</Button>}
                    />
                )}
            </div>

            {isFormOpen && <MissionForm onClose={() => setIsFormOpen(false)} onSuccess={fetchUserMissions} />}
            {editingMission && <MissionForm initialData={editingMission} onClose={() => setEditingMission(null)} onSuccess={fetchUserMissions} />}
            {mediaUploadMission && (
                <MediaUploadModal mission={mediaUploadMission} onClose={() => { setMediaUploadMission(null); fetchUserMissions(); }} />
            )}
            {slideshowMission && slideshowPhotos.length > 0 && (
                <PhotoSlideshowModal photos={slideshowPhotos} title={slideshowMission.title} onClose={() => setSlideshowMissionId(null)} onDelete={handleDeletePhoto} />
            )}
        </div>
    );
}

function ProfileHeader({ onNewMission }: { onNewMission: () => void }) {
    const { user, profile } = useAuth();
    const [editing, setEditing] = useState(false);
    const type = profileUserType(profile);
    const firstName = profile?.full_name?.split(' ')[0];

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-fade-up">
            <div className="flex items-center gap-5">
                <Avatar src={avatarSrc(profile)} name={profile?.full_name || user?.email} className="size-16 text-lg shadow-soft md:size-20" />
                <div className="min-w-0">
                    <p className="text-sm text-gray-600">{type ? USER_TYPE_LABELS[type] : 'Membre Playlife'}</p>
                    <h1 className="truncate text-3xl font-bold md:text-4xl">Bonjour{firstName ? `, ${firstName}` : ''} 👋</h1>
                    <button type="button" onClick={() => setEditing(true)} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                        <Edit2 className="size-3.5" aria-hidden="true" /> Modifier mon profil
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
                <ButtonLink to="/comment-ca-marche#ressources" variant="secondary" size="lg" iconRight={ArrowUpRight}>Guides &amp; ressources</ButtonLink>
                <Button size="lg" icon={Plus} onClick={onNewMission}>Nouvelle mission</Button>
            </div>
            {editing && <ProfileModal onClose={() => setEditing(false)} />}
        </div>
    );
}

function ProfileModal({ onClose }: { onClose: () => void }) {
    const { user, profile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name ?? '');
    const [userType, setUserType] = useState<UserType | ''>(profileUserType(profile) ?? '');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);

    const cancel = async () => {
        // Supprime un avatar envoyé mais non enregistré
        if (avatarUrl && avatarUrl !== profile?.avatar_url) await removePublicFile('avatars', avatarUrl).catch(() => undefined);
        onClose();
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
            .update({ full_name: fullName.trim() || null, user_type: userType || null, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        setSaving(false);
        if (error) {
            toast.error(`Enregistrement impossible : ${errorMessage(error)}`);
            return;
        }
        if (profile?.avatar_url && profile.avatar_url !== avatarUrl) await removePublicFile('avatars', profile.avatar_url).catch(() => undefined);
        await refreshProfile();
        toast.success('Profil mis à jour.');
        onClose();
    };

    return (
        <Modal onClose={cancel} label="Modifier mon profil" className="w-full max-w-md">
            <div className="rounded-3xl bg-white p-6 shadow-lift">
                <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold">Mon profil</h2>
                    <button type="button" onClick={cancel} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink-900" aria-label="Fermer"><X className="size-5" aria-hidden="true" /></button>
                </div>
                <div className="mt-6 flex items-center gap-4">
                    <div className="relative">
                        <Avatar src={avatarUrl} name={fullName || user?.email} className="size-20 text-xl" />
                        {uploading && <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-950/50"><Loader2 className="size-6 animate-spin text-white" aria-label="Envoi en cours" /></span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <label className={cn('inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-ink-900 ring-1 ring-gray-200 hover:bg-gray-50', uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer')}>
                            <input type="file" accept="image/*" onChange={handleAvatar} className="sr-only" disabled={uploading} />
                            <Upload className="size-4" aria-hidden="true" /> {avatarUrl ? 'Changer' : 'Ajouter une photo'}
                        </label>
                        {avatarUrl && <button type="button" onClick={() => setAvatarUrl(null)} className="h-9 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100">Retirer</button>}
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    <Field id="profile-name" label="Nom complet">
                        <Input id="profile-name" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </Field>
                    <Field id="profile-type" label="Je suis">
                        <Select id="profile-type" value={userType} onChange={e => setUserType(e.target.value as UserType | '')}>
                            <option value="">Non précisé</option>
                            <option value="voyageur">{USER_TYPE_LABELS.voyageur}</option>
                            <option value="animateur">{USER_TYPE_LABELS.animateur}</option>
                        </Select>
                    </Field>
                    <p className="text-xs text-gray-500">Email : {user?.email}</p>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="secondary" onClick={cancel}>Annuler</Button>
                    <Button onClick={save} loading={saving} disabled={uploading}>Enregistrer</Button>
                </div>
            </div>
        </Modal>
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
            <div className="max-h-[90dvh] overflow-y-auto rounded-3xl bg-white p-6 shadow-lift">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Partager les souvenirs</h2>
                        <p className="mt-1 break-words text-sm text-gray-500">{mission.title}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink-900" aria-label="Fermer"><X className="size-5" aria-hidden="true" /></button>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-100 p-4">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-brand-500" />
                    <span className="text-xs leading-relaxed text-ink-800">
                        <strong>Engagement avant publication :</strong> je confirme disposer des droits nécessaires et avoir l'accord des personnes photographiées lorsque cela est requis. Je m'engage à ne publier aucun contenu raciste, discriminatoire, violent, humiliant ou illégal. Les images doivent respecter la dignité des personnes, notamment des enfants. J'autorise Playlife à utiliser ces photos pour la communication de l'association.
                    </span>
                </label>

                <label className={cn('mt-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition', consent && !uploading ? 'cursor-pointer border-gray-200 hover:border-brand-300 hover:bg-brand-50/40' : 'cursor-not-allowed border-gray-100 opacity-60')}>
                    <input type="file" accept="image/*" multiple onChange={handleFiles} className="sr-only" disabled={!consent || uploading} />
                    <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                        {uploading ? <Loader2 className="size-6 animate-spin" aria-hidden="true" /> : <Camera className="size-6" aria-hidden="true" />}
                    </span>
                    <span className="text-sm font-medium text-ink-900">
                        {uploading ? 'Envoi en cours…' : consent ? 'Choisir des photos' : "Cochez l'engagement pour continuer"}
                    </span>
                    <span className="text-xs text-gray-500">Plusieurs photos possibles · 5 Mo maximum chacune</span>
                </label>

                {uploaded.length > 0 && (
                    <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-100" role="status">
                        <CheckCircle2 className="size-4" aria-hidden="true" /> {pluralize(uploaded.length, 'photo envoyée', 'photos envoyées')}
                    </p>
                )}

                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose} disabled={uploading}>Terminer</Button>
                </div>
            </div>
        </Modal>
    );
}
