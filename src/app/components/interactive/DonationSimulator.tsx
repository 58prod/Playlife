import { useId, useState } from 'react';
import { Building2, Heart, Receipt, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { donationSimulation, formatEuro, PACK, PACK_COST, TAX_RATE, type DonorType } from '@/lib/playlife';
import { Eyebrow } from '../ui/Eyebrow';

const PRESETS: Record<DonorType, number[]> = {
    particulier: [20, 50, 100, 300],
    entreprise: [300, 1000, 3000, 10000],
};
const RANGE: Record<DonorType, { max: number; step: number }> = {
    particulier: { max: 1000, step: 5 },
    entreprise: { max: 20000, step: 100 },
};

const pct = (rate: number) => `${Math.round(rate * 100)} %`;

/** Pastille de choix, même motif que les onglets : pilule blanche sur fond neutre. */
const segment = (active: boolean) =>
    cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-500 ease-[var(--ease-out-expo)]',
        active ? 'bg-white text-ink-900 shadow-card' : 'text-gray-600 hover:text-ink-900');

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
        <div className={cn('rounded-[2rem] bg-white p-7 ring-1 ring-ink-900/[0.07] shadow-card md:p-10', className)}>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                    <Eyebrow>Simulateur</Eyebrow>
                    <h3 className="mt-4 text-title">Combien me coûte vraiment mon don ?</h3>
                </div>
                <div className="inline-flex shrink-0 rounded-full bg-ink-900/[0.04] p-1 ring-1 ring-ink-900/[0.06]" role="group" aria-label="Type de donateur">
                    {([['particulier', 'Particulier', User], ['entreprise', 'Entreprise', Building2]] as const).map(([value, label, Icon]) => (
                        <button key={value} type="button" onClick={() => changeDonor(value)} aria-pressed={donor === value} className={segment(donor === value)}>
                            <Icon className="size-4" aria-hidden="true" />{label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
                {/* Saisie */}
                <div>
                    <label htmlFor={`${id}-amount`} className="text-sm font-medium text-ink-800">Montant du don</label>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <input
                            id={`${id}-amount`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={donor === 'particulier' ? 5 : 100}
                            value={amount || ''}
                            onChange={e => setAmount(Math.min(1_000_000, Math.max(0, Number(e.target.value))))}
                            className="w-40 rounded-2xl bg-surface-50 px-4 py-2 font-display text-4xl font-semibold tabular-nums tracking-[-0.035em] text-ink-900 ring-1 ring-inset ring-ink-900/[0.09] transition duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="font-display text-3xl font-semibold text-ink-900">€</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={range.max}
                        step={range.step}
                        value={Math.min(amount, range.max)}
                        onChange={e => setAmount(Number(e.target.value))}
                        aria-label="Ajuster le montant du don"
                        className="mt-6 w-full accent-ink-900"
                    />
                    <div className="mt-5 flex flex-wrap gap-2">
                        {PRESETS[donor].map(preset => (
                            <button key={preset} type="button" onClick={() => setAmount(preset)} aria-pressed={amount === preset}
                                className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition-all duration-500 ease-[var(--ease-out-expo)]',
                                    amount === preset ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-800 ring-ink-900/[0.09] hover:ring-ink-900/[0.16]')}>
                                {formatEuro(preset)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Résultat */}
                <div aria-live="polite">
                    <p className="text-sm text-gray-600">Après réduction d'impôt de {pct(TAX_RATE[donor])}, votre don vous coûte</p>
                    <p className="mt-1.5 font-display text-5xl font-semibold tabular-nums tracking-[-0.04em] text-brand-600">{formatEuro(sim.realCost)}</p>

                    <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-ink-900/[0.06]" aria-hidden="true">
                        <div className="bg-brand-500 transition-all duration-500 ease-[var(--ease-out-expo)]" style={{ width: `${100 - TAX_RATE[donor] * 100}%` }} />
                        <div className="bg-ink-900 transition-all duration-500 ease-[var(--ease-out-expo)]" style={{ width: `${TAX_RATE[donor] * 100}%` }} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="flex items-center gap-1.5 text-gray-600"><span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />Coût réel</dt>
                            <dd className="font-semibold tabular-nums text-ink-900">{formatEuro(sim.realCost)}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1.5 text-gray-600"><span className="size-2 rounded-full bg-ink-900" aria-hidden="true" />Réduction d'impôt</dt>
                            <dd className="font-semibold tabular-nums text-ink-900">{formatEuro(sim.reduction)}</dd>
                        </div>
                    </dl>

                    <div className="mt-7 rounded-2xl bg-surface-100 p-5 ring-1 ring-ink-900/[0.05]">
                        <p className="flex items-center gap-2.5 text-sm font-semibold text-ink-900">
                            <Heart className="size-4 shrink-0 text-ink-900/45" aria-hidden="true" />
                            {packs >= 1
                                ? `Soit ${packs} pack${packs > 1 ? 's' : ''} Playlife complet${packs > 1 ? 's' : ''}, pour ≈ ${packs * PACK.childrenPerPack} enfants`
                                : `Soit ${Math.max(1, Math.round(sim.packShare * 100))} % d'un pack Playlife`}
                        </p>
                        {packs < 1 && (
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
                                <div className="h-full rounded-full bg-ink-900 transition-all duration-500 ease-[var(--ease-out-expo)]" style={{ width: `${Math.min(100, sim.packShare * 100)}%` }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-8 flex items-start gap-2.5 rounded-2xl bg-surface-100 p-4 text-sm text-ink-800 ring-1 ring-ink-900/[0.05]">
                <Receipt className="mt-0.5 size-4 shrink-0 text-ink-900/45" aria-hidden="true" />
                <span>Votre <strong>reçu fiscal</strong> est envoyé <strong>automatiquement</strong> par la plateforme partenaire (Leetchi) : aucune démarche à faire.</span>
            </p>
            <p className="mt-4 text-xs text-gray-500">
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
        <div className={cn('rounded-2xl bg-surface-100 p-4 ring-1 ring-ink-900/[0.05]', className)}>
            <p className="text-xs font-semibold text-ink-800">Combien coûte vraiment votre don ?</p>
            <div className="mt-2.5 flex gap-1.5" role="group" aria-label="Montant du don">
                {[20, 50, 100].map(value => (
                    <button key={value} type="button" onClick={() => setAmount(value)} aria-pressed={amount === value}
                        className={cn('flex-1 rounded-full py-1.5 text-sm font-medium transition-all duration-500 ease-[var(--ease-out-expo)]', amount === value ? 'bg-ink-900 text-white' : 'bg-white text-ink-800 ring-1 ring-inset ring-ink-900/[0.07] hover:ring-ink-900/[0.14]')}>
                        {formatEuro(value)}
                    </button>
                ))}
            </div>
            <p className="mt-3.5 text-sm text-gray-600" aria-live="polite">
                Un don de {formatEuro(sim.amount)} ne vous coûte que <strong className="text-brand-600">{formatEuro(sim.realCost)}</strong> après réduction d'impôt.
            </p>
            <p className="mt-2 text-xs text-gray-500">Reçu fiscal envoyé automatiquement par Leetchi.</p>
        </div>
    );
}
