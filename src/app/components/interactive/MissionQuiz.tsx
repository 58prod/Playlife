import { useState } from 'react';
import { ArrowRight, GraduationCap, HeartHandshake, Plane, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, ButtonLink } from '../ui/Button';

type Answers = { travel?: boolean; group?: boolean };

const QUESTIONS: Array<{ key: keyof Answers; text: string }> = [
    { key: 'travel', text: 'Partez-vous bientôt à l\'étranger, pour le travail ou en vacances ?' },
    { key: 'group', text: 'Encadrez-vous un groupe d\'enfants ou de jeunes (classe, club, centre de loisirs…) ?' },
];


/** Mini-quiz d'orientation : quelle mission me correspond ? */
export function MissionQuiz({ onStartMission, className }: { onStartMission: () => void; className?: string }) {
    const [answers, setAnswers] = useState<Answers>({});
    const step = answers.travel === undefined ? 0 : answers.group === undefined ? 1 : 2;

    const answer = (value: boolean) => {
        const question = QUESTIONS[step];
        if (!question) return;
        const key = question.key;
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const result = step === 2 ? (
        answers.travel && answers.group ? {
            icon: Sparkles,
            title: 'Les deux à la fois !',
            text: 'Votre groupe prépare le pack, et vous l\'emportez dans vos bagages pour le remettre en main propre. La mission idéale.',
        } : answers.travel ? {
            icon: Plane,
            title: 'Voyageur solidaire',
            text: 'Glissez un pack Playlife dans vos bagages et remettez-le à une structure locale sur votre lieu de voyage.',
        } : answers.group ? {
            icon: GraduationCap,
            title: 'Animateur / Enseignant',
            text: 'Faites de vos jeunes les acteurs d\'un projet solidaire : ils préparent un pack, Playlife l\'achemine vers une structure partenaire.',
        } : {
            icon: HeartHandshake,
            title: 'Soutenez une mission',
            text: 'Pas de voyage ni de groupe pour l\'instant ? Vous pouvez soutenir une mission en cours, ou nous signaler une structure qui aurait besoin d\'un pack.',
        }
    ) : null;

    return (
        <div className={cn('relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white md:p-10', className)}>
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Quiz · 30 secondes</p>
                    <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Quelle mission est faite pour vous ?</h2>
                    <p className="mt-3 text-ink-200">Deux questions pour trouver la meilleure façon d'agir.</p>
                    {step < 2 && (
                        <div className="mt-6 flex gap-2" aria-hidden="true">
                            {QUESTIONS.map((q, i) => <span key={q.key} className={cn('h-1.5 w-10 rounded-full transition', i <= step ? 'bg-brand-500' : 'bg-white/20')} />)}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10" aria-live="polite">
                    {result ? (
                        <div key="result" className="animate-fade-up">
                            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500 text-white"><result.icon className="size-6" aria-hidden="true" /></span>
                            <p className="mt-4 text-sm text-ink-200">Votre profil</p>
                            <h3 className="text-2xl font-bold text-white">{result.title}</h3>
                            <p className="mt-2 text-ink-100">{result.text}</p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {answers.travel || answers.group ? (
                                    <Button onClick={onStartMission} iconRight={ArrowRight}>Créer ma mission</Button>
                                ) : (
                                    <>
                                        <ButtonLink to="/missions" iconRight={ArrowRight}>Voir les missions</ButtonLink>
                                        <ButtonLink to="/structures" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Proposer une structure</ButtonLink>
                                    </>
                                )}
                                <Button variant="ghost" icon={RotateCcw} onClick={() => setAnswers({})} className="text-white/85 ring-1 ring-inset ring-white/20 hover:bg-white/10 hover:text-white">Recommencer</Button>
                            </div>
                        </div>
                    ) : (
                        <div key={step} className="animate-fade-up">
                            <p className="text-sm text-ink-200">Question {step + 1} sur {QUESTIONS.length}</p>
                            <p className="mt-2 text-xl font-semibold text-white">{QUESTIONS[step]?.text}</p>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <Button onClick={() => answer(true)} size="lg">Oui</Button>
                                <Button onClick={() => answer(false)} size="lg" variant="secondary" className="bg-white/10 text-white ring-white/20 hover:bg-white/15">Non</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
