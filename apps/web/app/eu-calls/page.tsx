'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { 
    Globe, Search, Loader2, Calendar, 
    ArrowRight, Bell, Info, Filter,
    ExternalLink, Sparkles, Plus, Clock, Rocket
} from 'lucide-react';
import { getErasmusCalls, getErasmusUpdates, EUCall } from '@euprojecthub/core';
import Link from 'next/link';

export default function EUCallsPage() {
    const [calls, setCalls] = useState<EUCall[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'forthcoming'>('all');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [callsData, updatesData] = await Promise.all([
                    getErasmusCalls({ status: filter, pageSize: 30 }),
                    getErasmusUpdates(5),
                ]);
                setCalls(callsData.calls);
                setTotal(callsData.total);
                setUpdates(updatesData);
            } catch (error) {
                console.error('Failed to load EU calls:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [filter]);

    const STATUS_COLORS: Record<string, string> = {
        Open: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        Forthcoming: 'bg-blue-50 text-blue-600 border-blue-100',
        Closed: 'bg-gray-50 text-gray-500 border-gray-100',
    };

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-12">
                    <div className="max-w-6xl mx-auto space-y-8">
                        
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                                        <Globe className="text-blue-600" size={28} />
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">EU Calls for Proposals</h1>
                                </div>
                                <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                                    Live data from EU Funding & Tenders Portal — <span className="text-blue-600 font-bold">Erasmus+ 2021-2027</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a 
                                    href="https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search" 
                                    target="_blank" 
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-black shadow-sm hover:bg-gray-50 transition-all uppercase tracking-wider"
                                >
                                    Open EU Portal <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Recent Updates Marquee-style Banner */}
                        {updates.length > 0 && (
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 lg:p-8">
                                <h4 className="flex items-center gap-2 text-amber-700 font-black text-[10px] uppercase tracking-widest mb-4">
                                    <Bell size={14} /> Recent Corrigenda & Updates
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {updates.map((u, i) => (
                                        <a 
                                            key={i} 
                                            href={u.url} 
                                            target="_blank" 
                                            className="group bg-white/60 p-4 rounded-2xl border border-amber-100/50 hover:bg-white hover:shadow-lg hover:shadow-amber-500/5 transition-all"
                                        >
                                            <p className="text-xs font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug mb-2">
                                                {u.title}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">
                                                    {u.identifier}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400">
                                                    {u.date ? new Date(u.date).toLocaleDateString('en-GB') : ''}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-3 p-1.5 bg-white/50 border border-gray-100 rounded-2xl w-fit">
                            {(['all', 'open', 'forthcoming'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        filter === f
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-gray-400 hover:text-gray-900'
                                    }`}
                                >
                                    {f === 'all' ? `All Calls (${total.toLocaleString()})` : f}
                                </button>
                            ))}
                        </div>

                        {/* Main Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-64 bg-white/50 rounded-[2.5rem] border border-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {calls.map((call, i) => {
                                    const daysLeft = call.deadline
                                        ? Math.ceil((new Date(call.deadline).getTime() - Date.now()) / 86400000)
                                        : null;
                                    
                                    return (
                                        <div key={i} className="group flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                                            <div className="p-8 flex-1">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[call.statusLabel] || STATUS_COLORS['Closed']}`}>
                                                        {call.statusLabel}
                                                    </div>
                                                    <span className="text-[10px] font-mono text-gray-300 group-hover:text-blue-500 transition-colors uppercase tracking-widest">
                                                        {call.identifier}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-black text-gray-900 leading-[1.3] mb-6 line-clamp-3 min-h-[4.3rem] group-hover:text-blue-600 transition-colors">
                                                    {call.title}
                                                </h3>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                                            <Calendar size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Deadline</p>
                                                            <p className={`text-sm font-black ${daysLeft !== null && daysLeft <= 30 && daysLeft > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                                                {call.deadline ? new Date(call.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'To be announced'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {daysLeft !== null && daysLeft > 0 && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                                                <Clock size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Time Remaining</p>
                                                                <p className={`text-sm font-black ${daysLeft <= 30 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                    {daysLeft} days left
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-50 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                                                <a 
                                                    href={call.url} 
                                                    target="_blank" 
                                                    className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 text-center hover:bg-gray-50 transition-colors uppercase tracking-widest"
                                                >
                                                    Portal ↗
                                                </a>
                                                <button 
                                                    onClick={() => {
                                                        window.location.href = `/proposals/new?call=${encodeURIComponent(call.identifier)}&title=${encodeURIComponent(call.title)}`;
                                                    }}
                                                    className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black text-center shadow-lg shadow-blue-600/20 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    <Rocket size={14} /> New Proposal
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
