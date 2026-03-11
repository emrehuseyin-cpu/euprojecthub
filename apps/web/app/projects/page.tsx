"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FolderKanban,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    Wallet,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/i18n';

export default function ProjectsPage() {
    const { t } = useLanguage();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchProjects() {
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching projects:', error);
                } else if (data) {
                    const formatted = data.map(p => ({
                        id: p.id,
                        name: p.name,
                        program: p.program,
                        type: p.program,
                        startDate: new Date(p.start_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
                        endDate: new Date(p.end_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
                        budget: `€${Number(p.budget).toLocaleString()}`,
                        status: p.status,
                        progress: 0,
                        partners: 0,
                        description: p.description
                    }));
                    setProjects(formatted);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(project => {
        const matchesFilter = filter === 'Tümü' || project.status === filter;
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.program.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aktif': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'İnceleniyor': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Tamamlandı': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Aktif': return <Clock className="w-3.5 h-3.5 mr-1" />;
            case 'İnceleniyor': return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
            case 'Tamamlandı': return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
            default: return null;
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
                                    <FolderKanban className="text-blue-600 w-6 h-6" />
                                    {t('proj_title')}
                                </h2>
                                <p className="text-gray-500 mt-1">{t('proj_subtitle')}</p>
                            </div>
                            <Link
                                href="/projects/new"
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                            >
                                <Plus size={20} />
                                <span>{t('proj_new')}</span>
                            </Link>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                                {[t('proj_filter_all'), 'Aktif', 'İnceleniyor', 'Tamamlandı'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === tab
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
                                        placeholder={t('proj_search')}
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

                        {/* Project Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Projeler yükleniyor...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <Link href={`/projects/${project.id}`} key={project.id} className="group block h-full">
                                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col h-full overflow-hidden relative">
                                            {/* Top Accent Line */}
                                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                                        {project.type}
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                                        {getStatusIcon(project.status)}
                                                        {project.status}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                                                    {project.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-6 font-medium">
                                                    {project.program}
                                                </p>

                                                <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-1">
                                                    {project.description}
                                                </p>

                                                <div className="space-y-4 mt-auto">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                                            <span className="truncate">{project.startDate}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Wallet className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                                            <span className="font-semibold text-gray-900">{project.budget}</span>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="pt-4 border-t border-gray-100">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-medium text-gray-500">{t('proj_progress')}</span>
                                                            <span className="text-xs font-bold text-gray-900">{project.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${project.status === 'Tamamlandı' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                                                style={{ width: `${project.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {filteredProjects.length === 0 && (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-xl">
                                        <FolderKanban className="w-12 h-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">{t('proj_not_found')}</h3>
                                        <p className="text-gray-500 mt-1">{t('proj_not_found_sub')}</p>
                                        <button
                                            onClick={() => { setFilter('Tümü'); setSearchQuery(''); }}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            {t('proj_clear_filters')}
                                        </button>
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
