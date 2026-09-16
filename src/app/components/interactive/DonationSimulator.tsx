import { useId, useState } from 'react';
import { Building2, Heart, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { donationSimulation, formatEuro, PACK, PACK_COST, TAX_RATE, type DonorType } from '@/lib/playlife';

const PRESETS: Record<DonorType, number[]> = {
    particulier: [20, 50, 100, 300],
    entreprise: [300, 1000, 3000, 10000],
};
const RANGE: Record<DonorType, { max: number; step: number }> = {
    particulier: { max: 1000, step: 5 },
    entreprise: { max: 20000, step: 100 },
};

const pct = (rate: number) => `${Math.round(rate * 100)} %`;

/** Simulateur « ce que je paye vraiment » après réduction d'impôt. */
export function DonationSimulator({ className }: { className?: string }) {
    const id = useId();
    const [donor, setDonor] = useState<DonorType>('particulier');
    const [amount, setAmount] = useState(100);
    const sim = donationSimulation(amount, donor);
    const packs = Math.floor(sim.packShare);
    const range = RANGE[donor];

    const changeDonor = (next: DonorType) => {
        setDonor(next);
        setAmount(PRESETS[next][1]);
    };

    return (
        <div className={cn('rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06] md:p-8', className)}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Simulateur</p>
                    <h3 className="mt-2 text-2xl font-bold">Combien me coûte vraiment mon don ?</h3>
                </div>
                <div className="inline-flex shrink-0 rounded-xl bg-ink-900/[0.05] p-1" role="group" aria-label="Type de donateur">
                    {([['particulier', 'Particulier', User], ['entreprise', 'Entreprise', Building2]] as const).map(([value, label, Icon]) => (
                        <button key={value} type="button" onClick={() => changeDonor(value)} aria-pressed={donor === value}
                            className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition', donor === value ? 'bg-white text-ink-900 shadow-soft' : 'text-gray-600 hover:text-ink-900')}>
                            <Icon className="size-4" aria-hidden="true" />{label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Saisie */}
                <div>
                    <label htmlFor={`${id}-amount`} className="text-sm font-medium text-ink-800">Montant du don</label>
                    <div className="mt-2 flex items-baseline gap-2">
                        <input
                            id={`${id}-amount`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={donor === 'particulier' ? 5 : 100}
                            value={amount || ''}
                            onChange={e => setAmount(Math.min(1_000_000, Math.max(0, Number(e.target.value))))}
                            className="w-40 rounded-xl bg-surface-50 px-3 py-2 text-4xl font-bold tabular-nums text-ink-900 ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-3xl font-bold text-ink-900">€</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={range.max}
                        step={range.step}
                        value={Math.min(amount, range.max)}
                        onChange={e => setAmount(Number(e.target.value))}
                        aria-label="Ajuster le montant du don"
                        className="mt-5 w-full accent-brand-500"
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                        {PRESETS[donor].map(preset => (
                            <button key={preset} type="button" onClick={() => setAmount(preset)} aria-pressed={amount === preset}
                                className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition', amount === preset ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-800 ring-gray-200 hover:ring-gray-300')}>
                                {formatEuro(preset)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Résultat */}
                <div aria-live="polite">
                    <p className="text-sm text-gray-600">Après réduction d'impôt de {pct(TAX_RATE[donor])}, votre don vous coûte</p>
                    <p className="mt-1 text-5xl font-bold tabular-nums text-brand-500">{formatEuro(sim.realCost)}</p>

                    <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                        <div className="bg-brand-500 transition-all duration-300" style={{ width: `${100 - TAX_RATE[donor] * 100}%` }} />
                        <div className="bg-ink-300 transition-all duration-300" style={{ width: `${TAX_RATE[donor] * 100}%` }} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="flex items-center gap-1.5 text-gray-600"><span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />Coût réel</dt>
                            <dd className="font-semibold tabular-nums text-ink-900">{formatEuro(sim.realCost)}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1.5 text-gray-600"><span className="size-2 rounded-full bg-ink-300" aria-hidden="true" />Réduction d'impôt</dt>
                            <dd className="font-semibold tabular-nums text-ink-900">{formatEuro(sim.reduction)}</dd>
                        </div>
                    </dl>

                    <div className="mt-6 rounded-2xl bg-surface-100 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                            <Heart className="size-4 fill-brand-500 text-brand-500" aria-hidden="true" />
                            {packs >= 1
                                ? `Soit ${packs} pack${packs > 1 ? 's' : ''} Playlife complet${packs > 1 ? 's' : ''}, pour ≈ ${packs * PACK.childrenPerPack} enfants`
                                : `Soit ${Math.max(1, Math.round(sim.packShare * 100))} % d'un pack Playlife`}
                        </p>
                        {packs < 1 && (
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
                                <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${Math.min(100, sim.packShare * 100)}%` }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-6 text-xs text-gray-500">
                Simulation indicative. {donor === 'particulier'
                    ? 'Réduction de 66 % dans la limite de 20 % du revenu imposable ; l\'excédent est reportable sur 5 ans.'
                    : 'Réduction de 60 % dans la limite de 20 000 € ou 0,5 % du chiffre d\'affaires HT (le montant le plus élevé).'} Un pack coûte environ {formatEuro(PACK_COST)}.
            </p>
        </div>
    );
}

/** Version compacte, à côté du bouton « Soutenir cette mission ». */
export function DonationSimulatorCompact({ className }: { className?: string }) {
    const [amount, setAmount] = useState(50);
    const sim = donationSimulation(amount, 'particulier');
    return (
        <div className={cn('rounded-2xl bg-surface-100 p-4', className)}>
            <p className="text-xs font-semibold text-ink-800">Combien coûte vraiment votre don ?</p>
            <div className="mt-2 flex gap-1.5" role="group" aria-label="Montant du don">
                {[20, 50, 100].map(value => (
                    <button key={value} type="button" onClick={() => setAmount(value)} aria-pressed={amount === value}
                        className={cn('flex-1 rounded-lg py-1.5 text-sm font-medium transition', amount === value ? 'bg-ink-900 text-white' : 'bg-white text-ink-800 hover:bg-gray-50')}>
                        {formatEuro(value)}
                    </button>
                ))}
            </div>
            <p className="mt-3 text-sm text-gray-600" aria-live="polite">
                Un don de {formatEuro(sim.amount)} ne vous coûte que <strong className="text-brand-600">{formatEuro(sim.realCost)}</strong> après réduction d'impôt.
            </p>
        </div>
    );
}
