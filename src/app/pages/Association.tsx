import { ArrowRight, ArrowUpRight, Eye, GraduationCap, HandHeart, Handshake, Heart, Package, Quote, ShieldCheck, Trophy } from 'lucide-react';
import { countryFlag } from '@/lib/structures';
import photo from '@/assets/accueil-1.jpg';
import heart from '@/assets/coeur-playlife.png';
import { ButtonLink } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';
import { PageHeader } from '../components/ui/PageHeader';
import { Reveal } from '../components/ui/Reveal';

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
    { name: 'Aurore Bourçois', role: 'Ambassadrice', detail: 'Championne de karaté' },
];

const COMMITMENTS = [
    { icon: HandHeart, title: '100 % des dons pour les envois', text: 'L\'objectif de l\'association : que chaque euro donné serve directement à équiper des enfants.' },
    { icon: Eye, title: 'Transparence', text: 'Chaque mission est référencée avec sa cagnotte, et les reçus fiscaux sont émis automatiquement.' },
    { icon: Handshake, title: 'Des partenaires locaux', text: 'Les packs sont remis à des structures qui connaissent les enfants et leurs besoins, en accord avec elles.' },
    { icon: ShieldCheck, title: 'Le respect des enfants', text: 'Photos avec accord, dignité des personnes, coordonnées des structures réservées aux membres.' },
];

export default function Association() {
    return (
        <>
            <PageHeader
                eyebrow="L'association"
                title="Qui est Playlife ?"
                description="Une association humanitaire née en 2015 d'une conviction simple : le sport change la vie des enfants."
                actions={<ButtonLink to={SITE_URL} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg" iconRight={ArrowUpRight}>www.playlife.today</ButtonLink>}
            />

            {/* Histoire */}
            <section className="container-page pb-20 lg:pb-28" aria-labelledby="story-title">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <Reveal className="relative">
                        <img src={photo} alt="Enfant jouant au football avec un ballon Playlife" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-float" />
                        <img src={heart} alt="" aria-hidden="true" className="absolute -bottom-6 -right-4 w-24 rotate-6 drop-shadow-xl md:w-28" />
                    </Reveal>
                    <Reveal delay={100}>
                        <Eyebrow>Notre histoire</Eyebrow>
                        <h2 id="story-title" className="mt-4 text-section">Un simple ballon apporte tellement !</h2>
                        <div className="mt-6 space-y-4 text-lead text-gray-600">
                            <p>Playlife est née en <strong className="text-ink-900">2015</strong>, à l'initiative de professionnels convaincus des bienfaits du sport dans l'éducation. Après plusieurs années à consolider le projet avec des partenaires et des ambassadeurs, l'association est officiellement créée en <strong className="text-ink-900">2018</strong>.</p>
                            <p>Sa mission : distribuer et envoyer du matériel sportif dans les écoles, orphelinats et établissements non équipés, souvent dans des pays défavorisés.</p>
                        </div>
                        <figure className="mt-9 rounded-[2rem] bg-surface-100 p-7 ring-1 ring-ink-900/[0.05]">
                            <Quote className="size-6 text-ink-900/35" aria-hidden="true" />
                            <blockquote className="mt-4 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-ink-900">Le sport est une source directe de valeurs fondamentales : le respect, l'apprentissage et le dépassement de soi.</blockquote>
                        </figure>
                    </Reveal>
                </div>
            </section>

            {/* Piliers */}
            <section className="bg-white py-20 lg:py-28" aria-labelledby="pillars-title">
                <div className="container-page">
                    <Reveal className="max-w-2xl">
                        <Eyebrow>Notre action</Eyebrow>
                        <h2 id="pillars-title" className="mt-4 text-section">Trois façons d'agir</h2>
                    </Reveal>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {PILLARS.map(({ icon: Icon, title, text }, index) => (
                            <Reveal
                                as="article"
                                key={title}
                                delay={index * 100}
                                className="group rounded-[2rem] bg-surface-50 p-7 ring-1 ring-ink-900/[0.07] shadow-card transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-card-hover md:p-8"
                            >
                                <div className="flex items-start justify-between">
                                    <span className="flex size-12 items-center justify-center rounded-2xl bg-ink-900/[0.04] text-ink-900 ring-1 ring-ink-900/[0.06] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105"><Icon className="size-6" aria-hidden="true" /></span>
                                    <span className="font-display text-5xl font-semibold tracking-[-0.04em] text-ink-900/[0.08]" aria-hidden="true">0{index + 1}</span>
                                </div>
                                <h3 className="mt-7 text-title">{title}</h3>
                                <p className="mt-3 text-gray-600">{text}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container-page">
                {/* Pays */}
                <section className="py-20 lg:py-28" aria-labelledby="countries-title">
                    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
                        <Reveal>
                            <Eyebrow>Sur le terrain</Eyebrow>
                            <h2 id="countries-title" className="mt-4 text-section">Des missions sur quatre continents</h2>
                            <p className="mt-5 text-lead text-gray-600">Depuis 2018, des packs Playlife ont été remis à des enfants en Asie, en Amérique, en Afrique et en Europe. Avec Playlife Connect, chacun peut désormais ouvrir une nouvelle destination.</p>
                        </Reveal>
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {COUNTRIES.map(([code, name], index) => (
                                <Reveal
                                    as="li"
                                    key={code}
                                    delay={index * 90}
                                    className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink-900/[0.07] shadow-card transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-card-hover"
                                >
                                    <span className="text-3xl" aria-hidden="true">{countryFlag(code)}</span>
                                    <span className="font-medium text-ink-900">{name}</span>
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Parrain & ambassadeurs */}
                <Reveal as="section" className="rounded-[2rem] bg-ink-900 p-8 text-white shadow-lift md:p-12" aria-labelledby="people-title">
                    <Eyebrow tone="dark">Ils nous soutiennent</Eyebrow>
                    <h2 id="people-title" className="mt-4 text-section text-white">Parrain et ambassadeurs</h2>
                    <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PEOPLE.map(person => (
                            <li key={person.name} className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                                <span className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/15">{person.role}</span>
                                <p className="mt-5 text-xl font-semibold text-white">{person.name}</p>
                                {person.detail && <p className="mt-1.5 text-sm text-ink-200">{person.detail}</p>}
                            </li>
                        ))}
                    </ul>
                </Reveal>

                {/* Engagements */}
                <section className="py-20 lg:py-28" aria-labelledby="commitments-title">
                    <Reveal className="max-w-2xl">
                        <Eyebrow>Nos engagements</Eyebrow>
                        <h2 id="commitments-title" className="mt-4 text-section">Une solidarité exigeante</h2>
                    </Reveal>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {COMMITMENTS.map(({ icon: Icon, title, text }, index) => (
                            <Reveal
                                as="article"
                                key={title}
                                delay={index * 90}
                                className="group rounded-3xl bg-white p-6 ring-1 ring-ink-900/[0.07] shadow-card transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-card-hover"
                            >
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-ink-900/[0.04] text-ink-900 ring-1 ring-ink-900/[0.06] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105"><Icon className="size-5" aria-hidden="true" /></span>
                                <h3 className="mt-6 font-semibold">{title}</h3>
                                <p className="mt-2.5 text-sm text-gray-600">{text}</p>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Playlife Connect + liens */}
                <section className="grid gap-6 pb-20 lg:grid-cols-2 lg:pb-28" aria-label="Aller plus loin">
                    <Reveal className="flex flex-col rounded-[2rem] bg-surface-100 p-8 ring-1 ring-ink-900/[0.05] md:p-10">
                        <Heart className="size-7 fill-brand-500 text-brand-500" aria-hidden="true" />
                        <h2 className="mt-6 text-title">Playlife Connect, la plateforme</h2>
                        <p className="mt-3 flex-1 text-gray-600">Pour aller plus loin, Playlife a créé Playlife Connect : voyageurs, enseignants et animateurs y organisent eux-mêmes leur mission solidaire, accompagnés par l'association à chaque étape.</p>
                        <div className="mt-7"><ButtonLink to="/comment-ca-marche" iconRight={ArrowRight}>Comment ça marche</ButtonLink></div>
                    </Reveal>
                    <Reveal delay={100} className="flex flex-col rounded-[2rem] bg-white p-8 ring-1 ring-ink-900/[0.07] shadow-card md:p-10">
                        <img src={heart} alt="" aria-hidden="true" className="w-14" />
                        <h2 className="mt-6 text-title">Découvrir l'association</h2>
                        <p className="mt-3 flex-1 text-gray-600">Actualités, histoires de missions, dons à l'association et contact : retrouvez tout l'univers Playlife sur son site officiel.</p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <ButtonLink to={SITE_URL} target="_blank" rel="noopener noreferrer" variant="dark" iconRight={ArrowUpRight}>www.playlife.today</ButtonLink>
                            <ButtonLink to={`${SITE_URL}/dons/`} target="_blank" rel="noopener noreferrer" variant="secondary" iconRight={ArrowUpRight}>Faire un don</ButtonLink>
                        </div>
                        <p className="mt-7 text-xs text-gray-500">Association loi 1901 · SIRET 991 252 909 00015 · 151 rue de la Fouillade, 34820 Teyran</p>
                    </Reveal>
                </section>
            </div>
        </>
    );
}
