import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * Registre partagé des blocs en attente d'apparition. Un seul écouteur de
 * défilement pour toute la page, balayé une fois par image.
 *
 * On mesure la position plutôt que d'écouter un IntersectionObserver : un saut
 * de défilement (ancre, touche Fin, molette rapide) peut faire passer un bloc
 * sous puis au-dessus de l'écran sans que l'observateur ne signale quoi que ce
 * soit — le bloc resterait alors transparent.
 */
const pending = new Set<HTMLElement>();
let frame = 0;

function sweep() {
    frame = 0;
    const limit = window.innerHeight * 0.92;
    for (const node of pending) {
        if (node.getBoundingClientRect().top >= limit) continue;
        node.dataset.reveal = 'in';
        pending.delete(node);
    }
    if (pending.size === 0) stopWatching();
}

function schedule() {
    if (!frame) frame = requestAnimationFrame(sweep);
}

function startWatching() {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
}

function stopWatching() {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
}

function watch(node: HTMLElement) {
    if (pending.size === 0) startWatching();
    pending.add(node);
    schedule();
    return () => {
        pending.delete(node);
        if (pending.size === 0) stopWatching();
    };
}

/**
 * Fait apparaître son contenu quand il entre dans le champ de vision.
 * Le style est porté par `[data-reveal]` (voir theme.css) ; ici on ne fait que
 * basculer l'attribut, une seule fois par élément.
 */
export function Reveal({
    as: Tag = 'div',
    delay = 0,
    className,
    children,
    ...props
}: { as?: ElementType; delay?: number; className?: string; children: ReactNode } & Record<string, unknown>) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        return watch(node);
    }, []);

    return (
        <Tag
            ref={ref}
            data-reveal=""
            style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
            className={className}
            {...props}
        >
            {children}
        </Tag>
    );
}
