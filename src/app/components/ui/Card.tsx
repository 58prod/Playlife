import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('rounded-2xl bg-white ring-1 ring-ink-900/[0.06] shadow-soft', className)} {...props} />;
}
