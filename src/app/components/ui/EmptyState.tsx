import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function EmptyState({ icon: Icon, title, description, action, className }: { icon: ComponentType<{ className?: string }>; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-14 text-center', className)}>
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
                <Icon className="size-7" />
            </span>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="mt-1.5 max-w-md text-sm text-gray-500">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
