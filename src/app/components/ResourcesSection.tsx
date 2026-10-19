import { Camera, ClipboardCheck, Download, FileText, Handshake } from 'lucide-react';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

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

/** Bloc « Ressources » : guides PDF avant, pendant et après la mission. */
export function ResourcesSection() {
    return (
        <section id="ressources" className="scroll-mt-28" aria-labelledby="resources-title">
            <Reveal className="max-w-2xl">
                <Eyebrow>Boîte à outils</Eyebrow>
                <h2 id="resources-title" className="mt-4 text-section">Les ressources pour réussir votre mission</h2>
                <p className="mt-5 text-lead text-gray-600">Guides pratiques, modèles de courrier et documents officiels pour vous accompagner avant, pendant et après votre mission.</p>
            </Reveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {CATEGORIES.map((category, index) => (
                    <Reveal
                        as="article"
                        key={category.title}
                        delay={index * 100}
                        className="group flex flex-col rounded-[2rem] bg-white p-7 ring-1 ring-ink-900/[0.07] shadow-card transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-card-hover md:p-8"
                    >
                        <div className="flex items-start justify-between">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-ink-900/[0.04] text-ink-900 ring-1 ring-ink-900/[0.06] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105"><category.icon className="size-6" aria-hidden="true" /></span>
                            <span className="font-display text-5xl font-semibold tracking-[-0.04em] text-ink-900/[0.08]" aria-hidden="true">0{category.step}</span>
                        </div>
                        <h3 className="mt-7 text-title">{category.title}</h3>
                        <p className="mt-3 text-gray-600">{category.description}</p>
                        <ul className="mt-7 space-y-2">
                            {category.docs.map(doc => (
                                <li key={doc.file}>
                                    <a
                                        href={`/ressources/${doc.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/doc flex items-center gap-3 rounded-2xl bg-surface-50 p-3 ring-1 ring-ink-900/[0.05] transition-all duration-500 ease-[var(--ease-out-expo)] hover:bg-white hover:ring-ink-900/10 hover:shadow-card"
                                    >
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink-700 ring-1 ring-ink-900/[0.06] transition-colors duration-300 group-hover/doc:text-ink-900">
                                            <FileText className="size-5" aria-hidden="true" />
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-ink-900">{doc.title}<span className="sr-only"> (PDF, nouvel onglet)</span></span>
                                        <Download className="size-4 text-gray-400 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/doc:translate-y-0.5 group-hover/doc:text-ink-900" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
