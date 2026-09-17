import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, GraduationCap, Plane, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatEuro, PACK, PACK_COST } from '@/lib/playlife';
import { DonationSimulator } from '../components/interactive/DonationSimulator';
import { FundraisingCalculator } from '../components/interactive/FundraisingCalculator';
import { ResourcesSection } from '../components/ResourcesSection';
import heart from '@/assets/coeur-playlife.png';
import { ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs } from '../components/ui/Tabs';

const LEETCHI = <a href="https://www.leetchi.org/project/playlife" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500">leetchi.org/project/playlife</a>;

type Journey = { title: string; text?: ReactNode; points?: string[] };

const JOURNEYS: Record<'voyageur' | 'animateur', { icon: typeof Plane; title: string; subtitle: string; intro: string; steps: Journey[] }> = {
    voyageur: {
        icon: Plane,
        title: 'Voyageur solidaire',
        subtitle: 'Transforme ton déplacement en action utile',
        intro: 'Tu pars à l\'étranger pour le travail ou les vacances ? En quelques étapes, tu peux créer une mission Playlife.',
        steps: [
            { title: 'Crée ton compte', text: 'Ton espace personnel en 2 minutes.' },
            { title: 'Déclare ta mission', text: 'Pays, date, structure bénéficiaire (ou tu en proposes une), type de pack.' },
            { title: 'Lance ta cagnotte', text: <>Crée une cagnotte dédiée sur {LEETCHI}, puis renseigne le lien dans Playlife Connect : ta mission est officiellement référencée.</> },
            { title: 'Mobilise ton entourage', points: ['Un lien à partager', 'Un objectif clair', 'Un impact mesurable'] },
            { title: 'Objectif atteint ? On passe à l\'action', points: ['Le matériel est acheté et envoyé à ton adresse', 'Tu reçois les consignes et documents administratifs'] },
            { title: 'Remets le pack à la structure', points: ['Organisation de la rencontre (date et lieu précis)', 'Rencontre et remise du pack'] },
            { title: 'Inspire les autres', text: 'Photos, témoignages, émotions : tu deviens un Playlife Player.' },
        ],
    },
    animateur: {
        icon: GraduationCap,
        title: 'Enseignant / Animateur',
        subtitle: 'Fais vivre la solidarité à ton groupe',
        intro: 'Tu encadres des enfants ou des adolescents ? Transforme ton projet pédagogique en mission solidaire concrète.',
        steps: [
            { title: 'Crée ton compte', text: 'Ton espace personnel en 2 minutes.' },
            { title: 'Crée la mission', text: 'Pays, date, structure bénéficiaire (ou tu en proposes une), type de pack.' },
            { title: 'Crée la cagnotte', text: <>La cagnotte est créée au nom du projet solidaire, rattachée à Playlife sur {LEETCHI}. Son lien est ajouté à la mission pour assurer la traçabilité.</> },
            { title: 'Mobilisation pédagogique', points: ['Implication des élèves', 'Communication aux familles', 'Sensibilisation à la solidarité'] },
            { title: 'Objectif atteint : commande et préparation', points: ['Achat du matériel, envoyé au responsable de la mission', 'Création du pack avec les élèves (messages, dons supplémentaires)', 'Organisation logistique et documents nécessaires'] },
            { title: 'Envoi du pack', text: 'Le pack est envoyé directement à la structure bénéficiaire.' },
            { title: 'Retour d\'impact', text: 'Les élèves voient concrètement le résultat de leur engagement.' },
        ],
    },
};

const PACK_CONTENT = [
    { value: '8 à 12', label: 'ballons', text: 'Football, basketball, volleyball… selon les besoins locaux.' },
    { value: 'Chasubles', label: '& plots', text: 'Pour organiser des équipes et structurer les ateliers.' },
    { value: 'Kit', label: 'd\'entretien', text: 'Pompes et aiguilles pour l\'autonomie et la durabilité du matériel.' },
];

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
    return (
        <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">{title}</h2>
            {children && <div className="mt-4 text-lg text-gray-600">{children}</div>}
        </div>
    );
}

export default function CommentCaMarche() {
    const { user } = useAuth();
    const [journey, setJourney] = useState<'voyageur' | 'animateur'>('voyageur');
    const current = JOURNEYS[journey];

    return (
        <div className="pt-8 lg:pt-14">
            <div className="container-page">
                <PageHeader eyebrow="Comment ça marche" title="Agir avec Playlife Connect" description="Une plateforme pour mener une action concrète pour les enfants du monde entier : simplement, concrètement, ensemble." />
            </div>

            {/* Le pack */}
            <section className="container-page" aria-labelledby="pack-title">
                <div className="grid gap-10 rounded-[2rem] bg-ink-900 p-8 text-white md:p-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Le cœur de la mission</p>
                        <h2 id="pack-title" className="mt-3 text-3xl font-bold text-white md:text-4xl">Qu'est-ce qu'un pack Playlife ?</h2>
                        <p className="mt-4 text-ink-200">Du matériel sportif simple, durable et immédiatement utilisable pour permettre à des enfants de jouer, s'entraîner et partager des moments collectifs.</p>
                        <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                            <span className="whitespace-nowrap font-display text-3xl font-bold">≈ {formatEuro(PACK_COST)}</span>
                            <span className="text-sm text-ink-200">{formatEuro(PACK.equipment)} de matériel<br />+ {formatEuro(PACK.delivery)} de livraison ou bagage</span>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                        {PACK_CONTENT.map(item => (
                            <div key={item.value} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                                <p className="font-display text-2xl font-bold">{item.value} <span className="text-brand-300">{item.label}</span></p>
                                <p className="mt-1 text-sm text-ink-200">{item.text}</p>
                            </div>
                        ))}
                        <p className="text-sm text-ink-200 sm:col-span-3 lg:col-span-1">🎯 <strong className="text-white">L'objectif :</strong> permettre à une structure locale (école, association, centre…) d'organiser des séances sportives complètes dès la réception du pack.</p>
                    </div>
                </div>
            </section>

            {/* Parcours */}
            <section className="container-page py-20 lg:py-28" aria-labelledby="journey-title">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <SectionTitle eyebrow="Pas à pas" title="Votre parcours en 7 étapes" />
                    <Tabs label="Choisir un parcours" value={journey} onChange={setJourney} options={[{ value: 'voyageur', label: 'Voyageur solidaire' }, { value: 'animateur', label: 'Enseignant / Animateur' }]} />
                </div>

                <div className="mt-10 grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-brand"><current.icon className="size-7" aria-hidden="true" /></span>
                        <h3 id="journey-title" className="mt-5 text-2xl font-bold">{current.title}</h3>
                        <p className="mt-1 font-medium text-brand-600">{current.subtitle}</p>
                        <p className="mt-4 text-gray-600">{current.intro}</p>
                        <ButtonLink to="/register" className="mt-6" iconRight={ArrowRight}>Créer mon compte</ButtonLink>
                    </div>
                    <ol key={journey} className="relative space-y-4 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-ink-900/10">
                        {current.steps.map((step, index) => (
                            <li key={step.title} className="relative flex gap-5 animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-display font-bold text-ink-900 shadow-soft ring-1 ring-ink-900/10">{index + 1}</span>
                                <div className="flex-1 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-900/[0.06]">
                                    <h4 className="font-semibold">{step.title}</h4>
                                    {step.text && <p className="mt-1.5 text-sm text-gray-600">{step.text}</p>}
                                    {step.points && (
                                        <ul className="mt-2 space-y-1.5">
                                            {step.points.map(point => (
                                                <li key={point} className="flex items-start gap-2 text-sm text-gray-600"><Check className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />{point}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Cagnotte & fiscalité */}
            <section className="bg-white py-20 lg:py-28" aria-labelledby="money-title">
                <div className="container-page space-y-6">
                    <SectionTitle eyebrow="Financer sa mission" title="La cagnotte, simplement">
                        Playlife dispose d'un rescrit fiscal : chaque don ouvre droit à une réduction d'impôt. De quoi convaincre facilement vos proches.
                    </SectionTitle>
                    <h2 id="money-title" className="sr-only">Cagnotte et réduction d'impôt</h2>

                    <DonationSimulator className="mt-4" />
                    <FundraisingCalculator action={<ButtonLink to={user ? '/missions?create=true' : '/login?create=true'} iconRight={ArrowRight}>Créer ma mission</ButtonLink>} />

                    <div className="rounded-3xl bg-surface-100 p-8 md:p-10">
                        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
                            <span className="flex size-12 items-center justify-center rounded-xl bg-white text-ink-900 shadow-soft"><ShieldCheck className="size-6" aria-hidden="true" /></span>
                            <div>
                                <h3 className="text-2xl font-bold">Des dons suivis de bout en bout</h3>
                                <p className="mt-3 text-gray-600">Chaque porteur de mission crée sa cagnotte sur {LEETCHI}. Le lien est intégré dans Playlife Connect pour garantir :</p>
                                <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                                    {['La traçabilité des dons', 'La cohérence avec la mission', 'L\'utilisation conforme des fonds'].map(item => (
                                        <li key={item} className="flex items-center gap-3 font-medium text-ink-900">
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white"><Check className="size-3.5" aria-hidden="true" /></span>{item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-6 text-sm text-gray-600">Les <strong className="text-ink-900">reçus fiscaux sont émis automatiquement</strong> par la plateforme partenaire (Leetchi), dans le respect du cadre réglementaire : ni le porteur de mission ni le donateur n'ont de démarche à faire.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pourquoi */}
            <section className="container-page pt-20 lg:pt-28" aria-labelledby="why-title">
                <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
                    <div>
                        <img src={heart} alt="" aria-hidden="true" className="w-24" />
                        <h2 id="why-title" className="mt-6 text-3xl font-bold md:text-5xl">Pourquoi Playlife Connect ?</h2>
                        <p className="mt-4 font-display text-2xl font-semibold text-brand-500">Simplement. Concrètement. Ensemble.</p>
                    </div>
                    <ul className="grid gap-4 sm:grid-cols-3">
                        {[
                            { icon: Plane, text: 'Un voyage peut devenir une action solidaire' },
                            { icon: GraduationCap, text: 'Un projet scolaire peut changer des vies' },
                            { icon: Users, text: 'Un simple partage peut financer un pack sportif' },
                        ].map(({ icon: Icon, text }) => (
                            <li key={text} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06]">
                                <Icon className="size-6 text-brand-500" aria-hidden="true" />
                                <p className="mt-4 font-semibold text-ink-900">{text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Ressources */}
            <div className="container-page pt-20 lg:pt-28">
                <ResourcesSection />
            </div>
        </div>
    );
}
