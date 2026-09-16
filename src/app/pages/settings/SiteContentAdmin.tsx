import { useEffect, useState, type ChangeEvent } from 'react';
import { Image as ImageIcon, Loader2, Save, TrendingUp, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { removePublicFile, uploadPublicFile, validateUpload } from '@/lib/storage';
import { DEFAULT_IMPACT_METRICS, fetchImpactMetrics, fetchSlideshowPhotos } from '@/hooks/useSiteConfig';
import type { ImpactMetrics, Json } from '@/types/database.types';
import { useConfirm } from '@/app/components/ConfirmDialog';
import { SectionTitle } from './shared';

function useSaveConfig() {
    const { user } = useAuth();
    return async (key: string, value: Json) => {
        const { error } = await supabase.from('site_config').upsert({ key, value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() });
        if (error) throw error;
    };
}

export function ImpactMetricsAdmin() {
    const saveConfig = useSaveConfig();
    const [metrics, setMetrics] = useState<ImpactMetrics>(DEFAULT_IMPACT_METRICS);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchImpactMetrics().then(setMetrics); }, []);

    const save = async () => {
        setSaving(true);
        try {
            await saveConfig('impact_metrics', { ...metrics });
            toast.success('Chiffres clés mis à jour.');
        } catch (error) {
            toast.error(`Enregistrement impossible : ${errorMessage(error)}`);
        } finally {
            setSaving(false);
        }
    };

    const field = (key: keyof ImpactMetrics, label: string) => (
        <div>
            <label htmlFor={`impact-${key}`} className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <input id={`impact-${key}`} type="text" value={metrics[key]} onChange={e => setMetrics(m => ({ ...m, [key]: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e6244d]/20 outline-none" />
        </div>
    );

    return (
        <section className="mb-12" aria-label="Chiffres clés">
            <SectionTitle icon={TrendingUp} title="Chiffres clés (accueil et contact)" />
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <fieldset className="space-y-4">
                        <legend className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Chiffre clé 1</legend>
                        {field('value1', 'Valeur (ex : 23)')}
                        {field('label1', 'Libellé (ex : structures aidées)')}
                    </fieldset>
                    <fieldset className="space-y-4">
                        <legend className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Chiffre clé 2</legend>
                        {field('value2', 'Valeur (ex : 580)')}
                        {field('label2', 'Libellé (ex : enfants aidés)')}
                    </fieldset>
                </div>
                <button type="button" onClick={save} disabled={saving} className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#22081c] text-white rounded-xl font-bold hover:bg-[#1a0616] transition-all disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
                    Enregistrer les chiffres clés
                </button>
            </div>
        </section>
    );
}

export function SlideshowAdmin() {
    const saveConfig = useSaveConfig();
    const confirm = useConfirm();
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { fetchSlideshowPhotos().then(setPhotos); }, []);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (!files.length) return;
        setUploading(true);
        let current = photos;
        for (const file of files) {
            const invalid = validateUpload(file);
            if (invalid) { toast.error(invalid); continue; }
            try {
                const url = await uploadPublicFile('slideshow', '', file);
                current = [...current, url];
                await saveConfig('slideshow_photos', current);
                setPhotos(current);
            } catch (error) {
                toast.error(`« ${file.name} » : ${errorMessage(error)}`);
            }
        }
        setUploading(false);
    };

    const handleDelete = async (url: string, index: number) => {
        const ok = await confirm({ title: `Retirer la photo ${index + 1} du diaporama ?`, confirmLabel: 'Retirer', danger: true });
        if (!ok) return;
        const next = photos.filter(p => p !== url);
        try {
            await saveConfig('slideshow_photos', next);
            setPhotos(next);
            await removePublicFile('slideshow', url).catch(() => undefined);
        } catch (error) {
            toast.error(errorMessage(error));
        }
    };

    const move = async (index: number, delta: number) => {
        const next = [...photos];
        const [item] = next.splice(index, 1);
        next.splice(index + delta, 0, item);
        setPhotos(next);
        await saveConfig('slideshow_photos', next).catch(error => toast.error(errorMessage(error)));
    };

    return (
        <section className="mb-12" aria-label="Diaporama">
            <SectionTitle icon={ImageIcon} title="Photos du diaporama d'accueil" count={photos.length} />
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {photos.length > 0 ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                        {photos.map((url, index) => (
                            <li key={url} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-video">
                                <img src={url} alt={`Photo ${index + 1} du diaporama`} loading="lazy" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => handleDelete(url, index)} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-red-700" aria-label={`Retirer la photo ${index + 1}`}>
                                    <X className="w-4 h-4" aria-hidden="true" />
                                </button>
                                <div className="absolute bottom-2 left-2 flex gap-1 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    {index > 0 && <button type="button" onClick={() => move(index, -1)} className="w-7 h-7 bg-white/90 rounded-full text-sm font-bold" aria-label={`Avancer la photo ${index + 1}`}>←</button>}
                                    {index < photos.length - 1 && <button type="button" onClick={() => move(index, 1)} className="w-7 h-7 bg-white/90 rounded-full text-sm font-bold" aria-label={`Reculer la photo ${index + 1}`}>→</button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm mb-6">Aucune photo personnalisée : les photos par défaut sont affichées.</p>
                )}
                <label className={`inline-flex items-center gap-2 px-5 py-2.5 bg-[#e6244d] text-white rounded-xl font-medium hover:bg-[#d11d42] transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} disabled={uploading} />
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Upload className="w-4 h-4" aria-hidden="true" />}
                    {uploading ? 'Envoi en cours…' : 'Ajouter des photos'}
                </label>
                <p className="text-xs text-gray-400 mt-2">Format paysage conseillé, 5 Mo maximum par photo.</p>
            </div>
        </section>
    );
}
