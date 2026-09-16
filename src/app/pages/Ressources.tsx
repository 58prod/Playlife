import { Camera, ClipboardCheck, Download, FileText, Handshake } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';

const CATEGORIES = [
    {
        step: '1',
        title: 'Avant la mission',
        description: 'Préparez votre mission avec méthode. Chaque étape compte pour maximiser votre impact.',
        icon: ClipboardCheck,
        docs: [
            { title: 'Prendre contact avec une structure', file: 'Playlife_Connect_Comment_prendre_contact_structure_avant_1.pdf' },
            { title: 'Préparer un pack Playlife', file: 'Playlife_Connect_Comment_preparer_un_pack_Playlife_avant_2.pdf' },
            { title: 'Communiquer sur sa mission', file: 'Playlife_Connect_Comment_communiquer_sur_sa_mission_avant_3.pdf' },
        ],
    },
    {
        step: '2',
        title: 'Pendant la mission',
        description: 'Vivez la mission pleinement. Remettez le pack et créez un moment de partage.',
        icon: Handshake,
        docs: [
            { title: 'Courrier remis aux structures', file: 'Playlife_Connect_Courrier_structure_pendant_1.pdf' },
            { title: 'Remettre le pack Playlife', file: 'Playlife_Connect_Comment_remettre_le_pack_et_creer_des_liens_pendant_2.pdf' },
            { title: 'Exemple de certificat de transport', file: 'Playlife_Connect_Certificat_transport_materiel_pendant_3.pdf' },
        ],
    },
    {
        step: '3',
        title: 'Après la mission',
        description: 'Prolongez l\'impact. Partagez votre expérience et inspirez d\'autres engagements.',
        icon: Camera,
        docs: [
            { title: 'Souvenirs et compte-rendu de mission', file: 'Playlife_Connect_Souvenirs_et_compte_rendu_de_mission_apres_1.pdf' },
            { title: 'Aller plus loin avec Playlife', file: 'Playlife_Connect_Devenez_benevole_apres_2.pdf' },
        ],
    },
];

export default function Ressources() {
    return (
        <div className="container-page pt-8 lg:pt-14">
            <PageHeader
                eyebrow="Boîte à outils"
                title="Tout pour réussir votre mission"
                description="Guides pratiques, modèles de courrier et documents officiels pour vous accompagner avant, pendant et après votre mission."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {CATEGORIES.map(category => (
                    <section key={category.title} className="flex flex-col rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-900/[0.06] md:p-8" aria-labelledby={`cat-${category.step}`}>
                        <div className="flex items-center justify-between">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><category.icon className="size-6" aria-hidden="true" /></span>
                            <span className="font-display text-5xl font-bold text-ink-900/[0.07]" aria-hidden="true">0{category.step}</span>
                        </div>
                        <h2 id={`cat-${category.step}`} className="mt-6 text-2xl font-bold">{category.title}</h2>
                        <p className="mt-2 text-gray-600">{category.description}</p>
                        <ul className="mt-6 space-y-2">
                            {category.docs.map(doc => (
                                <li key={doc.file}>
                                    <a
                                        href={`/ressources/${doc.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 rounded-xl bg-surface-50 p-3 ring-1 ring-ink-900/[0.05] transition hover:bg-white hover:shadow-soft hover:ring-ink-900/10"
                                    >
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-ink-700 ring-1 ring-ink-900/[0.06] group-hover:text-brand-500">
                                            <FileText className="size-5" aria-hidden="true" />
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-ink-900">{doc.title}<span className="sr-only"> (PDF, nouvel onglet)</span></span>
                                        <Download className="size-4 text-gray-400 transition group-hover:translate-y-0.5 group-hover:text-brand-500" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
