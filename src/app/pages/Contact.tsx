import { Building2, Mail, MapPin, Phone, User } from 'lucide-react';
import { useImpactMetrics } from '@/hooks/useSiteConfig';
import heart from '@/assets/coeur-playlife.png';
import { Eyebrow } from '../components/ui/Eyebrow';
import { PageHeader } from '../components/ui/PageHeader';
import { Reveal } from '../components/ui/Reveal';

const CONTACTS = [
    { icon: Mail, label: 'Email', value: 'playlife-connect@playlife.today', href: 'mailto:playlife-connect@playlife.today', wide: true },
    { icon: Phone, label: 'Téléphone', value: '+33 6 63 07 04 35', href: 'tel:+33663070435' },
    { icon: User, label: 'Contact', value: 'Christophe Grassi' },
    { icon: MapPin, label: 'Adresse', value: '151 rue de la Fouillade\n34820 Teyran' },
];

export default function Contact() {
    const metrics = useImpactMetrics();

    return (
        <>
            <PageHeader eyebrow="Contact" title="Parlons de votre mission" description="Une question sur une mission, un pack ou une structure ? Écrivez-nous ou appelez-nous, nous répondons rapidement." />

            <div className="container-page pb-20 lg:pb-28">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <Reveal className="rounded-[2rem] bg-white p-7 ring-1 ring-ink-900/[0.07] shadow-card md:p-10">
                        <ul className="grid gap-8 sm:grid-cols-2">
                            {CONTACTS.map(({ icon: Icon, label, value, href, wide }) => (
                                <li key={label} className={`flex gap-4 ${wide ? 'sm:col-span-2' : ''}`}>
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900/[0.04] text-ink-900 ring-1 ring-ink-900/[0.06]"><Icon className="size-5" aria-hidden="true" /></span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
                                        {href ? (
                                            <a href={href} className="mt-2 block break-words font-semibold text-ink-900 transition-colors duration-300 hover:text-brand-600">{value}</a>
                                        ) : (
                                            <p className="mt-2 whitespace-pre-line font-semibold text-ink-900">{value}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-10 flex items-center gap-4 rounded-2xl bg-surface-100 p-5 ring-1 ring-ink-900/[0.05]">
                            <Building2 className="size-5 shrink-0 text-ink-900/45" aria-hidden="true" />
                            <p className="text-sm text-ink-800"><strong>Playlife Connect</strong> — Association loi 1901 · SIRET 991 252 909 00015</p>
                        </div>
                    </Reveal>

                    <Reveal delay={100} className="relative overflow-hidden rounded-[2rem] bg-ink-900 p-8 text-white shadow-lift md:p-10">
                        <img src={heart} alt="" aria-hidden="true" className="absolute -bottom-10 -right-10 w-48 rotate-12 opacity-90" />
                        <Eyebrow tone="dark">Notre impact</Eyebrow>
                        <dl className="relative mt-10 space-y-9">
                            {[[metrics.value1, metrics.label1], [metrics.value2, metrics.label2]].map(([value, label]) => (
                                <div key={label} className="flex flex-col-reverse">
                                    <dt className="mt-2 text-ink-200">{label}</dt>
                                    <dd className="font-display text-5xl font-semibold tabular-nums tracking-[-0.04em] lg:text-6xl">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </div>
            </div>
        </>
    );
}
