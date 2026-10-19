import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Building2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { COUNTRIES, STRUCTURE_TYPES } from '@/lib/countries';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Field, Input, Select, Textarea } from './ui/Field';

interface StructureFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const EMPTY_FORM = {
    name: '', type: '', contact_name: '', address: '', postal_code: '', city: '', country: '',
    contact_phone: '', contact_email: '', origin_info: '', description: '', website_url: '',
};

export function StructureForm({ onClose, onSuccess }: StructureFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const bind = (name: keyof typeof EMPTY_FORM) => ({
        id: `structure-${name}`,
        name,
        value: form[name],
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [name]: e.target.value })),
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null])) as Record<keyof typeof EMPTY_FORM, string | null>;
        const { error } = await supabase.from('structures').insert({ ...clean, name: form.name.trim(), status: 'à valider playlife', created_by: user.id });
        setLoading(false);
        if (error) {
            toast.error(`Envoi impossible : ${errorMessage(error)}`);
            return;
        }
        toast.success('Merci ! Structure proposée.', { description: "Elle sera visible après validation par l'équipe Playlife." });
        onSuccess();
        onClose();
    };

    return (
        <Modal onClose={onClose} label="Proposer une structure" className="w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-ink-900/[0.07] shadow-float">
                <div className="flex items-start justify-between gap-4 border-b border-ink-900/[0.07] p-6 md:p-7">
                    <div className="flex items-center gap-3">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900/[0.04] text-ink-900 ring-1 ring-ink-900/[0.06]"><Building2 className="size-5" aria-hidden="true" /></span>
                        <div>
                            <h2 className="text-title">Proposer une structure</h2>
                            <p className="mt-1 text-sm text-gray-600">Elle sera publiée après validation par l'équipe Playlife.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors duration-300 hover:bg-ink-900/[0.05] hover:text-ink-900" aria-label="Fermer">
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-6 md:p-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="structure-name" label="Nom de la structure" required>
                            <Input {...bind('name')} required placeholder="Ex : Association sportive locale" />
                        </Field>
                        <Field id="structure-type" label="Type">
                            <Select {...bind('type')}>
                                <option value="">Sélectionner</option>
                                {STRUCTURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </Field>
                    </div>
                    <Field id="structure-contact_name" label="Nom du contact" required>
                        <Input {...bind('contact_name')} required autoComplete="off" placeholder="Ex : Aminata Diallo" />
                    </Field>
                    <Field id="structure-address" label="Adresse" required>
                        <Input {...bind('address')} required placeholder="Ex : 12 avenue Cheikh Anta Diop" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field id="structure-postal_code" label="Code postal"><Input {...bind('postal_code')} /></Field>
                        <Field id="structure-city" label="Ville" required><Input {...bind('city')} required placeholder="Ex : Dakar" /></Field>
                        <Field id="structure-country" label="Pays" required>
                            <Select {...bind('country')} required>
                                <option value="">Sélectionner</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                        </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="structure-contact_email" label="Email" required><Input {...bind('contact_email')} type="email" required placeholder="contact@structure.org" /></Field>
                        <Field id="structure-contact_phone" label="Téléphone"><Input {...bind('contact_phone')} type="tel" placeholder="+221 77 123 45 67" /></Field>
                    </div>
                    <Field id="structure-origin_info" label="Comment connaissez-vous cette structure ?">
                        <Textarea {...bind('origin_info')} rows={3} placeholder="Ex : j'ai travaillé avec eux lors d'une mission précédente…" />
                    </Field>
                    <details className="group rounded-2xl bg-surface-100 p-4 ring-1 ring-ink-900/[0.05] open:pb-5">
                        <summary className="cursor-pointer list-none text-sm font-semibold text-ink-800 marker:hidden">
                            <span className="group-open:hidden">+ Ajouter une description et un site web</span>
                            <span className="hidden group-open:inline">Informations complémentaires</span>
                        </summary>
                        <div className="mt-4 space-y-4">
                            <Field id="structure-description" label="Description"><Textarea {...bind('description')} rows={3} placeholder="Présentez brièvement la structure…" /></Field>
                            <Field id="structure-website_url" label="Site web"><Input {...bind('website_url')} type="url" placeholder="https://…" /></Field>
                        </div>
                    </details>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-ink-900/[0.07] bg-surface-50 p-5 sm:flex-row sm:justify-end md:px-7">
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button type="submit" loading={loading}>Soumettre la structure</Button>
                </div>
            </form>
        </Modal>
    );
}
