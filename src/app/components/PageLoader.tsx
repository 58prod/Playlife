import { Loader2 } from 'lucide-react';

export function PageLoader({ label = 'Chargement…' }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-24" role="status" aria-live="polite">
            <Loader2 className="w-8 h-8 text-[#e6244d] animate-spin" aria-hidden="true" />
            <span className="text-sm text-gray-500">{label}</span>
        </div>
    );
}
