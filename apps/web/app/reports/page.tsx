"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileText,
    Plus,
    Search,
    Download,
    Loader2,
    FileCheck,
    FileEdit,
    AlertCircle,
    Wand2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchReports() {
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select(`
            *,
            project:projects(name)
          `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching reports:', error);
                } else if (data) {
                    setReports(data.map(r => ({
                        ...r,
                        projectName: r.project ? r.project.name : 'Genel',
                    })));
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchReports();
    }, []);

    const statuses = ['Tümü', 'Taslak', 'İncelemede', 'Onaylandı'];

    const filteredReports = reports.filter(report => {
        const matchesFilter = filterStatus === 'Tümü' || report.status === filterStatus;
        const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.projectName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Taslak': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'İncelemede': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Onaylandı': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Final Rapor': return <FileCheck className="w-8 h-8 text-emerald-500" />;
            case 'Ara Rapor': return <FileEdit className="w-8 h-8 text-blue-500" />;
            case 'Bütçe Raporu': return <FileText className="w-8 h-8 text-amber-500" />;
            default: return <FileText className="w-8 h-8 text-indigo-500" />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="text-blue-600 w-6 h-6" />
                                    Raporlama Yönetimi
                                </h2>
                                <p className="text-gray-500 mt-1">Projeleriniz için performans, finans ve ara dönem raporlarını hazırlayın ve takip edin.</p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href="/reports/auto"
                                    className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    <Wand2 size={20} />
                                    <span>Otomatik Rapor</span>
                                </Link>
                                <Link
                                    href="/reports/new"
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                                >
                                    <Plus size={20} />
                                    <span>Yeni Rapor</span>
                                </Link>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                                {statuses.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilterStatus(tab)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === tab
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rapor veya proje ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Raporlar yükleniyor...</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rapor Adı</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proje</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredReports.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                {getTypeIcon(report.type)}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{report.title}</h3>
                                                                <p className="text-xs text-gray-500 mt-0.5">{report.type}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-gray-700">{report.projectName}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-500">
                                                            {format(parseISO(report.created_at || new Date().toISOString()), 'dd MMM yyyy', { locale: tr })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="PDF olarak indir">
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredReports.length === 0 && (
                                        <div className="py-16 flex flex-col items-center justify-center bg-gray-50/30">
                                            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900">Rapor bulunamadı</h3>
                                            <p className="text-gray-500 mt-1">Belirlediğiniz kriterlere uygun rapor kaydı yok.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
