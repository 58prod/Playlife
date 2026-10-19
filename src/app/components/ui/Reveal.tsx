import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

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

        // Sans IntersectionObserver (ou en mouvement réduit), on affiche tout de suite.
        if (typeof IntersectionObserver === 'undefined') {
            node.dataset.reveal = 'in';
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    // `top < 0` rattrape les sauts de défilement (ancre, touche Fin) :
                    // l'élément peut passer sous puis au-dessus de l'écran sans jamais
                    // être signalé comme visible, et resterait alors transparent.
                    const passed = entry.boundingClientRect.top < 0;
                    if (!entry.isIntersecting && !passed) continue;
                    (entry.target as HTMLElement).dataset.reveal = 'in';
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
        );
        observer.observe(node);
        return () => observer.disconnect();
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
