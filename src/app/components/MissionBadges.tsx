import { CheckCircle2, Clock } from 'lucide-react';
import type { Mission } from '@/types/database.types';
import { Badge } from './ui/Badge';

export function MissionStatusBadge({ mission }: { mission: Pick<Mission, 'status' | 'visible'> }) {
    if (mission.status === 'completed') return <Badge tone="success" icon={CheckCircle2} className="bg-emerald-50/95">Terminée</Badge>;
    if (!mission.visible) return <Badge tone="warning" icon={Clock} className="bg-amber-50/95">En attente de validation</Badge>;
    return <Badge tone="info" className="bg-sky-50/95">Publiée</Badge>;
}
