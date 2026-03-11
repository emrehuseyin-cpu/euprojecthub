"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', password: '', confirm: '' });

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function loadInvitation() {
            const { data, error } = await supabase
                .from('invitations')
                .select('*, organization:organizations(name)')
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (error || !data) {
                setError('This invitation link is invalid or has expired.');
            } else if (new Date(data.expires_at) < new Date()) {
                setError('This invitation link has expired.');
            } else {
                setInvitation(data);
            }
            setLoading(false);
        }
        loadInvitation();
    }, [token]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setError(null);
        setSubmitting(true);

        try {
            // Create Supabase Auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitation.email,
                password: form.password,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
            });
            if (authError) throw authError;

            const userId = authData.user?.id;
            if (!userId) throw new Error('User creation failed');

            // Insert profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: userId,
                organization_id: invitation.organization_id,
                role: invitation.role,
                first_name: form.firstName,
                last_name: form.lastName,
            });
            if (profileError) throw profileError;

            // Mark invitation as accepted
            await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id);

            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    if (error && !invitation) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f172a' }}>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
                <AlertCircle className="text-red-400 mx-auto mb-4" size={40} />
                <h2 className="text-white font-bold text-xl mb-2">Invalid Invitation</h2>
                <p className="text-slate-400 text-sm">{error}</p>
                <a href="/login" className="mt-5 inline-block text-indigo-400 text-sm font-semibold hover:text-indigo-300">
                    Go to Login →
                </a>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2a4a 50%, #1e1b4b 100%)' }}>
            <div className="w-full max-w-sm">
                <div className="text-center mb-7">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                        <span className="text-white font-black text-lg">EU</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">You're Invited!</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Join <span className="text-indigo-400 font-semibold">{invitation?.organization?.name}</span> on EUProjectHub
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 mb-5">
                        <p className="text-indigo-300 text-sm font-medium">{invitation?.email}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Role: <span className="text-slate-300 font-semibold capitalize">{invitation?.role}</span></p>
                    </div>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

                    <form onSubmit={handleRegister} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">First Name</label>
                                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                    required placeholder="John"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Last Name</label>
                                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                    required placeholder="Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required placeholder="Min. 6 characters"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm Password</label>
                            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                                required placeholder="Repeat password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>
                        <button type="submit" disabled={submitting}
                            className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Create Account & Join</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
