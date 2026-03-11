"use client";

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    description?: string;
}

export function SlideOver({ open, onClose, title, children, description }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (open) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setMounted(false);
                document.body.style.overflow = 'unset';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!mounted && !open) return null;

    return (
        <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${open ? 'visible' : 'invisible delay-300'}`}>
            {/* Backdrop with Glassmorphism */}
            <div
                className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div
                    className={`w-screen max-w-md transform transition-transform duration-300 ease-in-out bg-white shadow-2xl border-l border-gray-100 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">{title}</h3>
                            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
