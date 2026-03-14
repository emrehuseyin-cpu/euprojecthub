"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { 
    Building2, Plus, Globe, Search, Filter, Loader2, MapPin, 
    Mail, Hash, ExternalLink, Trash2, Award, Briefcase, 
    ChevronRight, MoreVertical, LayoutGrid, List, Check
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import OrgSearchModal from '../components/OrgSearchModal';

type Organisation = {
    id: string;
    oid: string | null;
    legal_name: string;
    country: string | null;
    city: string | null;
    type: string | null;
    email: string | null;
    website: string | null;
    pic: string | null;
    no_of_projects?: number;
    eche_accredited?: boolean;
    accreditation_status?: string;
    created_at: string;
};

export default function OrganisationRegistryPage() {
    const [orgs, setOrgs] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const { role } = useAuth();

    async function loadOrgs() {
        setLoading(true);
        const { data, error } = await supabase
            .from('org_registry')
            .select('*')
            .order('legal_name', { ascending: true });
        
        if (data) setOrgs(data);
        setLoading(false);
    }

    useEffect(() => {
        loadOrgs();
    }, []);

    const filteredOrgs = orgs.filter(o => 
        o.legal_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.oid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.pic?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: orgs.length,
        withECHE: orgs.filter(o => o.eche_accredited).length,
        withAccreditation: orgs.filter(o => o.accreditation_status).length,
        totalProjects: orgs.reduce((acc, curr) => acc + (curr.no_of_projects || 0), 0)
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from the registry?`)) return;
        
        const { error } = await supabase.from('org_registry').delete().eq('id', id);
        if (!error) {
            setOrgs(prev => prev.filter(o => o.id !== id));
        }
    };

    const handleOrgSelect = async (selectedOrg: any) => {
        // This is where we'd add to DB if needed, but for now we'll just log
        // In a real flow, this selection would likely trigger the side panel add form
        console.log('Selected from search modal:', selectedOrg);
        // For now, let's just refresh if we implemented the save in the modal
        loadOrgs();
    };

    return (
        <div className="flex h-screen font-sans overflow-hidden bg-[#F1F5F9]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                        
                        {/* Title & Actions */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Organisation Registry</h1>
                                <p className="text-slate-500 mt-1 font-medium">Manage partners and tracked institutions across the EU ecosystem.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <LayoutGrid size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <List size={20} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setIsSearchModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm"
                                >
                                    <Plus size={18} />
                                    Add Organisation
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Organisations', value: stats.total, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'ECHE Accredited', value: stats.withECHE, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Accreditations', value: stats.withAccreditation, icon: Check, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Funded Projects', value: stats.totalProjects, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search by name, OID, PIC or country..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                                <Filter size={18} /> Filters
                            </button>
                        </div>

                        {/* Display Area */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                                <p className="text-slate-400 mt-4 font-semibold tracking-wide uppercase text-xs">Accessing Registry...</p>
                            </div>
                        ) : filteredOrgs.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {filteredOrgs.map(org => (
                                        <div key={org.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                                        {org.legal_name[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        {org.oid && (
                                                            <div className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                                                                OID: {org.oid}
                                                            </div>
                                                        )}
                                                        {org.pic && (
                                                            <div className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100">
                                                                PIC: {org.pic}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-slate-900 leading-tight mb-2 min-h-[40px] line-clamp-2">
                                                    {org.legal_name}
                                                </h3>

                                                <div className="space-y-3 mt-4">
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                        <MapPin size={14} className="text-slate-300" />
                                                        {org.city}{org.city && org.country ? ', ' : ''}{org.country}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                       <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 px-2.5 py-1 bg-blue-50 rounded-lg">
                                                           <Briefcase size={12} /> {org.no_of_projects || 0} Funded Projects
                                                       </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                                <button 
                                                    onClick={() => handleDelete(org.id, org.legal_name)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    {org.website && (
                                                        <a href={org.website} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                                                            <Globe size={16} />
                                                        </a>
                                                    )}
                                                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold hover:shadow-md transition-all">
                                                        Details <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Organisation</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIC / OID</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Projects</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredOrgs.map(org => (
                                                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                {org.legal_name[0]?.toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-slate-910 text-sm truncate max-w-[300px]">{org.legal_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-600">{org.country}</span>
                                                            <span className="text-[10px] text-slate-400">{org.city}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                         <div className="space-y-1">
                                                            <div className="text-[10px] font-mono text-slate-500">PIC: {org.pic || '—'}</div>
                                                            <div className="text-[10px] font-mono text-slate-500">OID: {org.oid || '—'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                                                            {org.no_of_projects || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                                                                <ExternalLink size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(org.id, org.legal_name)}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                                    <Building2 size={48} className="text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No organisations found</h3>
                                <p className="text-slate-400 text-sm max-w-sm mb-10 font-medium">Start building your partner network by searching the official EC database or adding manually.</p>
                                <button 
                                    onClick={() => setIsSearchModalOpen(true)}
                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm"
                                >
                                    Search Database & Add
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <OrgSearchModal 
                open={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSelect={handleOrgSelect}
            />
        </div>
    );
}
