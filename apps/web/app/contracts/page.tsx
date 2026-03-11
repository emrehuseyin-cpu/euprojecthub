"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileSignature,
    Plus,
    Search,
    Filter,
    Loader2,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { format, parseISO, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ContractsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tümü');

    useEffect(() => {
        async function fetchContracts() {
            try {
                const { data, error } = await supabase
                    .from('contracts')
                    .select(`
            *,
            project:projects(name),
            partner:partners(name)
          `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    const formattedData = data.map(c => {
                        // Auto-detect if expired based on expiry_date
                        let currentStatus = c.status;
                        if (currentStatus === 'İmzalandı' && c.expiry_date && isPast(parseISO(c.expiry_date))) {
                            currentStatus = 'Süresi Doldu';
                        }

                        return {
                            ...c,
                            projectName: c.project ? c.project.name : 'Genel',
                            partnerName: c.partner ? c.partner.name : 'Genel',
                            status: currentStatus
                        };
                    });
                    setContracts(formattedData);
                }
            } catch (err) {
                console.error('Error fetching contracts:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchContracts();
    }, []);

    const statuses = ['Tümü', 'Beklemede', 'İmzalandı', 'Süresi Doldu'];

    const filteredContracts = contracts.filter(c => {
        const matchesFilter = statusFilter === 'Tümü' || c.status === statusFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            c.title.toLowerCase().includes(searchLower) ||
            c.projectName.toLowerCase().includes(searchLower) ||
            c.partnerName.toLowerCase().includes(searchLower);

        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'İmzalandı': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Beklemede': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Süresi Doldu': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileSignature className="text-blue-600 w-6 h-6" />
                                    Sözleşmeler Yönetimi
                                </h2>
                                <p className="text-gray-500 mt-1">Ortaklık anlaşmaları, hibe sözleşmeleri ve alt sözleşmelerin durumlarını takip edin.</p>
                            </div>
                            <Link
                                href="/contracts/new"
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                            >
                                <Plus size={20} />
                                <span>Yeni Sözleşme</span>
                            </Link>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                                {statuses.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setStatusFilter(tab)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${statusFilter === tab
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Sözleşme başlığı, proje veya ortak ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Sözleşmeler listesi yükleniyor...</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sözleşme Başlığı & Türü</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proje & Ortak</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">İmza / Bitiş Tarihi</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredContracts.map((c) => (
                                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 border-l-2 border-transparent hover:border-blue-500">
                                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer">{c.title}</h3>
                                                        <p className="text-xs font-medium text-gray-500 mt-0.5">{c.type}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-semibold text-gray-800 line-clamp-1 border-b border-gray-100 pb-1">{c.projectName}</span>
                                                            <span className="text-sm text-gray-500 line-clamp-1">{c.partnerName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5 text-sm">
                                                            {c.signed_date && (
                                                                <span className="flex items-center text-gray-600">
                                                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                                                    {format(parseISO(c.signed_date), 'dd MMM yyyy', { locale: tr })}
                                                                </span>
                                                            )}
                                                            {c.expiry_date && (
                                                                <span className={`flex items-center ${c.status === 'Süresi Doldu' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                                    <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                                                                    {format(parseISO(c.expiry_date), 'dd MMM yyyy', { locale: tr })}
                                                                </span>
                                                            )}
                                                            {!c.signed_date && !c.expiry_date && <span className="text-gray-400 italic">Tarih belirtilmedi</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadge(c.status)}`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredContracts.length === 0 && (
                                        <div className="py-16 flex flex-col items-center justify-center bg-gray-50/30">
                                            <FileSignature className="w-12 h-12 text-gray-300 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900">Sözleşme bulunamadı</h3>
                                            <p className="text-gray-500 mt-1">Belirlediğiniz kriterlere uygun sözleşme kaydı yok.</p>
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
