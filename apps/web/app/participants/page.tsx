"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    UsersRound,
    Plus,
    Search,
    Filter,
    Loader2,
    Globe2,
    TrendingUp,
    Mail,
    UserCheck
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState('Tümü');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        countries: 0,
        avgAge: 0
    });

    useEffect(() => {
        async function fetchParticipants() {
            try {
                const { data, error } = await supabase
                    .from('participants')
                    .select(`
            *,
            project:projects(name),
            activity:activities(title)
          `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    const formattedData = data.map(p => ({
                        ...p,
                        projectName: p.project ? p.project.name : 'Genel',
                        activityName: p.activity ? p.activity.title : 'Genel'
                    }));
                    setParticipants(formattedData);

                    // Calculate stats
                    const uniqueCountries = new Set(data.map(p => p.country)).size;
                    const currentYear = new Date().getFullYear();
                    const validAges = data.filter(p => p.birth_year).map(p => currentYear - p.birth_year);
                    const avgAge = validAges.length > 0
                        ? Math.round(validAges.reduce((a, b) => a + b, 0) / validAges.length)
                        : 0;

                    setStats({
                        total: data.length,
                        countries: uniqueCountries,
                        avgAge
                    });
                }
            } catch (err) {
                console.error('Error fetching participants:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchParticipants();
    }, []);

    // Use a derived list of projects for the filter dropdown
    const uniqueProjects = ['Tümü', ...Array.from(new Set(participants.map(p => p.projectName)))];

    const filteredParticipants = participants.filter(p => {
        const matchesProject = projectFilter === 'Tümü' || p.projectName === projectFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            p.first_name.toLowerCase().includes(searchLower) ||
            p.last_name.toLowerCase().includes(searchLower) ||
            p.email.toLowerCase().includes(searchLower) ||
            p.country.toLowerCase().includes(searchLower);

        return matchesProject && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Onaylandı': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Beklemede': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Reddedildi': return 'bg-red-50 text-red-700 border-red-200';
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
                                    <UsersRound className="text-blue-600 w-6 h-6" />
                                    Katılımcı Yönetimi
                                </h2>
                                <p className="text-gray-500 mt-1">Eğitim ve faaliyetlere katılan kişilerin kayıtlarını ve demografik verilerini yönetin.</p>
                            </div>
                            <Link
                                href="/participants/new"
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                            >
                                <Plus size={20} />
                                <span>Yeni Katılımcı</span>
                            </Link>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
                                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><UsersRound className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Toplam Katılımcı</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
                                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg"><Globe2 className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Farklı Ülke</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.countries}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
                                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Yaş Ortalaması</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.avgAge > 0 ? stats.avgAge : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="İsim, e-posta veya ülke ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={projectFilter}
                                    onChange={(e) => setProjectFilter(e.target.value)}
                                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                >
                                    {uniqueProjects.map(proj => (
                                        <option key={proj} value={proj}>{proj === 'Tümü' ? 'Tüm Projeler' : proj}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Katılımcı listesi yükleniyor...</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">İletişim & Lokasyon</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proje / Faaliyet</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredParticipants.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                                                {p.first_name.charAt(0)}{p.last_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-gray-900">{p.first_name} {p.last_name}</h3>
                                                                <p className="text-xs text-gray-500 mt-0.5">{p.gender} • D.Yılı: {p.birth_year}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                                {p.email}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Globe2 className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                                {p.country}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-semibold text-gray-800 line-clamp-1 border-b border-gray-100 pb-1">{p.projectName}</span>
                                                            <span className="text-sm text-gray-500 line-clamp-1">{p.activityName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-500">
                                                            {format(parseISO(p.created_at || new Date().toISOString()), 'dd MMM yyyy', { locale: tr })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(p.status)}`}>
                                                            {p.status === 'Onaylandı' ? <UserCheck className="w-3 h-3 mr-1" /> : null}
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredParticipants.length === 0 && (
                                        <div className="py-16 flex flex-col items-center justify-center bg-gray-50/30">
                                            <UsersRound className="w-12 h-12 text-gray-300 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900">Kayıt bulunamadı</h3>
                                            <p className="text-gray-500 mt-1">Belirlediğiniz kriterlere uygun katılımcı yok.</p>
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
