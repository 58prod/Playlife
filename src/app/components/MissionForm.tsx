import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, GraduationCap, Info, Loader2, Plane, Send, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { cn } from '@/lib/cn';
import { formatDateRange } from '@/lib/format';
import { removePublicFile, uploadPublicFile, validateUpload } from '@/lib/storage';
import type { Mission, MissionStatus, UserType } from '@/types/database.types';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Field, Input, Textarea } from './ui/Field';

interface MissionFormProps {
    onClose: () => void;
    onSuccess: () => void;
    /** Mission existante à modifier (sinon création) */
    initialData?: Mission;
}

interface FormState {
    mission_type: UserType | '';
    title: string;
    country: string;
    city: string;
    start_date: string;
    end_date: string;
    fundraising_url: string;
    description: string;
    image_url: string;
    status: MissionStatus;
}

const TOTAL_STEPS = 4;
const STEPS = [
    { label: 'Profil', title: 'Quel type de mission ?' },
    { label: 'Destination', title: 'Où et quand partez-vous ?' },
    { label: 'Projet', title: 'Parlez-nous du projet' },
    { label: 'Validation', title: 'Tout est prêt ?' },
];
const LEETCHI_URL = 'https://www.leetchi.org/project/playlife';

export function MissionForm({ onClose, onSuccess, initialData }: MissionFormProps) {
    const { user } = useAuth();
    const isEditing = !!initialData;
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>({
        mission_type: initialData?.mission_type ?? '',
        title: initialData?.title ?? '',
        country: initialData?.country ?? '',
        city: initialData?.city ?? '',
        start_date: initialData?.start_date ?? '',
        end_date: initialData?.end_date ?? '',
        fundraising_url: initialData?.fundraising_url ?? '',
        description: initialData?.description ?? '',
        image_url: initialData?.image_url ?? '',
        status: initialData?.status ?? 'active',
    });

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        set(e.target.name as keyof FormState, e.target.value as never);

    /** Retourne un message si l'étape courante est incomplète, sinon null. */
    const stepError = (): string | null => {
        if (step === 1 && !form.mission_type) return 'Choisissez un type de mission.';
        if (step === 2) {
            if (!form.title.trim() || !form.country.trim() || !form.city.trim()) return 'Renseignez le titre, le pays et la ville.';
            if (!form.start_date || !form.end_date) return 'Renseignez les dates de départ et de retour.';
            if (form.end_date < form.start_date) return 'La date de retour doit être postérieure à la date de départ.';
        }
        if (step === 3 && !form.description.trim()) return 'Décrivez votre projet en quelques lignes.';
        return null;
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !user) return;
        const invalid = validateUpload(file);
        if (invalid) { toast.error(invalid); return; }

        setUploadingImage(true);
        try {
            const url = await uploadPublicFile('missions', user.id, file);
            // Supprime l'image précédente si elle vient d'être envoyée dans ce formulaire
            if (form.image_url && form.image_url !== initialData?.image_url) await removePublicFile('missions', form.image_url);
            set('image_url', url);
        } catch (err) {
            toast.error(`Envoi de l'image impossible : ${errorMessage(err)}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const invalid = stepError();
        if (invalid) { setError(invalid); return; }
        setError(null);
        if (step < TOTAL_STEPS) { setStep(step + 1); return; }
        if (!user || !form.mission_type) return;

        setSaving(true);
        const payload = {
            mission_type: form.mission_type,
            title: form.title.trim(),
            country: form.country.trim(),
            city: form.city.trim(),
            start_date: form.start_date,
            end_date: form.end_date,
            fundraising_url: form.fundraising_url.trim() || null,
            description: form.description.trim(),
            image_url: form.image_url || null,
        };

        try {
            if (initialData) {
                const { error: updateError } = await supabase
                    .from('missions')
                    .update({ ...payload, status: form.status })
                    .eq('id', initialData.id);
                if (updateError) throw updateError;
                if (initialData.image_url && initialData.image_url !== form.image_url) {
                    await removePublicFile('missions', initialData.image_url).catch(() => undefined);
                }
                toast.success('Mission mise à jour.');
            } else {
                // Création : la mission reste invisible jusqu'à validation par un administrateur
                const { data: inserted, error: insertError } = await supabase
                    .from('missions')
                    .insert({ ...payload, created_by: user.id, status: 'active', visible: false })
                    .select('id')
                    .single();
                if (insertError) throw insertError;

                supabase.functions
                    .invoke('notify-new-mission', { body: { missionId: inserted.id } })
                    .catch(() => undefined); // la notification ne doit jamais bloquer la création

                toast.success('Mission créée !', {
                    description: "Elle sera visible publiquement dès sa validation par l'équipe Playlife.",
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(`${isEditing ? 'Modification' : 'Création'} impossible : ${errorMessage(err)}`);
        } finally {
            setSaving(false);
        }
    };

    const typeOption = (value: UserType, title: string, text: string, Icon: typeof Plane) => {
        const selected = form.mission_type === value;
        return (
            <button
                type="button"
                onClick={() => set('mission_type', value)}
                aria-pressed={selected}
                className={cn('flex w-full items-start gap-4 rounded-2xl bg-white p-5 text-left transition ring-inset', selected ? 'ring-2 ring-brand-500 shadow-soft' : 'ring-1 ring-gray-200 hover:ring-gray-300')}
            >
                <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl transition', selected ? 'bg-brand-500 text-white' : 'bg-surface-100 text-ink-700')}>
                    <Icon className="size-6" />
                </span>
                <span className="flex-1">
                    <span className="block font-semibold text-ink-900">{title}</span>
                    <span className="mt-1 block text-sm text-gray-600">{text}</span>
                </span>
                <span className={cn('mt-1 flex size-5 shrink-0 items-center justify-center rounded-full ring-1 transition', selected ? 'bg-brand-500 text-white ring-brand-500' : 'ring-gray-300')}>
                    {selected && <Check className="size-3" />}
                </span>
            </button>
        );
    };

    return (
        <Modal onClose={onClose} label={isEditing ? 'Modifier la mission' : 'Créer une mission'} className="w-full max-w-2xl">
            <form onSubmit={handleSubmit} noValidate className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-lift">
                <div className="border-b border-gray-100 px-6 pb-5 pt-6 md:px-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{isEditing ? 'Modifier la mission' : 'Nouvelle mission'}</p>
                            <h2 className="mt-1 text-2xl font-bold">{STEPS[step - 1].title}</h2>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink-900">
                            <X className="size-5" />
                        </button>
                    </div>
                    <ol className="mt-5 flex items-center gap-2" aria-label={`Étape ${step} sur ${TOTAL_STEPS}`}>
                        {STEPS.map((s, i) => {
                            const n = i + 1;
                            const done = n < step;
                            const current = n === step;
                            return (
                                <li key={s.label} className="flex flex-1 items-center gap-2" aria-current={current ? 'step' : undefined}>
                                    <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition', done ? 'bg-ink-900 text-white' : current ? 'bg-brand-500 text-white ring-4 ring-brand-100' : 'bg-gray-100 text-gray-500')}>
                                        {done ? <Check className="size-3.5" /> : n}
                                    </span>
                                    <span className={cn('hidden text-xs font-medium sm:block', current ? 'text-ink-900' : 'text-gray-500')}>{s.label}</span>
                                    {n < TOTAL_STEPS && <span className={cn('h-px flex-1', done ? 'bg-ink-900' : 'bg-gray-200')} />}
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
                    {step === 1 && (
                        <div className="space-y-3">
                            {typeOption('voyageur', 'Voyageur solidaire', 'Je pars en voyage et je souhaite remettre un pack de matériel sportif.', Plane)}
                            {typeOption('animateur', 'Animateur / Enseignant', "J'encadre des enfants et je souhaite les faire participer à une action solidaire.", GraduationCap)}
                            {isEditing && (
                                <fieldset className="pt-4">
                                    <legend className="mb-2 text-sm font-medium text-ink-800">Statut de la mission</legend>
                                    <div className="inline-flex rounded-xl bg-ink-900/[0.05] p-1">
                                        {(['active', 'completed'] as const).map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => set('status', status)}
                                                aria-pressed={form.status === status}
                                                className={cn('rounded-lg px-4 py-2 text-sm font-medium transition', form.status === status ? 'bg-white text-ink-900 shadow-soft' : 'text-gray-600 hover:text-ink-900')}
                                            >
                                                {status === 'active' ? 'En cours' : 'Terminée'}
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <Field id="mission-title" label="Titre de la mission" required>
                                <Input id="mission-title" name="title" required maxLength={120} value={form.title} onChange={handleChange} placeholder="Ex : Du foot pour l'école de Yoff" />
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field id="mission-country" label="Pays" required>
                                    <Input id="mission-country" name="country" required value={form.country} onChange={handleChange} placeholder="Sénégal" />
                                </Field>
                                <Field id="mission-city" label="Ville" required>
                                    <Input id="mission-city" name="city" required value={form.city} onChange={handleChange} placeholder="Dakar" />
                                </Field>
                                <Field id="mission-start-date" label="Départ (estimé)" required>
                                    <Input id="mission-start-date" name="start_date" type="date" required value={form.start_date} onChange={handleChange} />
                                </Field>
                                <Field id="mission-end-date" label="Retour (estimé)" required>
                                    <Input id="mission-end-date" name="end_date" type="date" required min={form.start_date || undefined} value={form.end_date} onChange={handleChange} />
                                </Field>
                            </div>
                            <div className="rounded-2xl bg-surface-100 p-5">
                                <Field
                                    id="mission-fundraising"
                                    label="Lien de votre cagnotte"
                                    hint={<>Pas encore de cagnotte ? Créez-la sur <a href={LEETCHI_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2">Leetchi, rattachée à Playlife</a> (dons déductibles à 66 %).</>}
                                >
                                    <Input id="mission-fundraising" name="fundraising_url" type="url" value={form.fundraising_url} onChange={handleChange} placeholder="https://www.leetchi.com/…" />
                                </Field>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">
                            <Field id="mission-description" label="Description du projet" required hint={`${form.description.length} / 2000`}>
                                <Textarea id="mission-description" name="description" required rows={6} maxLength={2000} value={form.description} onChange={handleChange} placeholder="Quels sont vos objectifs ? Quelle structure allez-vous aider ? Combien d'enfants ?" />
                            </Field>
                            <div>
                                <p className="mb-1.5 text-sm font-medium text-ink-800">Photo de couverture <span className="font-normal text-gray-500">(optionnel)</span></p>
                                {form.image_url ? (
                                    <div className="group relative overflow-hidden rounded-2xl ring-1 ring-gray-200">
                                        <img src={form.image_url} alt="Aperçu de la photo de couverture" className="aspect-[16/9] w-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-ink-950/60 to-transparent p-3">
                                            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-ink-900 hover:bg-gray-50">
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" disabled={uploadingImage} />
                                                {uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Remplacer
                                            </label>
                                            <button type="button" onClick={() => set('image_url', '')} className="h-9 rounded-lg bg-white/90 px-3 text-sm font-medium text-red-600 hover:bg-white">Retirer</button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className={cn('flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-6 py-10 text-center transition hover:border-brand-300 hover:bg-brand-50/40', uploadingImage ? 'pointer-events-none opacity-60' : 'cursor-pointer')}>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" disabled={uploadingImage} />
                                        <span className="flex size-11 items-center justify-center rounded-full bg-white text-brand-500 shadow-soft">
                                            {uploadingImage ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
                                        </span>
                                        <span className="text-sm font-medium text-ink-900">{uploadingImage ? 'Envoi en cours…' : 'Choisir une photo'}</span>
                                        <span className="text-xs text-gray-500">JPG ou PNG, 5 Mo maximum</span>
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200">
                                {form.image_url && <img src={form.image_url} alt="" className="aspect-[21/9] w-full object-cover" />}
                                <div className="space-y-3 p-5">
                                    <p className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-800">
                                        {form.mission_type === 'voyageur' ? <Plane className="size-3.5" /> : <GraduationCap className="size-3.5" />}
                                        {form.mission_type === 'voyageur' ? 'Voyageur solidaire' : 'Animateur / Enseignant'}
                                    </p>
                                    <h3 className="text-xl font-semibold break-words">{form.title}</h3>
                                    <p className="text-sm text-gray-600">{form.city}, {form.country} · {formatDateRange(form.start_date, form.end_date)}</p>
                                    <p className="whitespace-pre-line break-words text-sm text-ink-800">{form.description}</p>
                                </div>
                            </div>
                            {!isEditing && (
                                <p className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-100">
                                    <Info className="mt-0.5 size-5 shrink-0" />
                                    Votre mission sera publiée après une rapide validation par l'équipe Playlife. Vous la retrouverez dès maintenant dans votre tableau de bord.
                                </p>
                            )}
                        </div>
                    )}

                    {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100" role="alert">{error}</p>}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4 md:px-8">
                    {step > 1 ? (
                        <Button variant="ghost" icon={ArrowLeft} onClick={() => { setError(null); setStep(step - 1); }}>Précédent</Button>
                    ) : <span />}
                    <Button type="submit" loading={saving} disabled={uploadingImage} iconRight={step === TOTAL_STEPS ? (isEditing ? CheckCircle2 : Send) : ArrowRight}>
                        {step === TOTAL_STEPS ? (isEditing ? 'Enregistrer' : 'Envoyer la mission') : 'Continuer'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
