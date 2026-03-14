'use client';

import { useEffect, useState } from 'react';
import { getErasmusCalls, EUCall } from '@euprojecthub/core';
import { Globe, Clock, ArrowRight, Loader2, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function EUCallsWidget() {
    const [calls, setCalls] = useState<EUCall[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getErasmusCalls({ status: 'open', pageSize: 5 });
                setCalls(data.calls.slice(0, 4));
            } catch (error) {
                console.error('Failed to load dashboard EU calls:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-50 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Globe className="text-blue-600" size={20} />
                        Open EU Calls
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Live from EU Portal</p>
                </div>
                <Link 
                    href="/eu-calls" 
                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                    <ArrowRight size={18} />
                </Link>
            </div>

            <div className="space-y-3">
                {calls.map((call, i) => {
                    const daysLeft = call.deadline
                        ? Math.ceil((new Date(call.deadline).getTime() - Date.now()) / 86400000)
                        : null;
                    
                    return (
                        <div 
                            key={i} 
                            className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-blue-600/5 border border-transparent hover:border-blue-100 transition-all group/item"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-mono text-gray-300 group-hover/item:text-blue-400 transition-colors uppercase tracking-tighter">
                                        {call.identifier}
                                    </span>
                                </div>
                                <h4 className="text-xs font-black text-gray-700 truncate group-hover/item:text-gray-900">
                                    {call.title}
                                </h4>
                            </div>
                            
                            {daysLeft !== null && daysLeft > 0 ? (
                                <div className={`flex items-center gap-1.5 ml-4 px-2 py-1 rounded-lg ${daysLeft <= 30 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} font-black text-[10px]`}>
                                    <Clock size={12} />
                                    {daysLeft}d
                                </div>
                            ) : (
                                <Link 
                                    href={`/proposals/new?call=${encodeURIComponent(call.identifier)}&title=${encodeURIComponent(call.title)}`}
                                    className="ml-4 p-2 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20 opacity-0 group-hover/item:opacity-100 transition-all scale-90 group-hover/item:scale-100"
                                >
                                    <Rocket size={14} />
                                </Link>
                            )}
                        </div>
                    );
                })}
                
                {calls.length === 0 && (
                    <div className="text-center py-6">
                        <p className="text-gray-400 text-xs font-bold italic">No open calls found at the moment.</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50">
                <Link 
                    href="/eu-calls"
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                    Browse all live opportunities <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}
