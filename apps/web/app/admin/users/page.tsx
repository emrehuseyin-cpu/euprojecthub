'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { ROLE_COLORS, ROLE_LABELS } from '../../lib/permissions';
import { Users, Search, Mail, Loader2, ChevronDown, X, Plus, RefreshCw, Clock } from 'lucide-react';

type Profile = {
    id: string; first_name: string | null; last_name: string | null; role: string;
    created_at: string; organization_id: string | null;
    organization?: { name: string } | null;
};

type Invitation = {
    id: string; email: string; role: string; status: string; expires_at: string;
    organization?: { name: string } | null;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [invites, setInvites] = useState<Invitation[]>([]);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({ emails: '', orgId: '', role: 'member' });
    const [inviting, setInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
        const [uRes, iRes, oRes] = await Promise.all([
            supabase.from('profiles').select('*, organization:organizations(name)').order('created_at', { ascending: false }),
            supabase.from('invitations').select('*, organization:organizations(name)').order('created_at', { ascending: false }),
            supabase.from('organizations').select('id, name').order('name'),
        ]);
        if (uRes.data) setUsers(uRes.data);
        if (iRes.data) setInvites(iRes.data);
        if (oRes.data) setOrgs(oRes.data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const updateRole = async (id: string, role: string) => {
        await supabase.from('profiles').update({ role }).eq('id', id);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    };

    const resendInvite = async (invite: Invitation) => {
        await supabase.from('invitations').update({ status: 'pending', expires_at: new Date(Date.now() + 7 * 86400000).toISOString() }).eq('id', invite.id);
        load();
    };

    const cancelInvite = async (id: string) => {
        await supabase.from('invitations').delete().eq('id', id);
        setInvites(prev => prev.filter(i => i.id !== id));
    };

    const sendInvites = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        const emails = inviteForm.emails.split(',').map(e => e.trim()).filter(Boolean);
        for (const email of emails) {
            await supabase.from('invitations').insert({ organization_id: inviteForm.orgId || null, email, role: inviteForm.role });
        }
        setInviting(false);
        setInviteSuccess(true);
        setTimeout(() => { setShowInviteModal(false); setInviteSuccess(false); setInviteForm({ emails: '', orgId: '', role: 'member' }); load(); }, 2000);
    };

    const filtered = users.filter(u => {
        const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase();
        const matchSearch = !search || fullName.includes(search.toLowerCase());
        const matchRole = !filterRole || u.role === filterRole;
        return matchSearch && matchRole;
    });

    return (
        <div className="space-y-5 max-w-6xl">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Users size={16} className="text-indigo-400" /> All Users ({users.length})
                </h2>
                <button onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                    <Plus size={14} /> Invite Users
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                        className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/[0.07] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    className="bg-white/5 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <option value="">All Roles</option>
                    {Object.keys(ROLE_LABELS).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 border border-white/[0.07] rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-400" /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/[0.07]">
                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider">
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Org</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Joined</th>
                                <th className="px-4 py-3 text-left">Change Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                                                style={{ background: `hsl(${((u.first_name || '').charCodeAt(0) || 65) * 11 % 360}, 60%, 50%)` }}>
                                                {u.first_name?.[0]}{u.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-200">{u.first_name} {u.last_name}</p>
                                                <p className="text-[11px] text-slate-500">{u.id.slice(0, 12)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{u.organization?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_COLORS[u.role] || ROLE_COLORS.member}`}>
                                            {ROLE_LABELS[u.role] || u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="relative">
                                            <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                                                className="appearance-none pl-2 pr-6 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer">
                                                {Object.keys(ROLE_LABELS).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                            </select>
                                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pending Invitations */}
            {invites.filter(i => i.status === 'pending').length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                        <Clock size={14} className="text-amber-400" /> Pending Invitations ({invites.filter(i => i.status === 'pending').length})
                    </h3>
                    <div className="bg-white/5 border border-white/[0.07] rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/[0.07]">
                                <tr className="text-[11px] text-slate-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Org</th>
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-left">Expires</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {invites.filter(i => i.status === 'pending').map(inv => (
                                    <tr key={inv.id} className="hover:bg-white/5">
                                        <td className="px-4 py-3 text-slate-300 text-xs font-medium">{inv.email}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{inv.organization?.name ?? '—'}</td>
                                        <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[inv.role] || ROLE_COLORS.member}`}>{ROLE_LABELS[inv.role] || inv.role}</span></td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{new Date(inv.expires_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                            <button onClick={() => resendInvite(inv)} className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors" title="Resend"><RefreshCw size={12} /></button>
                                            <button onClick={() => cancelInvite(inv.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Cancel"><X size={12} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2"><Mail size={16} className="text-indigo-400" /> Invite Users</h3>
                            <button onClick={() => setShowInviteModal(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={16} className="text-slate-400" /></button>
                        </div>
                        {inviteSuccess ? (
                            <div className="text-center py-8">
                                <Mail size={32} className="text-emerald-400 mx-auto mb-3" />
                                <p className="text-white font-bold">Invitations sent!</p>
                            </div>
                        ) : (
                            <form onSubmit={sendInvites} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] text-slate-500 mb-1.5 uppercase font-bold">Email(s) — separate with commas</label>
                                    <textarea value={inviteForm.emails} onChange={e => setInviteForm(f => ({ ...f, emails: e.target.value }))}
                                        required placeholder="user1@org.eu, user2@org.eu" rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-500 mb-1.5 uppercase font-bold">Organization</label>
                                    <select value={inviteForm.orgId} onChange={e => setInviteForm(f => ({ ...f, orgId: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        <option value="">No organization</option>
                                        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-500 mb-1.5 uppercase font-bold">Role</label>
                                    <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        {Object.entries(ROLE_LABELS).map(([k, v]) => k !== 'super_admin' && <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={inviting}
                                    className="w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                    {inviting ? <Loader2 size={15} className="animate-spin" /> : <><Mail size={15} /> Send Invitations</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
