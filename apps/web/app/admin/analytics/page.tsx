'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { BarChart3, Users, FolderKanban, Building2, Loader2 } from 'lucide-react';

type OrgStat = { id: string; name: string; project_count: number; user_count: number };

export default function AdminAnalyticsPage() {
    const [orgStats, setOrgStats] = useState<OrgStat[]>([]);
    const [totalCounts, setTotalCounts] = useState({ users: 0, projects: 0, activities: 0, orgs: 0 });
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function load() {
            const [orgsRes, usersRes, projRes, actRes] = await Promise.all([
                supabase.from('organizations').select('*'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('activities').select('*', { count: 'exact', head: true }),
            ]);

            setTotalCounts({
                orgs: orgsRes.data?.length ?? 0,
                users: usersRes.count ?? 0,
                projects: projRes.count ?? 0,
                activities: actRes.count ?? 0,
            });

            if (orgsRes.data) {
                const statsPromises = orgsRes.data.map(async (org) => {
                    const [pRes, uRes] = await Promise.all([
                        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
                        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
                    ]);
                    return { id: org.id, name: org.name, project_count: pRes.count ?? 0, user_count: uRes.count ?? 0 };
                });
                const stats = await Promise.all(statsPromises);
                setOrgStats(stats.sort((a, b) => b.project_count - a.project_count));
            }
            setLoading(false);
        }
        load();
    }, []);

    const max = Math.max(...orgStats.map(o => o.project_count), 1);

    const MODULE_LABELS = [
        { key: 'Projects', color: 'bg-blue-500' },
        { key: 'Activities', color: 'bg-orange-500' },
        { key: 'Budget', color: 'bg-emerald-500' },
        { key: 'Partners', color: 'bg-purple-500' },
        { key: 'LMS', color: 'bg-indigo-500' },
        { key: 'AI Assistant', color: 'bg-violet-500' },
        { key: 'Reports', color: 'bg-amber-500' },
        { key: 'Workflows', color: 'bg-cyan-500' },
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-400" /> Analytics Overview
            </h2>

            {/* PostHog note */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <BarChart3 size={16} className="text-indigo-400 flex-shrink-0" />
                <p className="text-xs text-indigo-300">
                    Detailed usage analytics are available in your{' '}
                    <a href="https://us.posthog.com" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-indigo-200">
                        PostHog Dashboard
                    </a>
                    . Below shows platform-level data from Supabase.
                </p>
            </div>

            {/* Global Stats */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-400" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Organizations', value: totalCounts.orgs, icon: Building2, color: 'from-indigo-500 to-indigo-600' },
                            { label: 'Total Users', value: totalCounts.users, icon: Users, color: 'from-violet-500 to-violet-600' },
                            { label: 'Total Projects', value: totalCounts.projects, icon: FolderKanban, color: 'from-blue-500 to-blue-600' },
                            { label: 'Total Activities', value: totalCounts.activities, icon: BarChart3, color: 'from-emerald-500 to-emerald-600' },
                        ].map(c => (
                            <div key={c.label} className={`rounded-xl p-4 bg-gradient-to-br ${c.color} text-white relative overflow-hidden`}>
                                <p className="text-[11px] font-semibold text-white/70 mb-1">{c.label}</p>
                                <p className="text-3xl font-black">{c.value}</p>
                                <c.icon size={40} className="absolute -right-2 -bottom-2 opacity-10" />
                            </div>
                        ))}
                    </div>

                    {/* Org Comparison */}
                    <div className="bg-white/5 border border-white/[0.07] rounded-xl p-5">
                        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Building2 size={14} className="text-indigo-400" /> Projects by Organization
                        </h3>
                        {orgStats.length === 0 ? (
                            <p className="text-center py-8 text-slate-500 text-sm">No organizations yet</p>
                        ) : (
                            <div className="space-y-3">
                                {orgStats.map(org => (
                                    <div key={org.id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-slate-200">{org.name}</span>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span><Users size={10} className="inline mr-1" />{org.user_count} users</span>
                                                <span className="font-bold text-slate-300">{org.project_count} projects</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${(org.project_count / max) * 100}%`, background: 'linear-gradient(90deg, #4F6EF7, #818CF8)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Module Usage Bars (decorative/representative) */}
                    <div className="bg-white/5 border border-white/[0.07] rounded-xl p-5">
                        <h3 className="text-sm font-bold text-slate-200 mb-4">Module Usage (Representative)</h3>
                        <div className="space-y-2.5">
                            {MODULE_LABELS.map((m, i) => {
                                const pct = Math.max(20, 100 - i * 11);
                                return (
                                    <div key={m.key} className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400 w-20 text-right">{m.key}</span>
                                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${m.color} opacity-70`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-[11px] text-slate-500 w-8">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-3">* Connect PostHog for real usage data</p>
                    </div>
                </>
            )}
        </div>
    );
}
