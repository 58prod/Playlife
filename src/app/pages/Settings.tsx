import { Shield } from 'lucide-react';
import { MissionsAdmin } from './settings/MissionsAdmin';
import { StructuresAdmin } from './settings/StructuresAdmin';
import { ImpactMetricsAdmin, SlideshowAdmin } from './settings/SiteContentAdmin';

export default function Settings() {
    return (
        <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#22081c]">Administration</h1>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-full border border-gray-200">v{__APP_VERSION__}</span>
            </div>
            <MissionsAdmin />
            <StructuresAdmin />
            <ImpactMetricsAdmin />
            <SlideshowAdmin />
        </div>
    );
}
