import { Shield } from 'lucide-react';
import { MissionsAdmin } from './settings/MissionsAdmin';
import { StructuresAdmin } from './settings/StructuresAdmin';
import { ImpactMetricsAdmin, SlideshowAdmin } from './settings/SiteContentAdmin';

export default function Settings() {
    return (
        <div className="container-page pt-8 lg:pt-12">
            <div className="mb-10 flex flex-wrap items-center gap-4 animate-fade-up">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-ink-900 text-white"><Shield className="size-6" aria-hidden="true" /></span>
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl">Administration</h1>
                    <p className="text-sm text-gray-500">Modération, contenus du site · version {__APP_VERSION__}</p>
                </div>
            </div>
            <MissionsAdmin />
            <StructuresAdmin />
            <ImpactMetricsAdmin />
            <SlideshowAdmin />
        </div>
    );
}
