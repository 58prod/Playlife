import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

/**
 * En-tête de page : un seul voile `mesh-soft` + `grain` par page, posé en
 * pleine largeur derrière le titre. Le contenu de la page reprend ensuite
 * son propre `container-page`.
 */
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
    return (
        <div className="relative overflow-hidden grain">
            <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] mesh-soft" aria-hidden="true" />
            <div className="container-page pb-12 pt-12 lg:pb-16 lg:pt-20">
                <header className="flex flex-col gap-7 animate-fade-up md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                        <h1 className="mt-5 text-section">{title}</h1>
                        {description && <p className="mt-5 text-lead text-gray-600">{description}</p>}
                    </div>
                    {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
                </header>
            </div>
        </div>
    );
}
