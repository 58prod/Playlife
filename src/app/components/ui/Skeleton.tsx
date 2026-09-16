import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-lg bg-ink-900/[0.06]', className)} aria-hidden="true" />;
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Chargement">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/[0.06]">
                    <Skeleton className="aspect-[16/10] rounded-none" />
                    <div className="space-y-3 p-5">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
