"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Building2, Plus, Globe, Users, FolderKanban, Loader2 } from 'lucide-react';

type Org = {
    id: string;
    name: string;
    slug: string;
    country: string | null;
    website: string | null;
    created_at: string;
    member_count?: number;
    project_count?: number;
};

export default function OrganizationsPage() {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
            if (data) setOrgs(data);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="text-indigo-500" size={24} />
                                    Organizations
                                </h2>
                                <p className="text-gray-500 text-sm mt-0.5">{orgs.length} organizations on EUProjectHub</p>
                            </div>
                            <Link href="/organizations/new"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                <Plus size={15} /> New Organization
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-500" size={28} /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {orgs.map(org => (
                                    <div key={org.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm"
                                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                                {org.name[0]?.toUpperCase()}
                                            </div>
                                            {org.country && (
                                                <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg border border-gray-200">{org.country}</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-0.5">{org.name}</h3>
                                        <p className="text-xs text-gray-400 mb-4">/{org.slug}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                                            <span className="flex items-center gap-1"><Users size={12} /> {org.member_count ?? '—'} members</span>
                                            <span className="flex items-center gap-1"><FolderKanban size={12} /> {org.project_count ?? '—'} projects</span>
                                            {org.website && (
                                                <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 ml-auto">
                                                    <Globe size={12} /> Website
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {orgs.length === 0 && (
                                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                                        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-400">No organizations yet</p>
                                        <Link href="/organizations/new" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">Create the first one →</Link>
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
