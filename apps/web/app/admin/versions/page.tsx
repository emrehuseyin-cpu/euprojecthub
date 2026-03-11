'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { GitBranch, Plus, X, Loader2, Trash2, PlusCircle } from 'lucide-react';

const VERSION_TYPES = ['major', 'minor', 'patch', 'beta'];
const CHANGE_TYPES = ['feat', 'fix', 'improve', 'break', 'security', 'docs'];

const TYPE_STYLES: Record<string, string> = {
    major: 'bg-red-500/15 text-red-400 border-red-500/20',
    minor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    patch: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    beta: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

const CHANGE_STYLES: Record<string, string> = {
    feat: 'text-blue-400', fix: 'text-red-400', improve: 'text-emerald-400',
    break: 'text-orange-400', security: 'text-purple-400', docs: 'text-slate-400',
};

type Version = { id: string; version: string; title: string | null; type: string; changes: any[]; published_at: string };
type Change = { type: string; desc: string };

export default function AdminVersionsPage() {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ version: '', title: '', type: 'patch' });
    const [changes, setChanges] = useState<Change[]>([{ type: 'feat', desc: '' }]);
    const [saving, setSaving] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
        const { data } = await supabase.from('versions').select('*').order('published_at', { ascending: false });
        if (data) setVersions(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const addChange = () => setChanges(prev => [...prev, { type: 'feat', desc: '' }]);
    const removeChange = (i: number) => setChanges(prev => prev.filter((_, idx) => idx !== i));
    const updateChange = (i: number, field: keyof Change, value: string) =>
        setChanges(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

    const publish = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await supabase.from('versions').insert({
            version: form.version,
            title: form.title,
            type: form.type,
            changes: changes.filter(c => c.desc.trim()),
        });
        setSaving(false);
        setShowForm(false);
        setForm({ version: '', title: '', type: 'patch' });
        setChanges([{ type: 'feat', desc: '' }]);
        load();
    };

    const deleteVersion = async (id: string) => {
        await supabase.from('versions').delete().eq('id', id);
        setVersions(prev => prev.filter(v => v.id !== id));
    };

    return (
        <div className="space-y-5 max-w-3xl">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <GitBranch size={16} className="text-indigo-400" /> Versions ({versions.length})
                </h2>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                    <Plus size={14} /> New Version
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-400" /></div>
            ) : (
                <div className="space-y-3">
                    {versions.map(v => (
                        <div key={v.id} className="bg-white/5 border border-white/[0.07] rounded-xl p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 mb-3">
                                    <code className="text-lg font-black text-white">v{v.version}</code>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${TYPE_STYLES[v.type]}`}>{v.type}</span>
                                    {v.title && <span className="text-sm text-slate-400">{v.title}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{new Date(v.published_at).toLocaleDateString()}</span>
                                    <button onClick={() => deleteVersion(v.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            {Array.isArray(v.changes) && v.changes.length > 0 && (
                                <ul className="space-y-1">
                                    {v.changes.map((c: Change, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className={`text-[10px] font-black uppercase mt-0.5 flex-shrink-0 ${CHANGE_STYLES[c.type] || 'text-slate-400'}`}>{c.type}</span>
                                            <span className="text-slate-300">{c.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                    {versions.length === 0 && (
                        <div className="text-center py-16 bg-white/5 border border-white/[0.07] rounded-xl">
                            <GitBranch size={32} className="text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No versions published yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* New Version Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-white text-lg">Publish New Version</h3>
                            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={16} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={publish} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">Version Number</label>
                                    <input value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
                                        required placeholder="1.2.0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">Type</label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {VERSION_TYPES.map(t => (
                                            <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all capitalize ${form.type === t ? TYPE_STYLES[t] : 'border-white/10 text-slate-600'}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">Title</label>
                                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Milestone release, bug fixes..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] text-slate-500 uppercase font-bold">Changes</label>
                                    <button type="button" onClick={addChange} className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"><PlusCircle size={11} /> Add</button>
                                </div>
                                <div className="space-y-2">
                                    {changes.map((c, i) => (
                                        <div key={i} className="flex gap-2">
                                            <select value={c.type} onChange={e => updateChange(i, 'type', e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 w-20">
                                                {CHANGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <input value={c.desc} onChange={e => updateChange(i, 'desc', e.target.value)}
                                                placeholder="Describe the change..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
                                            {changes.length > 1 && (
                                                <button type="button" onClick={() => removeChange(i)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={saving}
                                className="w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <><GitBranch size={14} /> Publish Version</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
