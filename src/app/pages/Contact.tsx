import { Building2, Mail, MapPin, Phone, User } from 'lucide-react';
import { useImpactMetrics } from '@/hooks/useSiteConfig';
import heart from '@/assets/coeur-playlife.png';
import { PageHeader } from '../components/ui/PageHeader';

const CONTACTS = [
    { icon: Mail, label: 'Email', value: 'playlife-connect@playlife.today', href: 'mailto:playlife-connect@playlife.today', wide: true },
    { icon: Phone, label: 'Téléphone', value: '+33 6 63 07 04 35', href: 'tel:+33663070435' },
    { icon: User, label: 'Contact', value: 'Christophe Grassi' },
    { icon: MapPin, label: 'Adresse', value: '151 rue de la Fouillade\n34820 Teyran' },
];

export default function Contact() {
    const metrics = useImpactMetrics();

    return (
        <div className="container-page pt-8 lg:pt-14">
            <PageHeader eyebrow="Contact" title="Parlons de votre mission" description="Une question sur une mission, un pack ou une structure ? Écrivez-nous ou appelez-nous, nous répondons rapidement." />

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06] md:p-10">
                    <ul className="grid gap-8 sm:grid-cols-2">
                        {CONTACTS.map(({ icon: Icon, label, value, href, wide }) => (
                            <li key={label} className={`flex gap-4 ${wide ? 'sm:col-span-2' : ''}`}>
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><Icon className="size-5" aria-hidden="true" /></span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                                    {href ? (
                                        <a href={href} className="mt-1 block break-words font-semibold text-ink-900 hover:text-brand-600">{value}</a>
                                    ) : (
                                        <p className="mt-1 whitespace-pre-line font-semibold text-ink-900">{value}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-10 flex items-center gap-4 rounded-2xl bg-surface-100 p-5">
                        <Building2 className="size-5 shrink-0 text-ink-700" aria-hidden="true" />
                        <p className="text-sm text-ink-800"><strong>Playlife Connect</strong> — Association loi 1901 · SIRET 991 252 909 00015</p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-8 text-white md:p-10">
                    <img src={heart} alt="" aria-hidden="true" className="absolute -bottom-10 -right-10 w-48 rotate-12 opacity-90" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Notre impact</p>
                    <dl className="relative mt-8 space-y-8">
                        {[[metrics.value1, metrics.label1], [metrics.value2, metrics.label2]].map(([value, label]) => (
                            <div key={label} className="flex flex-col-reverse">
                                <dt className="text-ink-200">{label}</dt>
                                <dd className="font-display text-6xl font-bold tabular-nums">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
