import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './ui/Button';

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
                    <div className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-ink-900/[0.06]">
                        <div className="flex items-start gap-4">
                            {options.danger && (
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h2 className="text-xl font-semibold">{options.title}</h2>
                                {options.message && <div className="mt-2 text-sm text-gray-600">{options.message}</div>}
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <Button variant="secondary" onClick={() => close(false)}>{options.cancelLabel ?? 'Annuler'}</Button>
                            <Button autoFocus variant={options.danger ? 'danger' : 'primary'} onClick={() => close(true)}>{options.confirmLabel ?? 'Confirmer'}</Button>
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
