"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Globe,
    Mail,
    Phone,
    Building,
    FolderKanban,
    Loader2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';

export default function PartnersPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchPartners() {
            try {
                const { data, error } = await supabase
                    .from('partners')
                    .select(`
            *,
            project:projects(name)
          `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching partners:', error);
                } else if (data) {
                    setPartners(data.map(p => ({
                        ...p,
                        projectName: p.project ? p.project.name : 'Bağımsız'
                    })));
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPartners();
    }, []);

    const types = ['Tümü', 'STK', 'Üniversite', 'Kamu', 'Özel'];

    const filteredPartners = partners.filter(partner => {
        const matchesFilter = filterType === 'Tümü' || partner.type === filterType;
        const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.country.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'STK': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Üniversite': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Kamu': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Özel': return 'bg-amber-50 text-amber-700 border-amber-200';
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
                                    <Users className="text-blue-600 w-6 h-6" />
                                    Ortaklar
                                </h2>
                                <p className="text-gray-500 mt-1">Konsorsiyum üyelerinizi ve paydaşlarınızı yönetin.</p>
                            </div>
                            <Link
                                href="/partners/new"
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                            >
                                <Plus size={20} />
                                <span>Yeni Ortak Ekle</span>
                            </Link>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                                {types.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilterType(tab)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === tab
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Kurum veya ülke ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <button className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Partners Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Ortaklar yükleniyor...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredPartners.map((partner) => (
                                    <div key={partner.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col h-full relative p-6">
                                        <div className="absolute top-6 right-6">
                                            <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded-md transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg shadow-sm">
                                                {partner.country}
                                            </div>
                                            <div className="flex-1 pr-6">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mb-1.5 ${getTypeColor(partner.type)}`}>
                                                    {partner.type}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                    {partner.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6 mt-2">
                                            <div className="flex items-start text-sm text-gray-600 gap-2.5">
                                                <FolderKanban className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                <span className="line-clamp-1 flex-1 font-medium text-gray-900" title="Bağlı Proje">
                                                    {partner.projectName}
                                                </span>
                                            </div>

                                            {partner.email && (
                                                <div className="flex items-center text-sm text-gray-600 gap-2.5">
                                                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span className="truncate">{partner.email}</span>
                                                </div>
                                            )}

                                            {partner.phone && (
                                                <div className="flex items-center text-sm text-gray-600 gap-2.5">
                                                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span>{partner.phone}</span>
                                                </div>
                                            )}

                                            {partner.website && (
                                                <div className="flex items-center text-sm text-gray-600 gap-2.5">
                                                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <a href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                                        {partner.website.replace(/^https?:\/\//, '')}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {filteredPartners.length === 0 && (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-xl">
                                        <Building className="w-12 h-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">Ortak bulunamadı</h3>
                                        <p className="text-gray-500 mt-1">Arama veya filtreleme kriterlerinize uygun kayıt yok.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
