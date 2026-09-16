import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Pile des modales ouvertes : seule la plus récente réagit à Échap. */
const openModals: symbol[] = [];

interface ModalProps {
    onClose: () => void;
    label: string;
    children: ReactNode;
    className?: string;
    /** Fermer en cliquant sur le fond (désactivé pour les formulaires, pour ne pas perdre la saisie) */
    closeOnBackdrop?: boolean;
    backdropClassName?: string;
}

/** Fenêtre modale accessible : Échap pour fermer, focus conservé, défilement de la page bloqué. */
export function Modal({ onClose, label, children, className = '', closeOnBackdrop = false, backdropClassName = 'bg-ink-950/50 backdrop-blur-sm' }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const id = Symbol('modal');
        openModals.push(id);
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && openModals[openModals.length - 1] === id) onCloseRef.current();
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
            openModals.splice(openModals.indexOf(id), 1);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus?.();
        };
    }, []);

    return createPortal(
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 animate-[fade-up_0.2s_ease-out] ${backdropClassName}`}
            onMouseDown={e => { if (closeOnBackdrop && e.target === e.currentTarget) onClose(); }}
        >
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={`outline-none animate-pop ${className}`}>
                {children}
            </div>
        </div>,
        document.body,
    );
}
