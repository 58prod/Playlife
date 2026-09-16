import type { ComponentType, ReactNode } from 'react';

export const adminInputClass = 'block w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500';

export function SectionTitle({ icon: Icon, title, count, children }: { icon: ComponentType<{ className?: string }>; title: string; count?: number; children?: ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-brand-500" />
                <h2 className="text-2xl font-bold">{title}</h2>
                {count !== undefined && <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{count}</span>}
            </div>
            {children}
        </div>
    );
}

export function FilterTabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string; count: number }>; label: string }) {
    return (
        <div className="flex flex-wrap gap-1 rounded-xl bg-ink-900/[0.05] p-1" role="group" aria-label={label}>
            {options.map(o => (
                <button
                    key={o.value}
                    type="button"
                    onClick={() => onChange(o.value)}
                    aria-pressed={value === o.value}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${value === o.value ? 'bg-white text-ink-900 shadow-soft' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    {o.label} <span className="text-xs text-gray-400">({o.count})</span>
                </button>
            ))}
        </div>
    );
}

export function Pagination({ page, total, onChange, label }: { page: number; total: number; onChange: (page: number) => void; label: string }) {
    if (total <= 1) return null;
    const btn = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
    return (
        <nav className="flex flex-wrap items-center justify-center gap-2 mt-4" aria-label={label}>
            <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btn} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`} aria-label="Page précédente">←</button>
            {Array.from({ length: total }, (_, i) => i + 1).map(p => (
                <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
                    className={`${btn} ${p === page ? 'bg-ink-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    {p}
                </button>
            ))}
            <button type="button" onClick={() => onChange(page + 1)} disabled={page === total} className={`${btn} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`} aria-label="Page suivante">→</button>
        </nav>
    );
}

export function EmptyState({ children }: { children: ReactNode }) {
    return <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-10 text-center text-gray-500">{children}</div>;
}

export const PER_PAGE = 10;

export function paginate<T>(items: T[], page: number): { pageItems: T[]; totalPages: number; safePage: number } {
    const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    return { pageItems: items.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE), totalPages, safePage };
}
