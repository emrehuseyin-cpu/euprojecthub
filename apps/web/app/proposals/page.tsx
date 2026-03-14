"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { 
    ScrollText, Plus, Search, Loader2, Calendar, 
    ArrowRight, CheckCircle2, Clock, FileEdit, 
    MoreVertical, Trash2, Copy, Rocket, Target, Users
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

type Proposal = {
    id: string;
    title: string;
    action_code: string;
    status: 'draft' | 'under_review' | 'submitted' | 'approved' | 'rejected';
    project_acronym: string | null;
    deadline: string | null;
    created_at: string;
    organisation_count?: number;
};

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
    under_review: { label: 'Internal Review', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: FileEdit },
    submitted: { label: 'Submitted', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: Rocket },
    approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-100', icon: Clock }
};

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const supabase = createSupabaseBrowserClient();
    const { t } = useLanguage();

    async function loadProposals() {
        setLoading(true);
        // Using a join or separate count if needed, but for now simple select
        const { data, error } = await supabase
            .from('proposals')
            .select(`
                *,
                organisation_count:proposal_organisations(count)
            `)
            .order('created_at', { ascending: false });
        
        if (data) {
            setProposals(data.map(d => ({
                ...d,
                organisation_count: d.organisation_count?.[0]?.count || 0
            })));
        }
        setLoading(false);
    }

    useEffect(() => {
        loadProposals();
    }, []);

    const filtered = proposals.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.project_acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.action_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete the proposal "${title}"?`)) return;
        
        const { error } = await supabase.from('proposals').delete().eq('id', id);
        if (!error) {
            setProposals(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <ScrollText className="text-blue-500" size={24} />
                                    </div>
                                    Proposal Hub
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Draft, collaborate and manage your Erasmus+ grant applications.</p>
                            </div>
                            <Link href="/proposals/new"
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                <Plus size={18} /> Create New Proposal
                            </Link>
                        </div>

                        {/* Search & Filters */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-3 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search by title, acronym, or action code..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</p>
                                    <p className="text-lg font-black text-gray-900">{proposals.length}</p>
                                </div>
                                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deadlines</p>
                                    <p className="text-lg font-black text-blue-500">{proposals.filter(p => p.deadline).length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Proposals List */}
                        {loading ? (
                            <div className="py-32 flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                                    <ScrollText className="absolute inset-0 m-auto text-blue-500" size={24} />
                                </div>
                                <p className="text-sm font-bold text-gray-400">Loading your proposal vault...</p>
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filtered.map(p => {
                                    const status = STATUS_CONFIG[p.status];
                                    const StatusIcon = status.icon;
                                    
                                    return (
                                        <div key={p.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col">
                                            {/* Card Top: Status & Date */}
                                            <div className="p-6 pb-0 flex items-center justify-between">
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${status.color}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label.toUpperCase()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                    <Calendar size={14} />
                                                    {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'No Deadline'}
                                                </div>
                                            </div>

                                            {/* Card Main */}
                                            <div className="p-6 pt-5 flex-1">
                                                <div className="mb-4">
                                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{p.action_code}</p>
                                                    <h3 className="text-lg font-black text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {p.title}
                                                    </h3>
                                                    {p.project_acronym && (
                                                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold border border-gray-100">
                                                            {p.project_acronym}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-gray-50">
                                                    <div className="flex flex-col">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Partners</p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Users size={14} className="text-gray-400" />
                                                            <span className="text-sm font-black text-gray-700">{p.organisation_count}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-100" />
                                                    <div className="flex flex-col">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Progress</p>
                                                        <div className="flex items-center gap-2 mt-1 w-24">
                                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-400">45%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer: Actions */}
                                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                <Link href={`/proposals/${p.id}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-gray-900/10 hover:bg-gray-800 transition-all">
                                                    Open Editor <ArrowRight size={14} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(p.id, p.title)}
                                                    className="w-10 h-10 flex items-center justify-center text-red-400 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 py-32 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-24 h-24 rounded-[2rem] bg-blue-50 flex items-center justify-center mb-6">
                                    <ScrollText size={48} className="text-blue-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">No proposals yet</h3>
                                <p className="text-gray-400 text-sm max-w-sm mb-10 leading-relaxed">Your journey to high-quality grant applications starts here. Use our AI-assisted tools to draft and perfect your proposals.</p>
                                <Link href="/proposals/new" className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black shadow-2xl shadow-gray-900/20 active:scale-95 transition-all">
                                    + Create First Proposal
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
