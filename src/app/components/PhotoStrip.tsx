import { Image as ImageIcon } from 'lucide-react';
import type { MissionMedia } from '@/types/database.types';
import { pluralize } from '@/lib/format';

/** Aperçu de 3 vignettes + bouton d'ouverture du diaporama. */
export function PhotoStrip({ photos, missionTitle, onOpen }: { photos: MissionMedia[]; missionTitle: string; onOpen: () => void }) {
    if (photos.length === 0) return null;
    const preview = photos.slice(0, 3);
    const extra = photos.length - preview.length;
    return (
        <div className="pt-2">
            <div className="flex gap-1.5 mb-2" aria-hidden="true">
                {preview.map(p => (
                    <img key={p.id} src={p.media_url} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm" />
                ))}
                {extra > 0 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-white shadow-sm">+{extra}</div>
                )}
            </div>
            <button
                type="button"
                onClick={onOpen}
                className="flex items-center gap-1.5 text-xs font-bold text-[#e6244d] hover:text-[#c91d41] transition-colors"
                aria-label={`Voir les ${pluralize(photos.length, 'photo')} de la mission ${missionTitle}`}
            >
                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                Voir les {pluralize(photos.length, 'photo')}
            </button>
        </div>
    );
}
