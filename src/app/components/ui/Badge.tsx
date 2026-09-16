import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'brand' | 'ink' | 'success' | 'warning' | 'info' | 'danger';

const tones: Record<BadgeTone, string> = {
    neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
    brand: 'bg-brand-50 text-brand-700 ring-brand-100',
    ink: 'bg-ink-50 text-ink-800 ring-ink-100',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-800 ring-amber-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-100',
    danger: 'bg-red-50 text-red-700 ring-red-100',
};

export function Badge({ tone = 'neutral', icon: Icon, children, className }: { tone?: BadgeTone; icon?: ComponentType<{ className?: string }>; children: ReactNode; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap', tones[tone], className)}>
            {Icon && <Icon className="size-3.5" />}
            {children}
        </span>
    );
}
