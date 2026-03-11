"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackEvent, trackError } from '../lib/analytics';

const feedbackTypes = [
    { id: 'Hata', label: '🐛 Hata', color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'Öneri', label: '💡 Öneri', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'İyileştirme', label: '⚡ İyileştirme', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'Genel', label: '💬 Genel', color: 'bg-gray-50 text-gray-700 border-gray-200' },
];

export function FeedbackButton() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('Genel');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('feedbacks').insert([{
                page: pathname,
                type,
                message,
                status: 'Yeni'
            }]);

            if (error) throw error;

            trackEvent('feedback_submitted', { type, page: pathname });

            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSuccess(false);
                setMessage('');
                setType('Genel');
            }, 2000);
        } catch (err: any) {
            trackError(err, { context: 'feedback_submission' });
            console.error('Feedback submission failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50 group active:scale-95"
                title="Geri Bildirim"
            >
                <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                Geri Bildirim
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {isSuccess ? (
                                <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">Teşekkürler! 🎉</h4>
                                        <p className="text-gray-500 mt-1">Geri bildiriminiz başarıyla iletildi.</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Tür Seçiniz</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {feedbackTypes.map((ft) => (
                                                <button
                                                    key={ft.id}
                                                    type="button"
                                                    onClick={() => setType(ft.id)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all text-center ${type === ft.id
                                                            ? `${ft.color} border-current ring-1 ring-current`
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {ft.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                                            Mesajınız
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={4}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Geri bildiriminizi buraya yazın..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-[15px]"
                                            required
                                        ></textarea>
                                        <p className="text-[11px] text-gray-400 mt-2 italic flex items-center gap-1">
                                            Konum: <span className="font-mono text-indigo-500">{pathname}</span>
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Gönder
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
