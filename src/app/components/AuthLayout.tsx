import type { ComponentType, InputHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLayoutProps {
    icon: ComponentType<{ className?: string }>;
    title: string;
    subtitle?: string;
    error?: string | null;
    children: ReactNode;
}

export function AuthLayout({ icon: Icon, title, subtitle, error, children }: AuthLayoutProps) {
    return (
        <div className="min-h-[calc(100vh-95px)] flex items-start justify-center bg-gray-50 px-4 md:px-8 py-6 md:py-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e6244d] rounded-2xl mb-4 shadow-lg shadow-[#e6244d]/20">
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#22081c]">{title}</h1>
                    {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
                </div>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl" role="alert">
                        {error}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    hint?: string;
}

export function AuthField({ id, label, icon: Icon, hint, ...input }: AuthFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
                <input
                    id={id}
                    {...input}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6244d]/20 focus:border-[#e6244d] transition-all"
                />
            </div>
            {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
        </div>
    );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#e6244d] text-white font-bold rounded-xl hover:bg-[#c91d41] transition-all shadow-lg shadow-[#e6244d]/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-label="Chargement" /> : children}
        </button>
    );
}
