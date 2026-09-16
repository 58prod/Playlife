import { supabase } from '@/lib/supabase';
import { removePublicFile } from '@/lib/storage';
import type { Mission, MissionMedia } from '@/types/database.types';

/** Charge les photos des missions données, regroupées par mission. */
export async function fetchPhotosByMission(missionIds: string[]): Promise<Record<string, MissionMedia[]>> {
    if (missionIds.length === 0) return {};
    const { data, error } = await supabase
        .from('mission_media')
        .select('*')
        .in('mission_id', missionIds)
        .eq('media_type', 'photo')
        .order('created_at', { ascending: true });
    if (error) throw error;
    const map: Record<string, MissionMedia[]> = {};
    for (const media of data) (map[media.mission_id] ??= []).push(media);
    return map;
}

/** Supprime une mission, ses médias et les fichiers associés dans le Storage. */
export async function deleteMission(mission: Mission): Promise<void> {
    const { data: media } = await supabase.from('mission_media').select('media_url').eq('mission_id', mission.id);
    const { error } = await supabase.from('missions').delete().eq('id', mission.id);
    if (error) throw error;
    // Nettoyage best-effort : une erreur ici ne doit pas bloquer la suppression.
    await Promise.allSettled([
        removePublicFile('missions', mission.image_url),
        ...(media ?? []).map(m => removePublicFile('mission-media', m.media_url)),
    ]);
}

export async function deleteMissionPhoto(photo: MissionMedia): Promise<void> {
    const { error } = await supabase.from('mission_media').delete().eq('id', photo.id);
    if (error) throw error;
    await removePublicFile('mission-media', photo.media_url).catch(() => undefined);
}
