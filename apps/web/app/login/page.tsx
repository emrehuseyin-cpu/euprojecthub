"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { Loader2, Mail, Lock, Zap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'password' | 'magic'>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [magicSent, setMagicSent] = useState(false);

    const supabase = createSupabaseBrowserClient();

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            setMagicSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send magic link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2a4a 50%, #1e1b4b 100%)' }}>
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#4F6EF7' }} />
                <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#8b5cf6' }} />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                        <span className="text-white font-black text-xl">EU</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Project<span style={{ color: '#818CF8' }}>Hub</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">EU Grant Management Platform</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
                    {/* Mode Toggle */}
                    <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
                        <button onClick={() => { setMode('password'); setError(null); setMagicSent(false); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'password' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                            <Lock size={13} className="inline mr-1.5" />Password
                        </button>
                        <button onClick={() => { setMode('magic'); setError(null); setMagicSent(false); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'magic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                            <Zap size={13} className="inline mr-1.5" />Magic Link
                        </button>
                    </div>

                    {magicSent ? (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail size={24} className="text-emerald-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Check your inbox</h3>
                            <p className="text-slate-400 text-sm">We sent a magic link to <span className="text-indigo-400 font-semibold">{email}</span></p>
                            <button onClick={() => setMagicSent(false)} className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                                Try another address
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        required placeholder="you@organization.eu"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {mode === 'password' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="password" value={password} onChange={e => setPassword(e.target.value)}
                                            required placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : (
                                    <>
                                        {mode === 'magic' ? 'Send Magic Link' : 'Sign In'}
                                        <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Invite link */}
                    <div className="mt-5 pt-5 border-t border-white/10 text-center">
                        <p className="text-xs text-slate-500">
                            Have an invitation?{' '}
                            <a href="/invite" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                Click here to join
                            </a>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    Internal platform for EU project management
                </p>
            </div>
        </div>
    );
}
