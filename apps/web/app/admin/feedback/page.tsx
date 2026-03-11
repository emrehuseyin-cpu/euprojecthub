'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { MessageSquare, Loader2, ChevronDown, Filter, Download } from 'lucide-react';

const STATUSES = ['new', 'reviewing', 'completed', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const TYPES = ['bug', 'suggestion', 'improvement', 'general'];

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    reviewing: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
};
const PRIORITY_COLORS: Record<string, string> = {
    low: 'text-slate-400', medium: 'text-blue-400', high: 'text-amber-400', critical: 'text-red-400',
};

type Feedback = {
    id: string; page: string | null; type: string | null; message: string | null;
    status: string; priority: string; admin_note: string | null; created_at: string;
};

export default function AdminFeedbackPage() {
    const [items, setItems] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selected, setSelected] = useState<Feedback | null>(null);
    const [note, setNote] = useState('');
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
        const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
        if (data) setItems(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const update = async (id: string, fields: Partial<Feedback>) => {
        await supabase.from('feedbacks').update(fields).eq('id', id);
        setItems(prev => prev.map(f => f.id === id ? { ...f, ...fields } : f));
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...fields } : null);
    };

    const exportCSV = () => {
        const rows = [['Page', 'Type', 'Message', 'Status', 'Priority', 'Date']];
        filtered.forEach(f => rows.push([f.page ?? '', f.type ?? '', (f.message ?? '').replace(/,/g, ''), f.status, f.priority, new Date(f.created_at).toLocaleDateString()]));
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'feedbacks.csv'; a.click();
    };

    const filtered = items.filter(f => {
        if (filterType && f.type !== filterType) return false;
        if (filterStatus && f.status !== filterStatus) return false;
        return true;
    });

    // Stats
    const statsByType = TYPES.map(t => ({ type: t, count: items.filter(f => f.type === t).length }));

    return (
        <div className="space-y-5 max-w-6xl">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <MessageSquare size={16} className="text-pink-400" /> Feedback ({items.length})
                </h2>
                <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                    <Download size={12} /> Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {statsByType.map(s => (
                    <div key={s.type} className="bg-white/5 border border-white/[0.07] rounded-xl px-4 py-3">
                        <p className="text-[11px] text-slate-500 capitalize font-bold">{s.type}</p>
                        <p className="text-2xl font-black text-slate-200">{s.count}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                    <option value="">All Types</option>
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
                <span className="text-xs text-slate-500">{filtered.length} results</span>
            </div>

            <div className="flex gap-5">
                {/* Table */}
                <div className="flex-1 bg-white/5 border border-white/[0.07] rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-pink-400" /></div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/[0.07]">
                                <tr className="text-[11px] text-slate-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Message</th>
                                    <th className="px-4 py-3 text-left">Page</th>
                                    <th className="px-4 py-3 text-left">Priority</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {filtered.map(f => (
                                    <tr key={f.id} onClick={() => { setSelected(f); setNote(f.admin_note ?? ''); }}
                                        className={`hover:bg-white/5 transition-colors cursor-pointer ${selected?.id === f.id ? 'bg-indigo-500/5' : ''}`}>
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <p className="text-slate-200 truncate text-xs font-medium">{f.message}</p>
                                            <span className={`text-[10px] font-bold capitalize ${f.type === 'bug' ? 'text-red-400' : f.type === 'suggestion' ? 'text-blue-400' : 'text-slate-500'}`}>{f.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{f.page ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLORS[f.priority]}`}>{f.priority}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select value={f.status} onChange={e => { e.stopPropagation(); update(f.id, { status: e.target.value }); }}
                                                onClick={e => e.stopPropagation()}
                                                className={`appearance-none text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer bg-transparent focus:outline-none ${STATUS_COLORS[f.status]}`}>
                                                {STATUSES.map(s => <option key={s} value={s} className="capitalize bg-slate-900">{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div className="w-72 bg-white/5 border border-white/[0.07] rounded-xl p-4 space-y-3 flex-shrink-0 h-fit">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-200">Detail</h4>
                            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xs">Close</button>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 font-semibold">Message</p>
                            <p className="text-sm text-slate-200">{selected.message}</p>
                            <div className="flex gap-2">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Priority</p>
                                    <select value={selected.priority} onChange={e => update(selected.id, { priority: e.target.value })}
                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none mt-1">
                                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold mb-1.5">Admin Note</p>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
                                placeholder="Add a private note..." />
                            <button onClick={() => update(selected.id, { admin_note: note })}
                                className="mt-1.5 w-full py-1.5 rounded-lg text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                                Save Note
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
