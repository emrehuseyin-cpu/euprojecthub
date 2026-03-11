"use client";

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { trackEvent } from '../lib/analytics';
import { Activity, MousePointer2, Eye, CheckCircle2 } from 'lucide-react';

export default function AnalyticsTestPage() {
    const [lastEvent, setLastEvent] = useState<string | null>(null);

    const handleTriggerEvent = () => {
        const timestamp = new Date().toISOString();
        trackEvent('test_button_clicked', {
            timestamp,
            page: '/analytics-test',
            test_mode: true
        });
        setLastEvent(`Event 'test_button_clicked' sent at ${new Date().toLocaleTimeString()}`);
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Activity className="text-indigo-600 w-8 h-8" />
                                PostHog Test Merkezi
                            </h1>
                            <p className="text-gray-500 mt-2">
                                Analytics entegrasyonunu doğrulamak için bu sayfayı kullanabilirsiniz.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pageview Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Eye className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold">1. Otomatik Pageview</h3>
                                <p className="text-sm text-gray-500">
                                    Bu sayfaya girdiğiniz anda PostHog'a bir <code>$pageview</code> eventi gönderildi.
                                </p>
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Aktif ve takip ediliyor</span>
                                </div>
                            </div>

                            {/* Custom Event Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <MousePointer2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold">2. Özel Event Testi</h3>
                                <p className="text-sm text-gray-500">
                                    Aşağıdaki butona basarak manuel bir "test_button_clicked" eventi gönderin.
                                </p>
                                <button
                                    onClick={handleTriggerEvent}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                                >
                                    Event Gönder
                                </button>
                                {lastEvent && (
                                    <p className="text-[11px] font-mono text-indigo-500 bg-indigo-50 p-2 rounded border border-indigo-100 italic">
                                        {lastEvent}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Verification Instructions */}
                        <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl shadow-xl overflow-hidden relative">
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-white text-xl font-bold">Nasıl Doğrulanır?</h3>
                                <ol className="list-decimal list-inside space-y-3 text-sm">
                                    <li><a href="https://eu.posthog.com" target="_blank" className="text-indigo-400 hover:underline">PostHog Dashboard</a>'unuza gidin.</li>
                                    <li>Sol menüden <b>"Activity (Activity)"</b> veya <b>"Events (Explore)"</b> sekmesine tıklayın.</li>
                                    <li>Tabloda <code>$pageview</code> ve (butona bastıysanız) <code>test_button_clicked</code> eventlerini anlık olarak görmelisiniz.</li>
                                </ol>
                                <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <p className="text-xs italic">
                                        <b>Not:</b> Eğer eventler görünmüyorsa ad-blocker'ınızın kapalı olduğundan emin olun. Ayrıca <code>.env.local</code> dosyasındaki API Key'lerinizin doğruluğunu kontrol edin.
                                    </p>
                                </div>
                            </div>
                            <Activity className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
