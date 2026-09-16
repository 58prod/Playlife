import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
    AlignLeft, ArrowLeft, ArrowRight, Calendar, CheckCircle2, Globe, GraduationCap,
    Link as LinkIcon, Loader2, MapPin, Plane, Send, Type, Upload, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { formatDateRange } from '@/lib/format';
import { removePublicFile, uploadPublicFile, validateUpload } from '@/lib/storage';
import type { Mission, MissionStatus, UserType } from '@/types/database.types';
import { Modal } from './Modal';

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
const STEP_TITLES = ['Quel est votre profil ?', 'Où et quand partez-vous ?', 'Parlez-nous du projet', "Prêt à lancer l'impact ?"];
const LEETCHI_URL = 'https://www.leetchi.org/project/playlife';

const inputClass = 'w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all';

function Field({ id, label, icon: Icon, children }: { id?: string; label: string; icon: typeof Type; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-2 px-1">{label}</label>
            <div className="relative group">
                <Icon className="absolute left-4 top-[1.15rem] w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors pointer-events-none" aria-hidden="true" />
                {children}
            </div>
        </div>
    );
}

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

    const typeOption = (value: UserType, title: string, text: string, Icon: typeof Plane) => (
        <button
            type="button"
            onClick={() => set('mission_type', value)}
            aria-pressed={form.mission_type === value}
            className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${form.mission_type === value ? 'border-[#e6244d] bg-[#e6244d]/5 ring-4 ring-[#e6244d]/10' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
        >
            <span className={`p-3 rounded-2xl ${form.mission_type === value ? 'bg-[#e6244d] text-white' : 'bg-gray-50 text-gray-400'}`}>
                <Icon className="w-6 h-6" />
            </span>
            <span>
                <span className="block font-bold text-lg text-[#22081c]">{title}</span>
                <span className="block text-gray-500 text-sm leading-relaxed">{text}</span>
            </span>
        </button>
    );

    return (
        <Modal onClose={onClose} label={isEditing ? 'Modifier la mission' : 'Créer une mission'} className="w-full max-w-xl">
            <form onSubmit={handleSubmit} noValidate className="bg-white w-full rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 md:px-8 pt-5 flex justify-end">
                    <button type="button" onClick={onClose} aria-label="Fermer" className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-[#e6244d]">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 md:px-8 pt-2 flex flex-col items-center">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6" aria-hidden="true">
                        <div className="h-full bg-gradient-to-r from-[#e6244d] to-[#ff4d71] transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
                    </div>
                    <p className="text-[#e6244d] font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        {isEditing ? 'Modification — ' : ''}Étape {step} sur {TOTAL_STEPS}
                    </p>
                    <h2 className="text-2xl font-black text-[#22081c] mb-6 text-center">{STEP_TITLES[step - 1]}</h2>
                </div>

                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6">
                    {step === 1 && (
                        <div className="grid grid-cols-1 gap-4">
                            {typeOption('voyageur', 'Voyageur solidaire', 'Je pars en voyage et je souhaite remettre un pack de matériel sportif.', Plane)}
                            {typeOption('animateur', 'Animateur / Enseignant', "J'encadre des enfants et je souhaite les faire participer à une action solidaire.", GraduationCap)}

                            {isEditing && (
                                <fieldset className="mt-4">
                                    <legend className="block text-sm font-bold text-gray-700 mb-2 px-1">Statut de la mission</legend>
                                    <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                                        {(['active', 'completed'] as const).map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => set('status', status)}
                                                aria-pressed={form.status === status}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${form.status === status ? `bg-white shadow-sm border border-gray-100 ${status === 'active' ? 'text-blue-600' : 'text-green-600'}` : 'text-gray-500 hover:text-gray-700'}`}
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
                        <div className="space-y-6">
                            <Field id="mission-title" label="Titre de votre mission" icon={Type}>
                                <input id="mission-title" name="title" type="text" required maxLength={120} value={form.title} onChange={handleChange} placeholder="Ex : Foot pour tous au Sénégal" className={inputClass} />
                            </Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field id="mission-country" label="Pays" icon={Globe}>
                                    <input id="mission-country" name="country" type="text" required value={form.country} onChange={handleChange} placeholder="Sénégal" className={inputClass} />
                                </Field>
                                <Field id="mission-city" label="Ville" icon={MapPin}>
                                    <input id="mission-city" name="city" type="text" required value={form.city} onChange={handleChange} placeholder="Dakar" className={inputClass} />
                                </Field>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field id="mission-start-date" label="Départ (estimé)" icon={Calendar}>
                                    <input id="mission-start-date" name="start_date" type="date" required value={form.start_date} onChange={handleChange} className={inputClass} />
                                </Field>
                                <Field id="mission-end-date" label="Retour (estimé)" icon={Calendar}>
                                    <input id="mission-end-date" name="end_date" type="date" required min={form.start_date || undefined} value={form.end_date} onChange={handleChange} className={inputClass} />
                                </Field>
                            </div>
                            <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 space-y-3">
                                <p className="text-sm text-gray-700">
                                    <span className="font-bold">💰 Besoin de financer votre mission ?</span><br />
                                    Créez votre cagnotte liée à Playlife :{' '}
                                    <a href={LEETCHI_URL} target="_blank" rel="noopener noreferrer" className="text-[#e6244d] underline hover:text-[#c91d41]">leetchi.org</a>
                                </p>
                                <Field id="mission-fundraising" label="Lien de votre cagnotte (optionnel)" icon={LinkIcon}>
                                    <input id="mission-fundraising" name="fundraising_url" type="url" value={form.fundraising_url} onChange={handleChange} placeholder={LEETCHI_URL} className={`${inputClass} bg-white`} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <Field id="mission-description" label="Description du projet" icon={AlignLeft}>
                                <textarea id="mission-description" name="description" required rows={5} maxLength={2000} value={form.description} onChange={handleChange} placeholder="Quels sont vos objectifs ? Quelles structures allez-vous aider ?" className={`${inputClass} resize-none`} />
                            </Field>
                            <div>
                                <p className="block text-sm font-bold text-gray-700 mb-2 px-1">Image de couverture (optionnel, 5 Mo max)</p>
                                <label className={`w-full px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#e6244d] hover:bg-pink-50 transition-all flex items-center justify-center gap-3 ${uploadingImage ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" disabled={uploadingImage} />
                                    {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin text-[#e6244d]" /> : <Upload className="w-5 h-5 text-gray-400" />}
                                    <span className="font-medium text-gray-600">
                                        {uploadingImage ? 'Envoi en cours…' : form.image_url ? "Remplacer l'image" : 'Choisir une image'}
                                    </span>
                                </label>
                                {form.image_url && (
                                    <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-200">
                                        <img src={form.image_url} alt="Aperçu de l'image de couverture" className="w-full h-48 object-cover" />
                                        <button type="button" onClick={() => set('image_url', '')} className="absolute top-2 right-2 bg-white/95 text-gray-700 px-3 py-1 rounded-full text-xs font-bold hover:text-red-600">
                                            Retirer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#e6244d]">
                                        {form.mission_type === 'voyageur' ? <Plane className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Type de mission</p>
                                        <p className="font-bold text-[#22081c]">{form.mission_type === 'voyageur' ? 'Voyageur solidaire' : 'Animateur / Enseignant'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-[#22081c] break-words">{form.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#e6244d]" />{form.city}, {form.country}</span>
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#e6244d]" />{formatDateRange(form.start_date, form.end_date)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line break-words">{form.description}</p>
                            </div>
                            {!isEditing && (
                                <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-2xl text-sm border border-blue-100">
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    Votre mission sera publiée après une rapide validation par l'équipe Playlife.
                                </div>
                            )}
                        </div>
                    )}

                    {error && <p className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl" role="alert">{error}</p>}
                </div>

                <div className="p-6 md:p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4">
                    {step > 1 ? (
                        <button type="button" onClick={() => { setError(null); setStep(step - 1); }} className="flex items-center gap-2 py-4 px-6 rounded-[1.2rem] border border-gray-200 text-gray-600 font-bold hover:bg-white transition-all">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Précédent</span>
                        </button>
                    ) : <span />}
                    <button
                        type="submit"
                        disabled={saving || uploadingImage}
                        className="flex-1 max-w-[260px] py-4 px-8 rounded-[1.2rem] bg-[#e6244d] text-white font-bold hover:bg-[#c91d41] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-[#e6244d]/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" aria-label="Enregistrement" /> : step === TOTAL_STEPS ? (
                            <><span>{isEditing ? 'Enregistrer' : 'Lancer la mission'}</span><Send className="w-5 h-5" /></>
                        ) : (
                            <><span>Continuer</span><ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
