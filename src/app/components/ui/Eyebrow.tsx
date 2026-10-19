import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Intitulé de section : filet court + libellé, pour ancrer chaque bloc.
 * Même motif sur toutes les pages ; `tone` s'adapte aux fonds sombres.
 */
export function Eyebrow({ children, tone = 'light', className }: { children: ReactNode; tone?: 'light' | 'dark'; className?: string }) {
    return (
        <p className={cn('flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]', tone === 'dark' ? 'text-ink-300' : 'text-gray-500', className)}>
            <span className={cn('h-px w-8 shrink-0', tone === 'dark' ? 'bg-ink-300/40' : 'bg-gray-300')} aria-hidden="true" />
            {children}
        </p>
    );
}
