import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ImpactMetrics } from '@/types/database.types';

export const DEFAULT_IMPACT_METRICS: ImpactMetrics = {
    value1: '23',
    label1: 'structures aidées',
    value2: '580',
    label2: 'enfants aidés',
};

function isImpactMetrics(value: unknown): value is ImpactMetrics {
    return !!value && typeof value === 'object' && ['value1', 'label1', 'value2', 'label2'].every(k => k in value);
}

export async function fetchImpactMetrics(): Promise<ImpactMetrics> {
    const { data } = await supabase.from('site_config').select('value').eq('key', 'impact_metrics').maybeSingle();
    return isImpactMetrics(data?.value) ? data.value : DEFAULT_IMPACT_METRICS;
}

export async function fetchSlideshowPhotos(): Promise<string[]> {
    const { data } = await supabase.from('site_config').select('value').eq('key', 'slideshow_photos').maybeSingle();
    return Array.isArray(data?.value) ? data.value.filter((v): v is string => typeof v === 'string') : [];
}

export function useImpactMetrics(): ImpactMetrics {
    const [metrics, setMetrics] = useState(DEFAULT_IMPACT_METRICS);
    useEffect(() => {
        let active = true;
        fetchImpactMetrics().then(m => active && setMetrics(m));
        return () => { active = false; };
    }, []);
    return metrics;
}

export function useSlideshowPhotos(): string[] {
    const [photos, setPhotos] = useState<string[]>([]);
    useEffect(() => {
        let active = true;
        fetchSlideshowPhotos().then(p => active && setPhotos(p));
        return () => { active = false; };
    }, []);
    return photos;
}
