import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, Camera, GraduationCap, Heart, MapPin, Plane } from 'lucide-react';
import { formatDateRange, isIllustration, missionLocation, pluralize } from '@/lib/format';
import type { Mission } from '@/types/database.types';
import { Badge } from './ui/Badge';

export function MissionTypeLabel({ type }: { type: Mission['mission_type'] }) {
    if (!type) return null;
    const Icon = type === 'voyageur' ? Plane : GraduationCap;
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-soft backdrop-blur">
            <Icon className="size-3.5 text-brand-500" aria-hidden="true" />
            {type === 'voyageur' ? 'Voyageur solidaire' : 'Animateur / Enseignant'}
        </span>
    );
}

export function IllustrationNote({ className = '' }: { className?: string }) {
    return (
        <span className={`pointer-events-none rounded-full bg-ink-950/55 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur ${className}`}>
            Photo d'illustration
        </span>
    );
}

export function MissionCover({ mission, className = '' }: { mission: Pick<Mission, 'image_url' | 'title'>; className?: string }) {
    return mission.image_url ? (
        <>
            <img src={mission.image_url} alt="" loading="lazy" className={`size-full object-cover ${className}`} />
            {isIllustration(mission.image_url) && <IllustrationNote className="absolute bottom-2 right-2" />}
        </>
    ) : (
        <div className={`flex size-full items-center justify-center bg-gradient-to-br from-ink-800 via-ink-900 to-brand-800 ${className}`} aria-hidden="true">
            <Heart className="size-10 fill-brand-500/80 text-brand-500/80" />
        </div>
    );
}

export function MissionCard({ mission, photoCount = 0 }: { mission: Mission; photoCount?: number }) {
    const completed = mission.status === 'completed';
    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-900/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-lift">
            <div className="relative aspect-[16/10] overflow-hidden">
                <MissionCover mission={mission} className="transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                    <MissionTypeLabel type={mission.mission_type} />
                    {completed && <Badge tone="success" className="bg-emerald-50/95">Terminée</Badge>}
                </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold leading-snug">
                    <Link to={`/missions/${mission.id}`} className="after:absolute after:inset-0 focus:outline-none">
                        {mission.title}
                    </Link>
                </h3>
                {mission.description && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{mission.description}</p>}
                <div className="mt-auto space-y-1.5 pt-5 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-brand-500" aria-hidden="true" /><span className="truncate">{missionLocation(mission)}</span></p>
                    {formatDateRange(mission.start_date, mission.end_date) && (
                        <p className="flex items-center gap-2"><Calendar className="size-4 shrink-0 text-brand-500" aria-hidden="true" />{formatDateRange(mission.start_date, mission.end_date)}</p>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                    {completed ? (
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                            <Camera className="size-4" aria-hidden="true" />
                            {photoCount > 0 ? pluralize(photoCount, 'photo') : 'Mission accomplie'}
                        </span>
                    ) : mission.fundraising_url ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-brand-600">
                            <Heart className="size-4 fill-current" aria-hidden="true" /> Cagnotte ouverte
                        </span>
                    ) : (
                        <span className="text-gray-500">En préparation</span>
                    )}
                    <ArrowUpRight className="size-5 text-gray-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500" aria-hidden="true" />
                </div>
            </div>
        </article>
    );
}
