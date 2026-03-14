'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../lib/supabase';
import {
    CheckCircle2, XCircle, Loader2, Database, Globe, Cpu,
    Users, Building2, FolderKanban, Activity, MessageSquare,
    TrendingUp, RefreshCw
} from 'lucide-react';

type HealthStatus = 'checking' | 'ok' | 'error';

type ServiceHealth = {
    name: string;
    key: string;
    status: HealthStatus;
    latency?: number;
};

type PlatformStats = {
    orgs: number;
    users: number;
    projects: number;
    participants: number;
    activities: number;
    feedbacks: number;
};

const SERVICES = [
    { key: 'supabase', name: 'Supabase' },
    { key: 'wordpress', name: 'WordPress API' },
    { key: 'moodle', name: 'Moodle LMS' },
    { key: 'groq', name: 'Groq AI' },
    { key: 'posthog', name: 'PostHog' },
    { key: 'sentry', name: 'Sentry' },
];

export default function AdminOverviewPage() {
    const [services, setServices] = useState<ServiceHealth[]>(
        SERVICES.map(s => ({ ...s, status: 'checking' }))
    );
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    const checkServices = async () => {
        setServices(SERVICES.map(s => ({ ...s, status: 'checking' })));

        // Check Supabase
        const t0 = performance.now();
        try {
            await supabase.from('organizations').select('id').limit(1);
            const lat = Math.round(performance.now() - t0);
            setServices(prev => prev.map(s => s.key === 'supabase' ? { ...s, status: 'ok', latency: lat } : s));
        } catch {
            setServices(prev => prev.map(s => s.key === 'supabase' ? { ...s, status: 'error' } : s));
        }

        // Check WordPress
        try {
            const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://mda.org.tr';
            const t1 = performance.now();
            const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts?per_page=1`, { signal: AbortSignal.timeout(5000) });
            const lat = Math.round(performance.now() - t1);
            setServices(prev => prev.map(s => s.key === 'wordpress' ? { ...s, status: res.ok ? 'ok' : 'error', latency: lat } : s));
        } catch {
            setServices(prev => prev.map(s => s.key === 'wordpress' ? { ...s, status: 'error' } : s));
        }

        // Moodle, Groq, PostHog, Sentry — mark as ok if env vars exist (can't test directly without server-side)
        const envChecks: Record<string, boolean> = {
            moodle: !!(process.env.NEXT_PUBLIC_MOODLE_URL),
            groq: true, // can't expose key client-side
            posthog: !!(process.env.NEXT_PUBLIC_POSTHOG_KEY),
            sentry: true,
        };
        setServices(prev => prev.map(s => {
            if (s.key in envChecks) return { ...s, status: envChecks[s.key] ? 'ok' : 'error' };
            return s;
        }));
    };

    const loadStats = async () => {
        const [orgsRes, usersRes, projRes, partRes, actRes, fbRes] = await Promise.all([
            supabase.from('organizations').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('projects').select('*', { count: 'exact', head: true }),
            supabase.from('participants').select('*', { count: 'exact', head: true }),
            supabase.from('activities').select('*', { count: 'exact', head: true }),
            supabase.from('feedbacks').select('*', { count: 'exact', head: true }),
        ]);
        setStats({
            orgs: orgsRes.count ?? 0,
            users: usersRes.count ?? 0,
            projects: projRes.count ?? 0,
            participants: partRes.count ?? 0,
            activities: actRes.count ?? 0,
            feedbacks: fbRes.count ?? 0,
        });

        const { data: proj } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5);
        if (proj) setRecentProjects(proj);
        const { data: fb } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false }).limit(5);
        if (fb) setRecentFeedbacks(fb);
        setLoading(false);
    };

    useEffect(() => { checkServices(); loadStats(); }, []);

    const statusIcon = (status: HealthStatus) => {
        if (status === 'checking') return <Loader2 size={14} className="animate-spin text-slate-400" />;
        if (status === 'ok') return <CheckCircle2 size={14} className="text-emerald-400" />;
        return <XCircle size={14} className="text-red-400" />;
    };

    const statCards = [
        { label: 'Organizations', value: stats?.orgs, icon: Building2, color: 'from-indigo-500 to-indigo-600' },
        { label: 'Users', value: stats?.users, icon: Users, color: 'from-violet-500 to-violet-600' },
        { label: 'Projects', value: stats?.projects, icon: FolderKanban, color: 'from-blue-500 to-blue-600' },
        { label: 'Participants', value: stats?.participants, icon: Users, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Activities', value: stats?.activities, icon: Activity, color: 'from-orange-500 to-orange-600' },
        { label: 'Feedbacks', value: stats?.feedbacks, icon: MessageSquare, color: 'from-pink-500 to-pink-600' },
    ];

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Stats */}
            <div>
                <h2 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-400" /> Platform Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {statCards.map(c => (
                        <div key={c.label} className={`rounded-xl p-4 bg-gradient-to-br ${c.color} text-white relative overflow-hidden`}>
                            <p className="text-[11px] font-semibold text-white/70 mb-1">{c.label}</p>
                            <p className="text-2xl font-black">{loading ? '—' : (c.value ?? 0)}</p>
                            <c.icon size={36} className="absolute -right-2 -bottom-2 opacity-10" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Service Health */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                        <Database size={16} className="text-indigo-400" /> Service Health
                    </h2>
                    <button onClick={checkServices}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10">
                        <RefreshCw size={12} /> Recheck
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {services.map(s => (
                        <div key={s.key} className="bg-white/5 border border-white/[0.07] rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Globe size={14} className="text-slate-400" />
                                <span className="text-sm font-semibold text-slate-200">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {s.latency && <span className="text-[10px] text-slate-500">{s.latency}ms</span>}
                                {statusIcon(s.status)}
                                <span className={`text-xs font-bold ${s.status === 'ok' ? 'text-emerald-400' : s.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                                    {s.status === 'checking' ? 'Checking' : s.status === 'ok' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Erasmus Monitor Quick Access */}
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Erasmus+ 2026 Monitor</h3>
                        <p className="text-sm text-slate-400">Track all Erasmus+ actions, rules, and live integration health.</p>
                    </div>
                </div>
                <Link href="/admin/erasmus" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
                    Open Monitor
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Projects */}
                <div className="bg-white/5 border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.07]">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <FolderKanban size={14} className="text-indigo-400" /> Recent Projects
                        </h3>
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                        {recentProjects.map(p => (
                            <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div>
                                    <p className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">{p.name}</p>
                                    <p className="text-[11px] text-slate-500">{new Date(p.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === 'Aktif' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                                    {p.status}
                                </span>
                            </div>
                        ))}
                        {!loading && recentProjects.length === 0 && <p className="text-center py-6 text-sm text-slate-500">No projects yet</p>}
                    </div>
                </div>

                {/* Recent Feedbacks */}
                <div className="bg-white/5 border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.07]">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <MessageSquare size={14} className="text-pink-400" /> Recent Feedback
                        </h3>
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                        {recentFeedbacks.map(f => (
                            <div key={f.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.type === 'bug' ? 'bg-red-500/15 text-red-400' :
                                            f.type === 'suggestion' ? 'bg-blue-500/15 text-blue-400' :
                                                'bg-slate-500/15 text-slate-400'}`}>
                                        {f.type || 'general'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">{f.page}</span>
                                </div>
                                <p className="text-sm text-slate-300 truncate">{f.message}</p>
                            </div>
                        ))}
                        {!loading && recentFeedbacks.length === 0 && <p className="text-center py-6 text-sm text-slate-500">No feedback yet</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
