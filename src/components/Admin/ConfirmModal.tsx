"use client";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    variant?: "danger" | "primary";
}

export default function ConfirmModal({
                                         isOpen, title, message, onConfirm, onClose, confirmText = "Confirm", variant = "primary"
                                     }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-brand-accent">
                <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">{title}</h3>
                <p className="text-sm text-brand-secondary mb-8 leading-relaxed">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-brand-primary bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white transition-transform active:scale-95 ${
                            variant === "danger" ? "bg-red-600 shadow-red-200 shadow-lg" : "bg-brand-primary shadow-brand-primary/20 shadow-lg"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}