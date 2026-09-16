import { supabase } from '@/lib/supabase';

export type Bucket = 'avatars' | 'missions' | 'mission-media' | 'slideshow';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Retourne un message d'erreur si le fichier n'est pas acceptable, sinon null. */
export function validateUpload(file: File, accept: Array<'image' | 'video'> = ['image']): string | null {
    if (!accept.some(kind => file.type.startsWith(`${kind}/`))) {
        return `« ${file.name} » n'est pas ${accept.includes('video') ? 'une image ou une vidéo' : 'une image'}.`;
    }
    if (file.size > MAX_UPLOAD_BYTES) return `« ${file.name} » dépasse 5 Mo.`;
    return null;
}

function safeName(name: string): string {
    const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/** Envoie un fichier dans `bucket/folder/…` et retourne son URL publique. */
export async function uploadPublicFile(bucket: Bucket, folder: string, file: File): Promise<string> {
    const path = folder ? `${folder}/${safeName(file.name)}` : safeName(file.name);
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Supprime un fichier à partir de son URL publique (ignore les URL externes). */
export async function removePublicFile(bucket: Bucket, publicUrl: string | null | undefined): Promise<void> {
    if (!publicUrl) return;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) return;
    const path = decodeURIComponent(publicUrl.slice(index + marker.length).split('?')[0]);
    await supabase.storage.from(bucket).remove([path]);
}
