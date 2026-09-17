import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Eye, GraduationCap, HandHeart, Handshake, Heart, Package, Quote, ShieldCheck, Trophy } from 'lucide-react';
import { countryFlag } from '@/lib/structures';
import photo from '@/assets/accueil-1.jpg';
import heart from '@/assets/coeur-playlife.png';
import { ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

const SITE_URL = 'https://www.playlife.today';

const PILLARS = [
    { icon: Package, title: 'Envoyer du matériel', text: 'Ballons, plots, chasubles : du matériel sportif pour les écoles, orphelinats et établissements non équipés.' },
    { icon: Trophy, title: 'Financer des infrastructures', text: 'Soutenir la création de lieux où les enfants peuvent pratiquer une activité sportive.' },
    { icon: GraduationCap, title: 'Partager le savoir', text: 'Transmettre les connaissances en activités physiques aux encadrants sur place.' },
];

const COUNTRIES: Array<[string, string]> = [['PH', 'Philippines'], ['UY', 'Uruguay'], ['MA', 'Maroc'], ['BJ', 'Bénin'], ['DO', 'République dominicaine'], ['FR', 'France']];

const PEOPLE: Array<{ name: string; role: string; detail?: string }> = [
    { name: 'Alphonse Areola', role: 'Parrain', detail: 'Gardien de but, champion du monde 2018' },
    { name: 'Nando De Colo', role: 'Ambassadeur', detail: 'Basketteur international français' },
    { name: 'Edinson Cavani', role: 'Ambassadeur', detail: 'Footballeur international uruguayen' },
    { name: 'Pauline Parmentier', role: 'Ambassadrice', detail: 'Joueuse de tennis française' },
    { name: 'Aurore Bourçois', role: 'Ambassadrice' },
];

const COMMITMENTS = [
    { icon: HandHeart, title: '100 % des dons pour les envois', text: 'L\'objectif de l\'association : que chaque euro donné serve directement à équiper des enfants.' },
    { icon: Eye, title: 'Transparence', text: 'Chaque mission est référencée avec sa cagnotte, et les reçus fiscaux sont émis automatiquement.' },
    { icon: Handshake, title: 'Des partenaires locaux', text: 'Les packs sont remis à des structures qui connaissent les enfants et leurs besoins, en accord avec elles.' },
    { icon: ShieldCheck, title: 'Le respect des enfants', text: 'Photos avec accord, dignité des personnes, coordonnées des structures réservées aux membres.' },
];

function Eyebrow({ children }: { children: ReactNode }) {
    return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{children}</p>;
}

export default function Association() {
    return (
        <div className="pt-8 lg:pt-14">
            <div className="container-page">
                <PageHeader
                    eyebrow="L'association"
                    title="Qui est Playlife ?"
                    description="Une association humanitaire née en 2015 d'une conviction simple : le sport change la vie des enfants."
                    actions={<ButtonLink to={SITE_URL} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg" iconRight={ArrowUpRight}>www.playlife.today</ButtonLink>}
                />

                {/* Histoire */}
                <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16" aria-labelledby="story-title">
                    <div className="relative">
                        <img src={photo} alt="Enfant jouant au football avec un ballon Playlife" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
                        <img src={heart} alt="" aria-hidden="true" className="absolute -bottom-6 -right-4 w-24 rotate-6 drop-shadow-xl md:w-28" />
                    </div>
                    <div>
                        <Eyebrow>Notre histoire</Eyebrow>
                        <h2 id="story-title" className="mt-3 text-3xl font-bold md:text-4xl">Du sport pour ceux qui n'en ont pas</h2>
                        <div className="mt-5 space-y-4 text-lg text-gray-600">
                            <p>Playlife est née en <strong className="text-ink-900">2015</strong>, à l'initiative de professionnels convaincus des bienfaits du sport dans l'éducation. Après plusieurs années à consolider le projet avec des partenaires et des ambassadeurs, l'association est officiellement créée en <strong className="text-ink-900">2018</strong>.</p>
                            <p>Sa mission : distribuer et envoyer du matériel sportif dans les écoles, orphelinats et établissements non équipés, souvent dans des pays défavorisés.</p>
                        </div>
                        <figure className="mt-8 rounded-2xl bg-surface-100 p-6">
                            <Quote className="size-6 text-brand-500" aria-hidden="true" />
                            <blockquote className="mt-3 text-xl font-semibold leading-snug text-ink-900">Le sport est une source directe de valeurs fondamentales : le respect, l'apprentissage et le dépassement de soi.</blockquote>
                        </figure>
                    </div>
                </section>
            </div>

            {/* Piliers */}
            <section className="mt-20 bg-white py-20 lg:mt-28 lg:py-24" aria-labelledby="pillars-title">
                <div className="container-page">
                    <Eyebrow>Notre action</Eyebrow>
                    <h2 id="pillars-title" className="mt-3 text-3xl font-bold md:text-4xl">Trois façons d'agir</h2>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {PILLARS.map(({ icon: Icon, title, text }, index) => (
                            <article key={title} className="rounded-3xl bg-surface-50 p-7 ring-1 ring-ink-900/[0.06]">
                                <div className="flex items-center justify-between">
                                    <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><Icon className="size-6" aria-hidden="true" /></span>
                                    <span className="text-5xl font-bold text-ink-900/[0.07]" aria-hidden="true">0{index + 1}</span>
                                </div>
                                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                                <p className="mt-2 text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container-page">
                {/* Pays */}
                <section className="py-20 lg:py-24" aria-labelledby="countries-title">
                    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
                        <div>
                            <Eyebrow>Sur le terrain</Eyebrow>
                            <h2 id="countries-title" className="mt-3 text-3xl font-bold md:text-4xl">Des missions sur quatre continents</h2>
                            <p className="mt-4 text-lg text-gray-600">Depuis 2018, des packs Playlife ont été remis à des enfants en Asie, en Amérique, en Afrique et en Europe. Avec Playlife Connect, chacun peut désormais ouvrir une nouvelle destination.</p>
                        </div>
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {COUNTRIES.map(([code, name]) => (
                                <li key={code} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-ink-900/[0.06]">
                                    <span className="text-3xl" aria-hidden="true">{countryFlag(code)}</span>
                                    <span className="font-medium text-ink-900">{name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Parrain & ambassadeurs */}
                <section className="rounded-[2rem] bg-ink-900 p-8 text-white md:p-12" aria-labelledby="people-title">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Ils nous soutiennent</p>
                    <h2 id="people-title" className="mt-3 text-3xl font-bold text-white md:text-4xl">Parrain et ambassadeurs</h2>
                    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PEOPLE.map(person => (
                            <li key={person.name} className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                                <span className="inline-flex rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white">{person.role}</span>
                                <p className="mt-4 text-xl font-semibold text-white">{person.name}</p>
                                {person.detail && <p className="mt-1 text-sm text-ink-200">{person.detail}</p>}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Engagements */}
                <section className="py-20 lg:py-24" aria-labelledby="commitments-title">
                    <Eyebrow>Nos engagements</Eyebrow>
                    <h2 id="commitments-title" className="mt-3 text-3xl font-bold md:text-4xl">Une solidarité exigeante</h2>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {COMMITMENTS.map(({ icon: Icon, title, text }) => (
                            <article key={title} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06]">
                                <Icon className="size-6 text-brand-500" aria-hidden="true" />
                                <h3 className="mt-4 font-semibold">{title}</h3>
                                <p className="mt-2 text-sm text-gray-600">{text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Playlife Connect + liens */}
                <section className="grid gap-6 lg:grid-cols-2" aria-label="Aller plus loin">
                    <div className="flex flex-col rounded-3xl bg-surface-100 p-8 md:p-10">
                        <Heart className="size-7 fill-brand-500 text-brand-500" aria-hidden="true" />
                        <h2 className="mt-5 text-2xl font-bold">Playlife Connect, la plateforme</h2>
                        <p className="mt-3 flex-1 text-gray-600">Pour aller plus loin, Playlife a créé Playlife Connect : voyageurs, enseignants et animateurs y organisent eux-mêmes leur mission solidaire, accompagnés par l'association à chaque étape.</p>
                        <div className="mt-6"><ButtonLink to="/comment-ca-marche" iconRight={ArrowRight}>Comment ça marche</ButtonLink></div>
                    </div>
                    <div className="flex flex-col rounded-3xl bg-white p-8 shadow-soft ring-1 ring-ink-900/[0.06] md:p-10">
                        <img src={heart} alt="" aria-hidden="true" className="w-14" />
                        <h2 className="mt-5 text-2xl font-bold">Découvrir l'association</h2>
                        <p className="mt-3 flex-1 text-gray-600">Actualités, histoires de missions, dons à l'association et contact : retrouvez tout l'univers Playlife sur son site officiel.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <ButtonLink to={SITE_URL} target="_blank" rel="noopener noreferrer" variant="dark" iconRight={ArrowUpRight}>www.playlife.today</ButtonLink>
                            <ButtonLink to={`${SITE_URL}/dons/`} target="_blank" rel="noopener noreferrer" variant="secondary" iconRight={ArrowUpRight}>Faire un don</ButtonLink>
                        </div>
                        <p className="mt-6 text-xs text-gray-500">Association loi 1901 · SIRET 991 252 909 00015 · 151 rue de la Fouillade, 34820 Teyran</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
