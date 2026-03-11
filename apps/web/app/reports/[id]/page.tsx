"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Download,
    Save,
    Loader2,
    FileCheck,
    Target,
    Users,
    Wallet,
    Globe2,
    AlertTriangle
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ReportDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic Metrics State
    const [projectStats, setProjectStats] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [budgetItems, setBudgetItems] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);

    useEffect(() => {
        async function loadReportData() {
            try {
                setLoading(true);
                // 1. Fetch Report Metadata
                const { data: reportData, error: reportError } = await supabase
                    .from('reports')
                    .select('*, project:projects(*)')
                    .eq('id', params.id)
                    .single();

                if (reportError) throw reportError;
                setReport(reportData);
                setProjectStats(reportData.project);

                const projectId = reportData.project_id;

                // 2. Fetch Participants
                const { data: partData } = await supabase
                    .from('participants')
                    .select('country, gender, status, fewer_opportunities')
                    .eq('project_id', projectId);
                if (partData) setParticipants(partData);

                // 3. Fetch Activities
                const { data: actData } = await supabase
                    .from('activities')
                    .select('*')
                    .eq('project_id', projectId);
                if (actData) setActivities(actData);

                // 4. Fetch Budget Items
                const { data: budgetData, error: budgetError } = await supabase
                    .from('budget_items')
                    .select('amount, category')
                    .eq('project_id', projectId);
                if (budgetData) {
                    setBudgetItems(budgetData);
                } else if (budgetError && budgetError.code !== '42P01') {
                    // Ignore 42P01 missing table
                    console.error(budgetError);
                }

                // 5. Fetch Partners
                const { data: partnerData } = await supabase
                    .from('partners')
                    .select('*')
                    .eq('project_id', projectId);
                if (partnerData) setPartners(partnerData);

            } catch (err: any) {
                console.error(err);
                setError("Rapor verileri yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        }
        loadReportData();
    }, [params.id]);

    const handleSaveReport = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('reports')
                .update({ status: 'Onaylandı' })
                .eq('id', report.id);

            if (error) throw error;
            setReport({ ...report, status: 'Onaylandı' });
            alert("Rapor başarıyla kaydedildi ve onaylandı.");
        } catch (err) {
            console.error(err);
            alert("Rapor kaydedilirken hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="mt-4 text-gray-500 font-medium">Rapor verileri derleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                        <h2 className="text-xl font-bold">Rapor Bulunamadı</h2>
                        <Link href="/reports" className="mt-4 text-blue-600 font-medium hover:underline">Listeye Dön</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate Chart Datasets
    const countryCounts = participants.reduce((acc, curr) => {
        acc[curr.country] = (acc[curr.country] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const countryData = Object.keys(countryCounts).map(key => ({ name: key, count: countryCounts[key] })).sort((a, b) => b.count - a.count).slice(0, 5);

    const totalBudget = projectStats?.budget || 0;
    const spentBudget = budgetItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - spentBudget);
    const budgetData = [
        { name: 'Harcanan', value: spentBudget },
        { name: 'Kalan', value: remainingBudget }
    ];

    const categoryBudget = budgetItems.reduce((acc, curr) => {
        acc[curr.category || 'Diğer'] = (acc[curr.category || 'Diğer'] || 0) + Number(curr.amount);
        return acc;
    }, {} as Record<string, number>);
    const budgetBarData = Object.keys(categoryBudget).map(key => ({ name: key, Bütçe: categoryBudget[key] }));

    const completedActivities = activities.filter(a => a.status === 'Tamamlandı').length;
    const activityProgress = activities.length > 0 ? (completedActivities / activities.length) * 100 : 0;

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-200/50 p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Top Navigation */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <Link
                                href="/reports"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Raporlar Listesine Dön
                            </Link>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                                    <Download className="w-4 h-4" /> PDF İndir
                                </button>
                                {report.status !== 'Onaylandı' && (
                                    <button
                                        onClick={handleSaveReport}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Raporu Kaydet / Onayla
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* A4 Document Container */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[1000px]">

                            {/* Report Header */}
                            <div className="bg-slate-900 px-10 py-12 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                    <div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30 mb-4 uppercase tracking-wider">
                                            {report.type}
                                        </span>
                                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{projectStats?.name}</h1>
                                        <p className="text-slate-400 max-w-2xl">{report.title}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm text-slate-400 font-medium">Oluşturulma Tarihi</p>
                                        <p className="text-lg font-bold">{format(parseISO(report.created_at), 'dd MMMM yyyy', { locale: tr })}</p>
                                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 border border-white/20">
                                            Durum: <span className={report.status === 'Onaylandı' ? 'text-emerald-400' : 'text-amber-400'}>{report.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Body */}
                            <div className="p-10 space-y-12">

                                {/* 1. Proje Özeti */}
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                                        <Target className="w-6 h-6 text-blue-600" /> Proje Özeti
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Program</p>
                                            <p className="font-bold text-slate-900">{projectStats?.program}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Başlangıç</p>
                                            <p className="font-bold text-slate-900">{projectStats?.start_date ? format(parseISO(projectStats.start_date), 'MMM yyyy', { locale: tr }) : '-'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bitiş</p>
                                            <p className="font-bold text-slate-900">{projectStats?.end_date ? format(parseISO(projectStats.end_date), 'MMM yyyy', { locale: tr }) : '-'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Toplam Bütçe</p>
                                            <p className="font-bold text-slate-900">€{totalBudget.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* 2. Faaliyetler */}
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                                        <FileCheck className="w-6 h-6 text-indigo-600" /> Faaliyet İlerlemesi
                                    </h3>
                                    <div className="bg-white border text-center p-6 rounded-xl border-slate-200">
                                        <p className="text-sm font-bold text-slate-500 mb-3">Tamamlanma Oranı: <span className="text-indigo-600 font-extrabold text-2xl ml-2">{activityProgress.toFixed(0)}%</span></p>
                                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-4">
                                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${activityProgress}%` }}></div>
                                        </div>
                                        <p className="text-sm text-slate-600">Toplam <strong>{activities.length}</strong> faaliyetten <strong>{completedActivities}</strong> tanesi tamamlandı.</p>
                                    </div>
                                </section>

                                {/* 3. Katılımcılar */}
                                {(report.type === 'Ara Rapor' || report.type === 'Final Rapor' || report.type === 'Katılımcı İstatistik Raporu') && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                                            <Users className="w-6 h-6 text-emerald-600" /> Katılımcı Analizi
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-white border rounded-xl border-slate-200 p-6 flex flex-col items-center justify-center">
                                                <p className="text-sm font-bold text-slate-500 mb-4">Ülke Dağılımı (Top 5)</p>
                                                <div className="w-full h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={countryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                                            <RechartsTooltip cursor={{ fill: '#F1F5F9' }} />
                                                            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-500">Toplam Katılımcı</p>
                                                        <p className="text-2xl font-bold text-slate-900">{participants.length}</p>
                                                    </div>
                                                    <Globe2 className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-500">Dezavantajlı (Fewer Opp.)</p>
                                                        <p className="text-2xl font-bold text-slate-900">{participants.filter(p => p.fewer_opportunities).length}</p>
                                                    </div>
                                                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">GDPR Priority</span>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-500">Kadın Katılımcı Oranı</p>
                                                        <p className="text-2xl font-bold text-slate-900">
                                                            {participants.length ? ((participants.filter(p => p.gender === 'Kadın').length / participants.length) * 100).toFixed(0) : 0}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* 4. Bütçe */}
                                {(report.type === 'Bütçe Raporu' || report.type === 'Ara Rapor' || report.type === 'Final Rapor') && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                                            <Wallet className="w-6 h-6 text-amber-500" /> Finansal Gelişim
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={budgetData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {budgetData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#F59E0B' : '#E2E8F0'} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <p className="text-center text-sm font-medium text-slate-600 mt-2">Bütçe Tüketimi (Harcanan: €{spentBudget.toLocaleString()})</p>
                                            </div>
                                            <div className="h-64">
                                                {budgetItems.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={budgetBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                                            <YAxis tickFormatter={(val) => `€${val}`} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                                            <RechartsTooltip cursor={{ fill: '#F1F5F9' }} />
                                                            <Bar dataKey="Bütçe" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                                                        Harcanan bütçe kalemi detayı bulunmuyor.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* 5. Ortaklar */}
                                {(report.type === 'Ara Rapor' || report.type === 'Final Rapor') && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                                            <Globe2 className="w-6 h-6 text-cyan-600" /> Ortaklar (Konsorsiyum)
                                        </h3>
                                        <div className="bg-white border text-left p-0 rounded-xl border-slate-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-3 font-semibold text-slate-500">Kurum Adı</th>
                                                        <th className="px-6 py-3 font-semibold text-slate-500 text-center">Ülke</th>
                                                        <th className="px-6 py-3 font-semibold text-slate-500 text-right">Tür</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {partners.length > 0 ? partners.map(p => (
                                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                                            <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                                                            <td className="px-6 py-4 text-center text-slate-600">{p.country}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="inline-flex bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">{p.type}</span>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Ortak bilgisi bulunamadı.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                )}

                            </div>
                        </div>
                        {/* End of A4 */}

                        {/* Disclaimer */}
                        <p className="text-center text-xs text-gray-400 mt-4">EUProjectHub Otomatik Raporlama Sistemi tarafından üretilmiştir. Tüm istatistikler yansıtıldığı andaki mevcut Supabase veritabanı durumunu baz alır.</p>
                    </div>
                </main>
            </div>
        </div>
    );
}
