/**
 * Chiffres de référence Playlife, utilisés par les pages et les simulateurs.
 * Les modifier ici met à jour tout le site.
 */
export const PACK = {
    /** Coût du matériel d'un pack (€) */
    equipment: 250,
    /** Livraison ou bagage supplémentaire (€) */
    delivery: 50,
    /** Nombre moyen d'enfants qui profitent d'un pack (estimation) */
    childrenPerPack: 20,
} as const;

export const PACK_COST = PACK.equipment + PACK.delivery;

export type DonorType = 'particulier' | 'entreprise';

/**
 * Réduction d'impôt sur les dons (Playlife dispose d'un rescrit fiscal).
 * - Particuliers : 66 %, dans la limite de 20 % du revenu imposable.
 * - Entreprises : 60 %, dans la limite de 20 000 € ou 0,5 % du chiffre d'affaires HT.
 * Les plafonds ne sont pas pris en compte dans la simulation (indicative).
 */
export const TAX_RATE: Record<DonorType, number> = {
    particulier: 0.66,
    entreprise: 0.6,
};

export function donationSimulation(amount: number, donor: DonorType) {
    const safe = Math.max(0, Number.isFinite(amount) ? amount : 0);
    const reduction = Math.round(safe * TAX_RATE[donor] * 100) / 100;
    const realCost = Math.round((safe - reduction) * 100) / 100;
    return {
        amount: safe,
        reduction,
        realCost,
        /** Part d'un pack financée (1 = un pack complet) */
        packShare: safe / PACK_COST,
    };
}

export function fundraisingGoal(packs: number, averageDonation: number) {
    const goal = Math.max(1, packs) * PACK_COST;
    const donors = Math.ceil(goal / Math.max(1, averageDonation));
    return {
        goal,
        donors,
        children: Math.max(1, packs) * PACK.childrenPerPack,
        realCostPerDonor: donationSimulation(averageDonation, 'particulier').realCost,
    };
}

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const euroCents = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 34 € ou 16,50 € (centimes seulement si nécessaires) */
export function formatEuro(value: number): string {
    return Number.isInteger(value) ? euro.format(value) : euroCents.format(value);
}
