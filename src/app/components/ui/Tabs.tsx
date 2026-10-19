import { cn } from '@/lib/cn';

interface TabOption<T extends string> { value: T; label: string; count?: number }

export function Tabs<T extends string>({ value, onChange, options, label, className }: { value: T; onChange: (value: T) => void; options: TabOption<T>[]; label: string; className?: string }) {
    return (
        <div role="tablist" aria-label={label} className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink-900/[0.04] p-1 ring-1 ring-ink-900/[0.06] [scrollbar-width:none]', className)}>
            {options.map(option => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-500 ease-[var(--ease-out-expo)]',
                            active ? 'bg-white text-ink-900 shadow-card' : 'text-gray-600 hover:text-ink-900',
                        )}
                    >
                        {option.label}
                        {option.count !== undefined && (
                            <span className={cn('rounded-full px-1.5 text-xs tabular-nums', active ? 'bg-ink-900 text-white' : 'bg-ink-900/[0.06] text-gray-500')}>{option.count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
