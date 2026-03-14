"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Building, Plus, Globe, Search, Filter, Loader2, MapPin, Mail, Hash, ExternalLink, Trash2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../lib/AuthContext';

type Organisation = {
    id: string;
    oid: string | null;
    legal_name: string;
    country: string | null;
    city: string | null;
    type: string | null;
    email: string | null;
    website: string | null;
    created_at: string;
};

export default function OrganisationRegistryPage() {
    const [orgs, setOrgs] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { role } = useAuth();
    // Use the standard supabase client as in other functional components

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
        o.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from the registry?`)) return;
        
        const { error } = await supabase.from('org_registry').delete().eq('id', id);
        if (!error) {
            setOrgs(prev => prev.filter(o => o.id !== id));
        }
    };

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Building className="text-amber-500" size={24} />
                                    </div>
                                    Organisation Registry
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Manage and track your partner network for EU proposals.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/organisations/new"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                                    <Plus size={16} /> New Organisation
                                </Link>
                            </div>
                        </div>

                        {/* Search & Statistics */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-3 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search by name, OID, or country..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center justify-center gap-4 shadow-sm">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
                                    <p className="text-xl font-black text-gray-900">{orgs.length}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-100" />
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filtered</p>
                                    <p className="text-xl font-black text-amber-500">{filteredOrgs.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* List / Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="animate-spin text-amber-500" size={40} />
                                <p className="text-sm font-medium text-gray-400">Loading registry...</p>
                            </div>
                        ) : filteredOrgs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOrgs.map(org => (
                                    <div key={org.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                                    {org.legal_name[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {org.oid && (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100/50">
                                                            <Hash size={10} /> {org.oid}
                                                        </span>
                                                    )}
                                                    {org.type && (
                                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold border border-gray-100">
                                                            {org.type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors">
                                                {org.legal_name}
                                            </h3>

                                            <div className="space-y-2.5 mb-6">
                                                {(org.city || org.country) && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                        <MapPin size={14} className="text-gray-300" />
                                                        {org.city}{org.city && org.country ? ', ' : ''}{org.country}
                                                    </div>
                                                )}
                                                {org.email && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                        <Mail size={14} className="text-gray-300" />
                                                        {org.email}
                                                    </div>
                                                )}
                                                {org.website && (
                                                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-amber-600 font-bold hover:underline">
                                                        <Globe size={14} /> Website <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 border-t border-gray-50 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/organisations/${org.id}`} className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold text-center hover:bg-gray-50 transition-colors">
                                                View Details
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(org.id, org.legal_name)}
                                                className="w-10 h-10 flex items-center justify-center text-red-400 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 py-32 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
                                    <Building size={40} className="text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Registry is empty</h3>
                                <p className="text-gray-400 text-sm max-w-sm mb-8">Start building your partner database by adding your first organisation manually or via OID lookup.</p>
                                <Link href="/organisations/new" className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-gray-900/10 active:scale-95 transition-all">
                                    + Add Organisation
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
