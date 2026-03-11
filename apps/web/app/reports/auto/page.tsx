"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Wand2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

export default function AutoReportPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [projectId, setProjectId] = useState('');
    const [reportType, setReportType] = useState('Ara Rapor');

    useEffect(() => {
        async function loadProjects() {
            const { data, error } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
            setLoading(false);
        }
        loadProjects();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) {
            setError("Lütfen bir proje seçin.");
            return;
        }

        try {
            setGenerating(true);
            setError(null);

            // Auto report generation flow:
            // 1. We create a "Draft" record in the reports table without heavy content.
            // 2. The detail page `[id]/page.tsx` will detect it's an auto-generated type and dynamically pull the stats.
            const selectedProject = projects.find(p => p.id === projectId);

            const { data, error } = await supabase
                .from('reports')
                .insert([{
                    project_id: projectId,
                    title: `${selectedProject?.name} - Dinamik ${reportType}`,
                    type: reportType,
                    status: 'Taslak',
                    content: 'Bu rapor sistem tarafından otomatik oluşturulmuştur.' // Will be dynamically enriched on the view page
                }])
                .select()
                .single();

            if (error) throw error;

            trackEvent('report_generated', {
                project_id: projectId,
                type: reportType,
                status: 'Auto-Generated'
            });

            // Redirect to the dynamic view
            router.push(`/reports/${data.id}`);

        } catch (err: any) {
            trackError(err, { context: 'generate_auto_report' });
            console.error(err);
            setError("Rapor taslağı oluşturulurken hata oluştu.");
            setGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* Top Navigation */}
                        <div>
                            <Link
                                href="/reports"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Raporlar Listesine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-8 py-10 bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-indigo-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <Wand2 className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Otomatik Rapor Sihirbazı</h2>
                                <p className="text-gray-600 mt-2 max-w-lg">
                                    Sistemdeki tüm canlı verileri (faaliyetler, katılımcılar, bütçe, LMS verileri) kullanarak anında görsel, kapsamlı bir rapor oluşturun.
                                </p>
                            </div>

                            <div className="p-8">
                                {error && (
                                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleGenerate} className="space-y-6 max-w-xl mx-auto">

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Hedef Proje Seçimi
                                        </label>
                                        <div className="relative">
                                            {loading ? (
                                                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center text-gray-500">
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Projeler Yükleniyor...
                                                </div>
                                            ) : (
                                                <select
                                                    required
                                                    value={projectId}
                                                    onChange={(e) => setProjectId(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                >
                                                    <option value="">Analiz edilecek projeyi seçin</option>
                                                    {projects.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Rapor Türü ve Kapsamı
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { id: 'Ara Rapor', desc: 'Genel Durum & Tüm İstatistikler' },
                                                { id: 'Final Rapor', desc: 'Kapanış ve Kümülatif Veriler' },
                                                { id: 'Faaliyet Raporu', desc: 'Sadece Event Odaklı' },
                                                { id: 'Bütçe Raporu', desc: 'Finansal Harcama Analizi' },
                                                { id: 'Katılımcı İstatistik Raporu', desc: 'GDPR ve Demografik Veriler' },
                                            ].map(type => (
                                                <label
                                                    key={type.id}
                                                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${reportType === type.id
                                                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <input
                                                            type="radio"
                                                            name="reportType"
                                                            value={type.id}
                                                            checked={reportType === type.id}
                                                            onChange={(e) => setReportType(e.target.value)}
                                                            className="text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                        />
                                                        <span className="font-semibold text-gray-900 text-sm">{type.id}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 ml-6">{type.desc}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                        <button
                                            type="submit"
                                            disabled={loading || generating}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-70"
                                        >
                                            {generating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Veriler Derleniyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="w-5 h-5" />
                                                    Raporu Oluştur
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
