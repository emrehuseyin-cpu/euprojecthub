"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ROLE_COLORS, ROLE_LABELS } from '../lib/permissions';
import { Users, Plus, Mail, X, Loader2, ChevronDown } from 'lucide-react';

type OrgUser = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    created_at: string;
    user_email?: string;
};

export default function UsersPage() {
    const { profile } = useAuth();
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviting, setInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createSupabaseBrowserClient();

    const fetchUsers = async () => {
        if (!profile?.organization_id) return;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, [profile]);

    const sendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInviting(true);
        try {
            const { error } = await supabase.from('invitations').insert({
                organization_id: profile?.organization_id,
                email: inviteEmail,
                role: inviteRole,
            });
            if (error) throw error;
            setInviteSuccess(true);
            setInviteEmail('');
            setTimeout(() => { setShowInviteModal(false); setInviteSuccess(false); }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setInviting(false);
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="text-indigo-500" size={24} />
                                    Team Members
                                </h2>
                                <p className="text-gray-500 text-sm mt-0.5">{profile?.organization?.name || 'Your Organization'} · {users.length} members</p>
                            </div>
                            <button onClick={() => setShowInviteModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                <Plus size={15} /> Invite User
                            </button>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-500" size={28} /></div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left font-semibold">Member</th>
                                            <th className="px-5 py-3 text-left font-semibold">Role</th>
                                            <th className="px-5 py-3 text-left font-semibold">Joined</th>
                                            <th className="px-5 py-3 text-left font-semibold">Change Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((u, idx) => (
                                            <tr key={u.id} className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                            style={{ background: `hsl(${((u.first_name || '').charCodeAt(0) || 65) * 11 % 360}, 65%, 60%)` }}>
                                                            {u.first_name?.[0]}{u.last_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{u.first_name} {u.last_name}</p>
                                                            <p className="text-xs text-gray-400">{u.id.slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[u.role] || ROLE_COLORS.member}`}>
                                                        {ROLE_LABELS[u.role] || u.role}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-400 text-xs">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={u.role}
                                                            onChange={e => updateRole(u.id, e.target.value)}
                                                            className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                                                        >
                                                            <option value="participant">Participant</option>
                                                            <option value="member">Member</option>
                                                            <option value="org_admin">Org Admin</option>
                                                            <option value="super_admin">Super Admin</option>
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Mail size={18} className="text-indigo-500" /> Invite Team Member</h3>
                            <button onClick={() => { setShowInviteModal(false); setInviteSuccess(false); setError(null); }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
                        </div>
                        {inviteSuccess ? (
                            <div className="text-center py-6">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Mail size={24} className="text-emerald-600" />
                                </div>
                                <p className="font-bold text-gray-900">Invitation sent!</p>
                                <p className="text-sm text-gray-500 mt-1">They'll receive a sign-up link.</p>
                            </div>
                        ) : (
                            <form onSubmit={sendInvite} className="space-y-4">
                                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">{error}</div>}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required
                                        placeholder="colleague@organization.eu"
                                        className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Role</label>
                                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                        <option value="participant">Participant</option>
                                        <option value="member">Member</option>
                                        <option value="org_admin">Org Admin</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={inviting}
                                    className="w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                    {inviting ? <Loader2 size={15} className="animate-spin" /> : <><Mail size={15} /> Send Invitation</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
