import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Camera, Clock, Edit2, ExternalLink, Heart, MapPin, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDateRange, missionLocation, pluralize, USER_TYPE_LABELS } from '@/lib/format';
import { fetchPhotosByMission } from '@/lib/missions';
import type { Mission, MissionMedia } from '@/types/database.types';
import { MissionCover } from '../components/MissionCard';
import { MissionForm } from '../components/MissionForm';
import { DonationSimulatorCompact } from '../components/interactive/DonationSimulator';
import { PhotoSlideshowModal } from '../components/PhotoSlideshowModal';
import { Badge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

export default function MissionDetail() {
    const { id } = useParams<{ id: string }>();
    const { user, isAdmin } = useAuth();
    const [mission, setMission] = useState<Mission | null | undefined>(undefined);
    const [photos, setPhotos] = useState<MissionMedia[]>([]);
    const [slideIndex, setSlideIndex] = useState<number | null>(null);
    const [editing, setEditing] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        const { data } = await supabase.from('missions').select('*').eq('id', id).maybeSingle();
        setMission(data);
        if (data) setPhotos((await fetchPhotosByMission([data.id]).catch(() => ({})) as Record<string, MissionMedia[]>)[data.id] ?? []);
    }, [id]);

    useEffect(() => { load(); }, [load, user]);

    useEffect(() => {
        if (mission) document.title = `${mission.title} — Playlife Connect`;
        return () => { document.title = 'Playlife Connect — Sport & Solidarité'; };
    }, [mission]);

    const share = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: mission?.title, text: 'Soutenez cette mission Playlife !', url }).catch(() => undefined);
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Lien copié dans le presse-papiers.');
        }
    };

    if (mission === undefined) {
        return (
            <div className="container-page pt-8 lg:pt-14">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-6 aspect-[21/9] w-full rounded-3xl" />
                <Skeleton className="mt-8 h-10 w-2/3" />
                <Skeleton className="mt-4 h-4 w-full max-w-xl" />
            </div>
        );
    }

    if (!mission) {
        return (
            <div className="container-page pt-14">
                <EmptyState icon={Heart} title="Mission introuvable" description="Cette mission n'existe pas ou n'est pas encore publiée." action={<ButtonLink to="/missions" variant="secondary" icon={ArrowLeft}>Voir les missions</ButtonLink>} />
            </div>
        );
    }

    const completed = mission.status === 'completed';
    const canEdit = !!user && (mission.created_by === user.id || isAdmin);

    return (
        <div className="container-page pt-6 lg:pt-10">
            <Link to="/missions" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-ink-900">
                <ArrowLeft className="size-4" aria-hidden="true" /> Toutes les missions
            </Link>

            {!mission.visible && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                    <Clock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    <p>Cette mission est <strong>en attente de validation</strong> par l'équipe Playlife. Elle n'est visible que par vous pour le moment.</p>
                </div>
            )}

            <div className="mt-6 aspect-[16/9] overflow-hidden rounded-3xl shadow-soft ring-1 ring-ink-900/[0.06] md:aspect-[21/8]">
                <MissionCover mission={mission} />
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
                <article className="min-w-0 animate-fade-up">
                    <div className="flex flex-wrap gap-2">
                        {mission.mission_type && <Badge tone="ink">{USER_TYPE_LABELS[mission.mission_type]}</Badge>}
                        {completed ? <Badge tone="success">Mission terminée</Badge> : <Badge tone="info">En cours</Badge>}
                    </div>
                    <h1 className="mt-4 text-3xl font-bold md:text-5xl">{mission.title}</h1>
                    <p className="mt-4 flex items-center gap-2 text-gray-600"><MapPin className="size-4 text-brand-500" aria-hidden="true" />{missionLocation(mission)}</p>

                    {mission.description && (
                        <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink-800">{mission.description}</div>
                    )}

                    {photos.length > 0 && (
                        <section className="mt-12" aria-labelledby="photos-title">
                            <h2 id="photos-title" className="flex items-center gap-2 text-2xl font-bold">
                                <Camera className="size-6 text-brand-500" aria-hidden="true" /> Souvenirs de mission
                                <span className="text-base font-normal text-gray-500">({pluralize(photos.length, 'photo')})</span>
                            </h2>
                            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {photos.map((photo, index) => (
                                    <li key={photo.id} className={index === 0 ? 'col-span-2 row-span-2' : ''}>
                                        <button type="button" onClick={() => setSlideIndex(index)} className="group block size-full overflow-hidden rounded-2xl" aria-label={`Agrandir la photo ${index + 1}`}>
                                            <img src={photo.media_url} alt={photo.caption ?? ''} loading="lazy" className="aspect-square size-full object-cover transition duration-500 group-hover:scale-105" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </article>

                <aside className="lg:sticky lg:top-28 lg:self-start">
                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06]">
                        <dl className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <dt className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-ink-800"><MapPin className="size-4" aria-label="Lieu" /></dt>
                                <dd><span className="block text-gray-500">Destination</span><span className="font-semibold text-ink-900">{missionLocation(mission)}</span></dd>
                            </div>
                            <div className="flex gap-3">
                                <dt className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-ink-800"><Calendar className="size-4" aria-label="Dates" /></dt>
                                <dd><span className="block text-gray-500">Dates prévues</span><span className="font-semibold text-ink-900">{formatDateRange(mission.start_date, mission.end_date)}</span></dd>
                            </div>
                        </dl>

                        <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                            {mission.fundraising_url && !completed && (
                                <>
                                    <a href={mission.fundraising_url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 font-semibold text-white shadow-brand transition hover:bg-brand-600">
                                        <Heart className="size-4 fill-current" aria-hidden="true" /> Soutenir cette mission <ExternalLink className="size-4 opacity-70" aria-hidden="true" />
                                    </a>
                                    <DonationSimulatorCompact />
                                </>
                            )}
                            <Button variant="secondary" icon={Share2} onClick={share} className="w-full">Partager la mission</Button>
                            {canEdit && <Button variant="ghost" icon={Edit2} onClick={() => setEditing(true)} className="w-full">Modifier</Button>}
                        </div>
                    </div>
                </aside>
            </div>

            {slideIndex !== null && (
                <PhotoSlideshowModal photos={photos} title={mission.title} initialIndex={slideIndex} onClose={() => setSlideIndex(null)} />
            )}
            {editing && <MissionForm initialData={mission} onClose={() => setEditing(false)} onSuccess={load} />}
        </div>
    );
}
