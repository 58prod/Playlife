import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmOptions {
    title: string;
    message?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolver = useRef<(value: boolean) => void>(undefined);

    const confirm = useCallback<ConfirmFn>(opts => {
        setOptions(opts);
        return new Promise<boolean>(resolve => { resolver.current = resolve; });
    }, []);

    const close = (value: boolean) => {
        resolver.current?.(value);
        resolver.current = undefined;
        setOptions(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {options && (
                <Modal onClose={() => close(false)} label={options.title} closeOnBackdrop className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl p-6">
                        <div className="flex items-start gap-4">
                            {options.danger && (
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold text-[#22081c]">{options.title}</h2>
                                {options.message && <div className="mt-2 text-sm text-gray-600">{options.message}</div>}
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <button type="button" onClick={() => close(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                                {options.cancelLabel ?? 'Annuler'}
                            </button>
                            <button
                                type="button"
                                autoFocus
                                onClick={() => close(true)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-white ${options.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#e6244d] hover:bg-[#c91d41]'}`}
                            >
                                {options.confirmLabel ?? 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm(): ConfirmFn {
    const confirm = useContext(ConfirmContext);
    if (!confirm) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider');
    return confirm;
}
