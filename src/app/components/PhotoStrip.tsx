import type { MissionMedia } from '@/types/database.types';
import { pluralize } from '@/lib/format';

/** Aperçu en vignettes empilées + ouverture du diaporama. */
export function PhotoStrip({ photos, missionTitle, onOpen }: { photos: MissionMedia[]; missionTitle: string; onOpen: () => void }) {
    if (photos.length === 0) return null;
    const preview = photos.slice(0, 4);
    return (
        <button
            type="button"
            onClick={onOpen}
            className="mt-4 flex items-center gap-3 rounded-xl p-1 pr-3 text-left transition hover:bg-ink-50"
            aria-label={`Voir les ${pluralize(photos.length, 'photo')} de la mission ${missionTitle}`}
        >
            <span className="flex -space-x-3" aria-hidden="true">
                {preview.map(p => <img key={p.id} src={p.media_url} alt="" loading="lazy" className="size-10 rounded-lg object-cover ring-2 ring-white" />)}
            </span>
            <span className="text-sm font-medium text-ink-800">{pluralize(photos.length, 'photo')}</span>
        </button>
    );
}
