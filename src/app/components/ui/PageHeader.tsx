import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
    return (
        <header className="flex flex-col gap-5 pb-8 md:flex-row md:items-end md:justify-between animate-fade-up">
            <div className="max-w-2xl">
                {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{eyebrow}</p>}
                <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
                {description && <p className="mt-3 text-base text-gray-600 md:text-lg">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
        </header>
    );
}
