import { forwardRef, type ComponentType, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const controlClass =
    'block w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-ink-900 ring-1 ring-inset ring-gray-200 shadow-[0_1px_2px_rgb(48_21_54/0.04)] transition focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500';

interface FieldProps {
    id: string;
    label: ReactNode;
    hint?: ReactNode;
    required?: boolean;
    className?: string;
    children: ReactNode;
}

export function Field({ id, label, hint, required, className, children }: FieldProps) {
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
                {label}
                {required && <span className="ml-0.5 text-brand-500" aria-hidden="true">*</span>}
            </label>
            {children}
            {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: IconType }>(function Input({ icon: Icon, className, ...props }, ref) {
    if (!Icon) return <input ref={ref} className={cn(controlClass, className)} {...props} />;
    return (
        <div className="relative">
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input ref={ref} className={cn(controlClass, 'pl-10', className)} {...props} />
        </div>
    );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(controlClass, 'resize-y min-h-24', className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(controlClass, 'pr-9', className)} {...props} />;
});
