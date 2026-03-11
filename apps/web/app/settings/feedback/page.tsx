"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import {
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    Filter,
    MoreHorizontal,
    Search
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Feedback = {
    id: string;
    page: string;
    type: string;
    message: string;
    status: 'Yeni' | 'İnceleniyor' | 'Tamamlandı';
    created_at: string;
};

export default function FeedbackManagementPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Hepsi');

    const fetchFeedbacks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('feedbacks')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setFeedbacks(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const updateStatus = async (id: string, newStatus: Feedback['status']) => {
        const { error } = await supabase
            .from('feedbacks')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        const matchesSearch = f.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.page.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Hepsi' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: feedbacks.length,
        new: feedbacks.filter(f => f.status === 'Yeni').length,
        processing: feedbacks.filter(f => f.status === 'İnceleniyor').length,
        completed: feedbacks.filter(f => f.status === 'Tamamlandı').length,
        bugs: feedbacks.filter(f => f.type === 'Hata').length
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Geri Bildirim Yönetimi</h1>
                                <p className="text-gray-500">Kullanıcılardan gelen hatalar, öneriler ve iyileştirme taleplerini takip edin.</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Toplam Bildirim</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Yeni / İncelenen</p>
                                        <p className="text-2xl font-bold text-amber-600">{stats.new + stats.processing}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Hata Raporları</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.bugs}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tamamlanan</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Mesaj veya sayfa ara..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Filter className="text-gray-400 w-5 h-5" />
                                    <select
                                        className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="Hepsi">Tüm Durumlar</option>
                                        <option value="Yeni">Yeni</option>
                                        <option value="İnceleniyor">İnceleniyor</option>
                                        <option value="Tamamlandı">Tamamlandı</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Tarih</th>
                                            <th className="px-6 py-4">Tür</th>
                                            <th className="px-6 py-4">Sayfa</th>
                                            <th className="px-6 py-4">Mesaj</th>
                                            <th className="px-6 py-4">Durum</th>
                                            <th className="px-6 py-4">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={6} className="px-6 py-4 bg-gray-50/50 h-16"></td>
                                                </tr>
                                            ))
                                        ) : filteredFeedbacks.length > 0 ? (
                                            filteredFeedbacks.map((f) => (
                                                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                        {format(new Date(f.created_at), 'dd MMM HH:mm', { locale: tr })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${f.type === 'Hata' ? 'bg-red-100 text-red-700' :
                                                                f.type === 'Öneri' ? 'bg-amber-100 text-amber-700' :
                                                                    f.type === 'İyileştirme' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {f.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">
                                                            {f.page}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-900 line-clamp-2 max-w-md">{f.message}</p>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${f.status === 'Yeni' ? 'text-amber-600' :
                                                                f.status === 'İnceleniyor' ? 'text-indigo-600' :
                                                                    'text-green-600'
                                                            }`}>
                                                            {f.status === 'Yeni' && <Clock className="w-3.5 h-3.5" />}
                                                            {f.status === 'İnceleniyor' && <Filter className="w-3.5 h-3.5" />}
                                                            {f.status === 'Tamamlandı' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                            {f.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => updateStatus(f.id, 'İnceleniyor')}
                                                                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${f.status === 'İnceleniyor' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                                                title="İnceleniyor Yap"
                                                            >
                                                                İncele
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(f.id, 'Tamamlandı')}
                                                                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${f.status === 'Tamamlandı' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                                                title="Tamamlandı Yap"
                                                            >
                                                                Bitir
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                                    Geri bildirim bulunamadı.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
