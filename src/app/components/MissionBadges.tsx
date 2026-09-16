import { CheckCircle, Clock, GraduationCap, Plane } from 'lucide-react';
import type { Mission } from '@/types/database.types';

export function MissionTypeBadge({ type, className = '' }: { type: Mission['mission_type']; className?: string }) {
    if (!type) return null;
    const Icon = type === 'voyageur' ? Plane : GraduationCap;
    return (
        <span className={`inline-flex items-center gap-1.5 h-7 px-3 bg-white/95 rounded-full shadow-sm text-xs font-bold text-gray-700 ${className}`}>
            <Icon className="w-3.5 h-3.5 text-[#e6244d]" aria-hidden="true" />
            {type === 'voyageur' ? 'Voyageur' : 'Animateur'}
        </span>
    );
}

export function MissionStatusBadge({ mission }: { mission: Pick<Mission, 'status' | 'visible'> }) {
    if (mission.status === 'completed') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full shrink-0">
                <CheckCircle className="w-3 h-3" aria-hidden="true" /> Terminée
            </span>
        );
    }
    if (!mission.visible) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full shrink-0" title="La mission sera publiée après validation par l'équipe Playlife">
                <Clock className="w-3 h-3" aria-hidden="true" /> En attente de validation
            </span>
        );
    }
    return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full shrink-0">En cours</span>;
}
