'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard, FolderKanban, Activity, UsersRound,
    Wallet, FileSignature, Users, Link as LinkIcon,
    GraduationCap, FileText, Zap, Bot, MessageSquare, Settings,
    ChevronLeft, ChevronRight, Building2, UserCog, ShieldCheck
} from 'lucide-react';
import { useLanguage, type TranslationKey } from '../lib/i18n';
import { useAuth } from '../lib/AuthContext';
import { isAtLeast } from '../lib/permissions';
import { ROLE_COLORS, ROLE_LABELS } from '../lib/permissions';

const navGroups: Array<{
    labelKey: TranslationKey;
    minRole?: string;
    items: Array<{ href: string; labelKey: TranslationKey; icon: React.ElementType; color: string; activeBg: string; minRole?: string }>;
}> = [
        {
            labelKey: 'group_general',
            items: [
                { href: '/', labelKey: 'nav_dashboard', icon: LayoutDashboard, color: 'text-blue-400', activeBg: 'bg-blue-500/10' },
            ]
        },
        {
            labelKey: 'group_project_mgmt',
            items: [
                { href: '/projects', labelKey: 'nav_projects', icon: FolderKanban, color: 'text-emerald-400', activeBg: 'bg-emerald-500/10' },
                { href: '/activities', labelKey: 'nav_activities', icon: Activity, color: 'text-orange-400', activeBg: 'bg-orange-500/10' },
                { href: '/participants', labelKey: 'nav_participants', icon: UsersRound, color: 'text-pink-400', activeBg: 'bg-pink-500/10' },
            ]
        },
        {
            labelKey: 'group_finance',
            items: [
                { href: '/budget', labelKey: 'nav_budget', icon: Wallet, color: 'text-red-400', activeBg: 'bg-red-500/10' },
                { href: '/contracts', labelKey: 'nav_contracts', icon: FileSignature, color: 'text-slate-400', activeBg: 'bg-slate-500/10' },
            ]
        },
        {
            labelKey: 'group_partnership',
            items: [
                { href: '/partners', labelKey: 'nav_partners', icon: Users, color: 'text-purple-400', activeBg: 'bg-purple-500/10' },
                { href: '/webgate', labelKey: 'nav_webgate', icon: LinkIcon, color: 'text-teal-400', activeBg: 'bg-teal-500/10' },
            ]
        },
        {
            labelKey: 'group_content',
            items: [
                { href: '/lms', labelKey: 'nav_lms', icon: GraduationCap, color: 'text-indigo-400', activeBg: 'bg-indigo-500/10' },
                { href: '/reports', labelKey: 'nav_reports', icon: FileText, color: 'text-yellow-400', activeBg: 'bg-yellow-500/10' },
            ]
        },
        {
            labelKey: 'group_automation',
            items: [
                { href: '/workflows', labelKey: 'nav_workflows', icon: Zap, color: 'text-cyan-400', activeBg: 'bg-cyan-500/10' },
                { href: '/ai-assistant', labelKey: 'nav_ai_assistant', icon: Bot, color: 'text-violet-400', activeBg: 'bg-violet-500/10' },
            ]
        },
        {
            labelKey: 'group_system',
            items: [
                { href: '/users', labelKey: 'nav_users', icon: UserCog, color: 'text-amber-400', activeBg: 'bg-amber-500/10', minRole: 'org_admin' },
                { href: '/organizations', labelKey: 'nav_organizations', icon: Building2, color: 'text-rose-400', activeBg: 'bg-rose-500/10', minRole: 'super_admin' },
                { href: '/settings/feedback', labelKey: 'nav_feedback', icon: MessageSquare, color: 'text-sky-400', activeBg: 'bg-sky-500/10' },
                { href: '/settings', labelKey: 'nav_settings', icon: Settings, color: 'text-gray-400', activeBg: 'bg-gray-500/10' },
            ]
        },
    ];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { t } = useLanguage();
    const { role, displayName, initials, orgName } = useAuth();

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <aside
            className="flex-shrink-0 hidden md:flex flex-col transition-all duration-300 relative"
            style={{ width: collapsed ? '64px' : '240px', background: '#1E2A4A' }}
        >
            {/* Logo */}
            <div className={`flex items-center border-b border-white/10 h-16 flex-shrink-0 ${collapsed ? 'justify-center px-3' : 'px-5 gap-3'}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                    EU
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                        Project<span style={{ color: '#4F6EF7' }}>Hub</span>
                    </span>
                )}
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                {navGroups.map((group, gi) => {
                    // Filter items by role
                    const visibleItems = group.items.filter(item =>
                        !item.minRole || isAtLeast(role, item.minRole as any)
                    );
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.labelKey} className={gi > 0 ? 'mt-1' : ''}>
                            {!collapsed && (
                                <div className={`${gi > 0 ? 'mt-4 mb-1 pt-3 border-t border-white/[0.07]' : 'mb-1'} px-4`}>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {t(group.labelKey)}
                                    </p>
                                </div>
                            )}
                            {collapsed && gi > 0 && <div className="my-2 mx-3 border-t border-white/10" />}
                            <div className={`${collapsed ? 'px-2 space-y-0.5' : 'px-3 space-y-0.5'}`}>
                                {visibleItems.map(({ href, labelKey, icon: Icon, color, activeBg }) => {
                                    const active = isActive(href);
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            title={collapsed ? t(labelKey) : undefined}
                                            className={`flex items-center rounded-xl text-sm font-medium transition-all group
                                                ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                                                ${active
                                                    ? `${activeBg} border-l-2 border-[#4F6EF7] ${collapsed ? 'border-l-0 border-2' : 'pl-[10px]'}`
                                                    : 'hover:bg-white/5 border-l-2 border-transparent'
                                                }`}
                                        >
                                            <Icon size={18} className={`flex-shrink-0 ${active ? color : 'text-slate-500 group-hover:text-slate-300'}`} />
                                            {!collapsed && (
                                                <span className={active ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'}>
                                                    {t(labelKey)}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Admin Panel Link — super_admin only */}
            {role === 'super_admin' && (
                <div className={`${collapsed ? 'px-2 pb-1' : 'px-3 pb-1'}`}>
                    <Link href="/admin" title={collapsed ? 'Admin Panel' : undefined}
                        className={`flex items-center rounded-xl text-xs font-bold transition-all group border border-red-500/20 bg-red-500/5 hover:bg-red-500/10
                            ${collapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'}`}>
                        <ShieldCheck size={15} className="text-red-400 flex-shrink-0" />
                        {!collapsed && <span className="text-red-400">Admin Panel</span>}
                    </Link>
                </div>
            )}

            {/* User Footer */}
            {!collapsed && (
                <div className="border-t border-white/10 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{displayName}</p>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${ROLE_COLORS[role] || ROLE_COLORS.member}`}>
                            {ROLE_LABELS[role] || role}
                        </span>
                    </div>
                </div>
            )}

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1E2A4A] border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-white/40 transition-all shadow-lg z-50"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </aside>
    );
}
