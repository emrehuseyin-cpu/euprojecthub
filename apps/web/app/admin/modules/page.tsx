'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { PuzzleIcon, Loader2 } from 'lucide-react';
import {
    LayoutDashboard, FolderKanban, Activity, Users, Wallet,
    FileSignature, UsersRound, Link, GraduationCap, FileText,
    Zap, Bot, Globe
} from 'lucide-react';

const MODULES = [
    { key: 'projects', label: 'Projects', icon: FolderKanban, desc: 'EU grant project management', canDisable: true },
    { key: 'activities', label: 'Activities', icon: Activity, desc: 'Project activities and events', canDisable: true },
    { key: 'participants', label: 'Participants', icon: UsersRound, desc: 'Participant registration and management', canDisable: true },
    { key: 'budget', label: 'Budget', icon: Wallet, desc: 'Budget tracking and reporting', canDisable: true },
    { key: 'contracts', label: 'Contracts', icon: FileSignature, desc: 'Contract management', canDisable: true },
    { key: 'partners', label: 'Partners', icon: Users, desc: 'Partner organizations', canDisable: true },
    { key: 'webgate', label: 'Webgate Export', icon: Globe, desc: 'EU Webgate data export', canDisable: true },
    { key: 'lms', label: 'LMS (Moodle)', icon: GraduationCap, desc: 'Learning management integration', canDisable: true },
    { key: 'reports', label: 'Reports', icon: FileText, desc: 'Project reports and analytics', canDisable: true },
    { key: 'workflows', label: 'Workflows', icon: Zap, desc: 'Process automation workflows', canDisable: true },
    { key: 'ai_assistant', label: 'AI Assistant', icon: Bot, desc: 'Groq-powered AI chat assistant', canDisable: true },
];

type ModuleState = { is_active: boolean; admin_only: boolean };

export default function AdminModulesPage() {
    const [states, setStates] = useState<Record<string, ModuleState>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        supabase.from('module_settings').select('*').then(({ data }) => {
            const map: Record<string, ModuleState> = {};
            if (data) data.forEach(r => { map[r.module_key] = { is_active: r.is_active, admin_only: r.admin_only }; });
            // Defaults
            MODULES.forEach(m => { if (!map[m.key]) map[m.key] = { is_active: true, admin_only: false }; });
            setStates(map);
            setLoading(false);
        });
    }, []);

    const toggle = async (key: string, field: 'is_active' | 'admin_only') => {
        setSaving(key + field);
        const newState = { ...states[key], [field]: !states[key]?.[field] };
        setStates(prev => ({ ...prev, [key]: newState }));
        await supabase.from('module_settings').upsert({ module_key: key, ...newState, updated_at: new Date().toISOString() }, { onConflict: 'module_key' });
        setSaving(null);
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-400" /></div>;

    return (
        <div className="space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <PuzzleIcon size={16} className="text-indigo-400" /> Module Management
                </h2>
                <p className="text-xs text-slate-500">Changes take effect immediately for all users</p>
            </div>

            {/* Dashboard — always on */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/15 rounded-xl flex items-center justify-center">
                        <LayoutDashboard size={18} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200">Dashboard</p>
                        <p className="text-xs text-slate-500">Main dashboard — cannot be disabled</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">Always Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULES.map(({ key, label, icon: Icon, desc }) => {
                    const state = states[key] ?? { is_active: true, admin_only: false };
                    return (
                        <div key={key} className={`bg-white/5 border rounded-xl p-4 transition-all ${state.is_active ? 'border-white/[0.07]' : 'border-red-500/20 opacity-60'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${state.is_active ? 'bg-white/10' : 'bg-red-500/10'}`}>
                                        <Icon size={18} className={state.is_active ? 'text-slate-300' : 'text-red-400'} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">{label}</p>
                                        <p className="text-xs text-slate-500">{desc}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {/* Active Toggle */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-slate-500 font-bold">Active</span>
                                        <button onClick={() => toggle(key, 'is_active')}
                                            disabled={saving === key + 'is_active'}
                                            className={`relative rounded-full transition-colors ${state.is_active ? 'bg-emerald-500' : 'bg-white/10'}`}
                                            style={{ width: 36, height: 20 }}>
                                            <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                                style={{ transform: state.is_active ? 'translateX(16px)' : 'translateX(0)' }} />
                                        </button>
                                    </div>
                                    {/* Admin Only Toggle */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-slate-500 font-bold">Admin Only</span>
                                        <button onClick={() => toggle(key, 'admin_only')}
                                            disabled={saving === key + 'admin_only'}
                                            className={`relative rounded-full transition-colors ${state.admin_only ? 'bg-amber-500' : 'bg-white/10'}`}
                                            style={{ width: 36, height: 20 }}>
                                            <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                                style={{ transform: state.admin_only ? 'translateX(16px)' : 'translateX(0)' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
