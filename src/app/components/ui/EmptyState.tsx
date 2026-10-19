import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function EmptyState({ icon: Icon, title, description, action, className }: { icon: ComponentType<{ className?: string }>; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col items-center rounded-[2rem] bg-white/70 px-6 py-16 text-center ring-1 ring-ink-900/[0.07] shadow-card', className)}>
            <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-ink-900/[0.04] text-ink-900 ring-1 ring-ink-900/[0.06]">
                <Icon className="size-7" />
            </span>
            <h3 className="text-title">{title}</h3>
            {description && <p className="mt-3 max-w-md text-gray-600">{description}</p>}
            {action && <div className="mt-7">{action}</div>}
        </div>
    );
}
