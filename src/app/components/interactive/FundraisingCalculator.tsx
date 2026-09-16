import { useState } from 'react';
import { Minus, Plus, Target, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatEuro, fundraisingGoal, PACK_COST } from '@/lib/playlife';

const AVERAGE_DONATIONS = [20, 30, 50, 100];

/** Calcule l'objectif de cagnotte et le nombre de donateurs à mobiliser. */
export function FundraisingCalculator({ className, action }: { className?: string; action?: React.ReactNode }) {
    const [packs, setPacks] = useState(1);
    const [average, setAverage] = useState(30);
    const result = fundraisingGoal(packs, average);
    const step = 'flex size-10 items-center justify-center rounded-xl bg-white text-ink-900 ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 disabled:opacity-40';

    return (
        <div className={cn('rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06] md:p-8', className)}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Préparer sa collecte</p>
            <h3 className="mt-2 text-2xl font-bold">Quel objectif pour ma cagnotte ?</h3>

            <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-medium text-ink-800" id="packs-label">Nombre de packs à remettre</p>
                        <div className="mt-2 flex items-center gap-3" role="group" aria-labelledby="packs-label">
                            <button type="button" className={step} onClick={() => setPacks(p => Math.max(1, p - 1))} disabled={packs <= 1} aria-label="Un pack de moins"><Minus className="size-4" aria-hidden="true" /></button>
                            <span className="w-12 text-center text-3xl font-bold tabular-nums text-ink-900" aria-live="polite">{packs}</span>
                            <button type="button" className={step} onClick={() => setPacks(p => Math.min(10, p + 1))} disabled={packs >= 10} aria-label="Un pack de plus"><Plus className="size-4" aria-hidden="true" /></button>
                            <span className="text-sm text-gray-500">× {formatEuro(PACK_COST)}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-ink-800" id="average-label">Don moyen de vos proches</p>
                        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="average-label">
                            {AVERAGE_DONATIONS.map(value => (
                                <button key={value} type="button" onClick={() => setAverage(value)} aria-pressed={average === value}
                                    className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition', average === value ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-800 ring-gray-200 hover:ring-gray-300')}>
                                    {formatEuro(value)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <dl className="grid grid-cols-2 gap-3" aria-live="polite">
                    <div className="col-span-2 rounded-2xl bg-ink-900 p-5 text-white">
                        <dt className="flex items-center gap-2 text-sm text-ink-200"><Target className="size-4" aria-hidden="true" />Objectif de la cagnotte</dt>
                        <dd className="mt-1 text-4xl font-bold tabular-nums">{formatEuro(result.goal)}</dd>
                    </div>
                    <div className="rounded-2xl bg-surface-100 p-4">
                        <dt className="flex items-center gap-1.5 text-sm text-gray-600"><Users className="size-4" aria-hidden="true" />Donateurs à mobiliser</dt>
                        <dd className="mt-1 text-2xl font-bold tabular-nums text-ink-900">{result.donors}</dd>
                    </div>
                    <div className="rounded-2xl bg-surface-100 p-4">
                        <dt className="text-sm text-gray-600">Enfants concernés</dt>
                        <dd className="mt-1 text-2xl font-bold tabular-nums text-ink-900">≈ {result.children}</dd>
                    </div>
                    <p className="col-span-2 text-sm text-gray-600">
                        Argument clé : un don de {formatEuro(average)} ne coûte que <strong className="text-ink-900">{formatEuro(result.realCostPerDonor)}</strong> à vos proches après réduction d'impôt.
                    </p>
                </dl>
            </div>
            {action && <div className="mt-8 border-t border-gray-100 pt-6">{action}</div>}
        </div>
    );
}
