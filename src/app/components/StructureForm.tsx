import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Building2, FileText, Link as LinkIcon, Loader2, Mail, MapPin, Phone, Tag, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { COUNTRIES, STRUCTURE_TYPES } from '@/lib/countries';
import { Modal } from './Modal';

interface StructureFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const EMPTY_FORM = {
    name: '', type: '', contact_name: '', address: '', postal_code: '', city: '', country: '',
    contact_phone: '', contact_email: '', origin_info: '', description: '', website_url: '',
};

const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6244d] focus:border-transparent';

function Field({ id, label, icon: Icon, required, className = '', children }: { id: string; label: string; icon?: typeof Building2; required?: boolean; className?: string; children: ReactNode }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                {Icon && <Icon className="w-4 h-4 text-[#e6244d]" aria-hidden="true" />}
                {label}{required && <span className="text-[#e6244d]" aria-hidden="true">*</span>}
            </label>
            {children}
        </div>
    );
}

export function StructureForm({ onClose, onSuccess }: StructureFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null])) as Record<keyof typeof EMPTY_FORM, string | null>;
        const { error } = await supabase.from('structures').insert({
            ...clean,
            name: form.name.trim(),
            status: 'à valider playlife',
            created_by: user.id,
        });
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
            <form onSubmit={handleSubmit} className="bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 flex items-center justify-between bg-gradient-to-r from-[#22081c] to-[#3d1232] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Proposer une structure</h2>
                            <p className="text-white/70 text-sm">Soumise à validation Playlife</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Fermer">
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field id="structure-name" label="Nom de la structure" icon={Building2} required>
                            <input id="structure-name" name="name" type="text" required value={form.name} onChange={handleChange} className={inputClass} placeholder="Ex : Association sportive locale" />
                        </Field>
                        <Field id="structure-type" label="Type" icon={Tag}>
                            <select id="structure-type" name="type" value={form.type} onChange={handleChange} className={inputClass}>
                                <option value="">Sélectionner un type</option>
                                {STRUCTURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>
                    </div>

                    <Field id="structure-contact" label="Nom du contact" icon={User} required>
                        <input id="structure-contact" name="contact_name" type="text" required autoComplete="off" value={form.contact_name} onChange={handleChange} className={inputClass} placeholder="Ex : Jean Dupont" />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field id="structure-address" label="Adresse" icon={MapPin} required className="md:col-span-3">
                            <input id="structure-address" name="address" type="text" required value={form.address} onChange={handleChange} className={inputClass} placeholder="Ex : 123 rue de la Paix" />
                        </Field>
                        <Field id="structure-postal" label="Code postal">
                            <input id="structure-postal" name="postal_code" type="text" value={form.postal_code} onChange={handleChange} className={inputClass} placeholder="Ex : 75001" />
                        </Field>
                        <Field id="structure-city" label="Ville" required>
                            <input id="structure-city" name="city" type="text" required value={form.city} onChange={handleChange} className={inputClass} placeholder="Ex : Dakar" />
                        </Field>
                        <Field id="structure-country" label="Pays" required>
                            <select id="structure-country" name="country" required value={form.country} onChange={handleChange} className={inputClass}>
                                <option value="">Sélectionner</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field id="structure-phone" label="Téléphone" icon={Phone}>
                            <input id="structure-phone" name="contact_phone" type="tel" value={form.contact_phone} onChange={handleChange} className={inputClass} placeholder="Ex : +221 77 123 45 67" />
                        </Field>
                        <Field id="structure-email" label="Email" icon={Mail} required>
                            <input id="structure-email" name="contact_email" type="email" required value={form.contact_email} onChange={handleChange} className={inputClass} placeholder="Ex : contact@structure.org" />
                        </Field>
                    </div>

                    <Field id="structure-origin" label="Comment connaissez-vous cette structure ?" icon={FileText}>
                        <textarea id="structure-origin" name="origin_info" rows={3} value={form.origin_info} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Ex : J'ai travaillé avec eux lors d'une mission précédente…" />
                    </Field>

                    <div className="pt-4 border-t border-gray-200 space-y-4">
                        <p className="text-sm font-medium text-gray-500">Informations complémentaires (optionnel)</p>
                        <Field id="structure-description" label="Description">
                            <textarea id="structure-description" name="description" rows={3} value={form.description} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Décrivez brièvement la structure…" />
                        </Field>
                        <Field id="structure-website" label="Site web" icon={LinkIcon}>
                            <input id="structure-website" name="website_url" type="url" value={form.website_url} onChange={handleChange} className={inputClass} placeholder="https://…" />
                        </Field>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        Annuler
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-[#e6244d] text-white rounded-xl font-medium hover:bg-[#c91d41] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Envoi…</> : 'Soumettre la structure'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
