'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { Building2, Plus, Pencil, Trash2, X, Loader2, Users, FolderKanban, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

type Org = {
    id: string; name: string; slug: string; country: string | null;
    website: string | null; created_at: string; is_active?: boolean;
};

const PLANS = ['Starter', 'Pro', 'Enterprise'];
const COUNTRIES = ['TR', 'DE', 'FR', 'ES', 'IT', 'PL', 'NL', 'BE', 'AT', 'CZ', 'HU', 'RO', 'GR'];

export default function AdminOrgsPage() {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editOrg, setEditOrg] = useState<Org | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', country: '', website: '', adminEmail: '', plan: 'Starter' });
    const [saving, setSaving] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
        const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
        if (data) setOrgs(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openNew = () => { setEditOrg(null); setForm({ name: '', slug: '', country: '', website: '', adminEmail: '', plan: 'Starter' }); setShowModal(true); };
    const openEdit = (org: Org) => { setEditOrg(org); setForm({ name: org.name, slug: org.slug, country: org.country ?? '', website: org.website ?? '', adminEmail: '', plan: 'Starter' }); setShowModal(true); };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        if (editOrg) {
            await supabase.from('organizations').update({ name: form.name, slug: form.slug, country: form.country, website: form.website }).eq('id', editOrg.id);
        } else {
            const { data } = await supabase.from('organizations').insert({ name: form.name, slug: form.slug, country: form.country, website: form.website }).select().single();
            if (data && form.adminEmail) {
                await supabase.from('invitations').insert({ organization_id: data.id, email: form.adminEmail, role: 'org_admin' });
            }
        }
        setSaving(false);
        setShowModal(false);
        load();
    };

    const deleteOrg = async (id: string) => {
        setDeleting(id);
        await supabase.from('organizations').delete().eq('id', id);
        setOrgs(prev => prev.filter(o => o.id !== id));
        setDeleting(null);
        setConfirmDelete(null);
    };

    return (
        <div className="space-y-5 max-w-6xl">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Building2 size={16} className="text-indigo-400" /> Organizations ({orgs.length})
                </h2>
                <button onClick={openNew}
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                    <Plus size={14} /> New Organization
                </button>
            </div>

            <div className="bg-white/5 border border-white/[0.07] rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-400" /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/[0.07]">
                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider">
                                <th className="px-4 py-3 text-left">Organization</th>
                                <th className="px-4 py-3 text-left">Country</th>
                                <th className="px-4 py-3 text-left">Website</th>
                                <th className="px-4 py-3 text-left">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {orgs.map(org => (
                                <tr key={org.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
                                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                                {org.name[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">{org.name}</p>
                                                <p className="text-[11px] text-slate-500">/{org.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs font-bold">{org.country ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {org.website ? (
                                            <a href={org.website} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs">
                                                <Globe size={11} /> Visit
                                            </a>
                                        ) : <span className="text-slate-600 text-xs">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(org.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(org)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-slate-200">
                                                <Pencil size={13} />
                                            </button>
                                            <button onClick={() => setConfirmDelete(org.id)}
                                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                                                {deleting === org.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-white text-lg">{editOrg ? 'Edit Organization' : 'New Organization'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={16} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={save} className="space-y-3">
                            {[
                                { label: 'Name', key: 'name', placeholder: 'Acme NGO' },
                                { label: 'Slug', key: 'slug', placeholder: 'acme-ngo' },
                                { label: 'Website', key: 'website', placeholder: 'https://acme.org' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">{f.label}</label>
                                    <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder} required={f.key !== 'website'}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">Country</label>
                                <select value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {!editOrg && (
                                <>
                                    <div>
                                        <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">Admin Email</label>
                                        <input type="email" value={form.adminEmail} onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))}
                                            placeholder="admin@org.eu"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">Plan</label>
                                        <div className="flex gap-2">
                                            {PLANS.map(p => (
                                                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, plan: p }))}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.plan === p ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            <button type="submit" disabled={saving}
                                className="w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                {saving ? <Loader2 size={15} className="animate-spin" /> : (editOrg ? 'Save Changes' : 'Create Organization')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6 max-w-sm w-full text-center">
                        <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
                        <h3 className="font-bold text-white mb-1">Delete Organization?</h3>
                        <p className="text-slate-400 text-sm mb-5">This cannot be undone. All associated data will be removed.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 text-sm font-semibold hover:bg-white/5">Cancel</button>
                            <button onClick={() => deleteOrg(confirmDelete)} className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30">
                                {deleting ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
