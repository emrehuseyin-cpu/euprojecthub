'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { useEffect } from 'react';
import {
    LayoutDashboard, Building2, Users, Palette, Settings,
    PuzzleIcon, MessageSquare, BarChart3, GitBranch,
    ArrowLeft, ShieldCheck
} from 'lucide-react';

const adminNav = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/theme', label: 'UI & Theme', icon: Palette },
    { href: '/admin/system', label: 'System Settings', icon: Settings },
    { href: '/admin/modules', label: 'Modules', icon: PuzzleIcon },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/versions', label: 'Versions', icon: GitBranch },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && role !== 'super_admin') {
            router.replace('/unauthorized');
        }
    }, [role, loading, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (role !== 'super_admin') return null;

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href) && !(exact && pathname !== href);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
            {/* Admin Sidebar */}
            <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/[0.06]" style={{ background: '#0d1117' }}>
                {/* Logo */}
                <div className="h-14 flex items-center px-4 border-b border-white/[0.06] gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
                        style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                        SA
                    </div>
                    <div>
                        <p className="text-xs font-black text-white leading-none">Admin Panel</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">EUProjectHub</p>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="px-3 pt-3">
                    <Link href="/"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all text-xs font-semibold group">
                        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Super Admin Badge */}
                <div className="px-3 py-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <ShieldCheck size={12} className="text-red-400" />
                        <span className="text-[11px] font-bold text-red-400">SUPER ADMIN</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
                    {adminNav.map(({ href, label, icon: Icon, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href);
                        return (
                            <Link key={href} href={href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active
                                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}>
                                <Icon size={15} className={active ? 'text-indigo-400' : 'text-slate-500'} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-white/[0.06]">
                    <p className="text-[10px] text-slate-600 text-center">EUProjectHub Admin v1.0</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className="h-14 border-b border-white/[0.06] flex items-center px-6" style={{ background: '#0d1117' }}>
                    <h1 className="text-sm font-bold text-slate-300">
                        {adminNav.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label ?? 'Admin'}
                    </h1>
                </div>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
