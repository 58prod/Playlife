import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import type { MissionMedia } from '@/types/database.types';
import { Modal } from './Modal';

interface PhotoSlideshowModalProps {
    photos: MissionMedia[];
    title: string;
    onClose: () => void;
    onDelete?: (photo: MissionMedia) => void;
}

export function PhotoSlideshowModal({ photos, title, onClose, onDelete }: PhotoSlideshowModalProps) {
    const [index, setIndex] = useState(0);
    const count = photos.length;
    const safeIndex = Math.min(index, count - 1);
    const current = photos[safeIndex];

    const goPrev = () => setIndex(i => (i - 1 + count) % count);
    const goNext = () => setIndex(i => (i + 1) % count);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + count) % count);
            if (e.key === 'ArrowRight') setIndex(i => (i + 1) % count);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [count]);

    if (!current) return null;

    return (
        <Modal onClose={onClose} label={`Photos : ${title}`} closeOnBackdrop backdropClassName="bg-black/90" className="w-full max-w-4xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 gap-4">
                <p className="text-white font-semibold text-lg truncate">{title}</p>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-white/60 text-sm" aria-live="polite">{safeIndex + 1} / {count}</span>
                    {onDelete && (
                        <button type="button" onClick={() => onDelete(current)} className="text-red-400 hover:text-red-300 p-1 rounded-lg" aria-label="Supprimer cette photo">
                            <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg" aria-label="Fermer">
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="relative w-full flex items-center justify-center">
                {count > 1 && (
                    <button type="button" onClick={goPrev} className="absolute left-0 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white" aria-label="Photo précédente">
                        <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                    </button>
                )}
                <img src={current.media_url} alt={current.caption || `Photo ${safeIndex + 1} — ${title}`} className="max-h-[70vh] max-w-full object-contain rounded-lg" />
                {count > 1 && (
                    <button type="button" onClick={goNext} className="absolute right-0 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white" aria-label="Photo suivante">
                        <ChevronRight className="w-6 h-6" aria-hidden="true" />
                    </button>
                )}
            </div>

            {current.caption && <p className="text-white/70 text-sm mt-3 text-center max-w-2xl">{current.caption}</p>}

            {count > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {photos.map((photo, i) => (
                        <button
                            key={photo.id}
                            type="button"
                            onClick={() => setIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === safeIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70 w-2'}`}
                            aria-label={`Photo ${i + 1}`}
                            aria-current={i === safeIndex}
                        />
                    ))}
                </div>
            )}
        </Modal>
    );
}
