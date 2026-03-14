'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Globe,
  Building2,
  FolderKanban,
  DollarSign,
  Activity,
  Users,
  Bot,
  BarChart3,
  GraduationCap,
  Download,
  UserCircle,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: any;
  label: string;
  badge?: string;
  superAdminOnly?: boolean;
}

interface NavGroup {
  label?: string;
  adminOnly?: boolean;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Proposals',
    items: [
      { href: '/proposals', icon: FileText, label: 'Proposals' },
      { href: '/eu-calls', icon: Globe, label: 'EU Calls', badge: 'Live' },
      { href: '/organisations', icon: Building2, label: 'Org Registry' },
    ],
  },
  {
    label: 'Projects',
    items: [
      { href: '/projects', icon: FolderKanban, label: 'Projects' },
      { href: '/budget', icon: DollarSign, label: 'Budget' },
      { href: '/activities', icon: Activity, label: 'Activities' },
      { href: '/participants', icon: Users, label: 'Participants' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
      { href: '/reports', icon: BarChart3, label: 'Reports' },
      { href: '/lms', icon: GraduationCap, label: 'LMS' },
      { href: '/webgate', icon: Download, label: 'Webgate Export' },
    ],
  },
  {
    label: 'Admin',
    adminOnly: false,
    items: [
      { href: '/users', icon: UserCircle, label: 'Team Members' },
      { href: '/settings', icon: Settings, label: 'Settings' },
      { href: '/admin', icon: ShieldAlert, label: 'Admin Panel', superAdminOnly: true },
    ],
  },
];

const SIDEBAR_BG = 'rgb(15, 23, 42)';
const ACTIVE_BG = 'rgba(79, 110, 247, 0.18)';
const ACTIVE_ICON = '#818CF8';
const INACTIVE_TEXT = 'rgba(148, 163, 184, 0.75)';
const INACTIVE_ICON = 'rgba(148, 163, 184, 0.5)';
const DIVIDER = 'rgba(255,255,255,0.07)';
const GROUP_LABEL = 'rgba(148,163,184,0.4)';

export function Sidebar() {
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
        .then(({ data: p }) => setProfile(p));
    });
  }, []);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const isSuperAdmin = profile?.role === 'super_admin';

  function handleSignOut() {
    supabase.auth.signOut().then(() => {
      window.location.href = '/login';
    });
  }

  const Content = () => (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: SIDEBAR_BG }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: 64, borderBottom: `1px solid ${DIVIDER}` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}
        >
          EU
        </div>
        <span className="text-white font-semibold text-[15px] tracking-tight whitespace-nowrap">
          Project<span style={{ color: '#818CF8' }}>Hub</span>
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter(
            (item) => !('superAdminOnly' in item && item.superAdminOnly && !isSuperAdmin)
          );
          if (!visibleItems.length) return null;

          return (
            <div key={gi}>
              {group.label && (
                <p
                  className="px-3 mb-1 text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: GROUP_LABEL }}
                >
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] transition-all relative"
                      style={{
                        color: active ? '#f1f5f9' : INACTIVE_TEXT,
                        background: active ? ACTIVE_BG : 'transparent',
                        fontWeight: active ? 500 : 400,
                      }}
                    >
                      {/* Left active bar */}
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            width: 3,
                            height: 18,
                            background: '#818CF8',
                          }}
                        />
                      )}

                      <item.icon
                        size={15}
                        style={{
                          color: active ? ACTIVE_ICON : INACTIVE_ICON,
                          flexShrink: 0,
                        }}
                      />

                      <span className="flex-1 truncate">{item.label}</span>

                      {'badge' in item && item.badge && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
                          style={{
                            background: 'rgba(34,197,94,0.15)',
                            color: '#4ade80',
                          }}
                        >
                          {item.badge}
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

      {/* ── User footer ── */}
      <div
        className="px-3 py-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${DIVIDER}` }}
      >
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}
          >
            {profile
              ? (profile.full_name || profile.email || 'U')[0].toUpperCase()
              : '?'}
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] font-medium truncate"
              style={{ color: 'rgba(248,250,252,0.85)' }}
            >
              {profile?.full_name || profile?.email || '—'}
            </p>
            <p
              className="text-[10px] capitalize truncate"
              style={{ color: 'rgba(148,163,184,0.55)' }}
            >
              {profile?.role?.replace(/_/g, ' ') || 'member'}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1 rounded transition-colors hover:bg-white/10"
          >
            <LogOut size={13} style={{ color: 'rgba(148,163,184,0.45)' }} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop ── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{ width: 220, minHeight: '100vh' }}
      >
        <Content />
      </aside>

      {/* ── Mobile hamburger ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center text-white"
        style={{ background: SIDEBAR_BG }}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex flex-col flex-shrink-0" style={{ width: 220 }}>
            <Content />
          </div>
          <div
            className="flex-1"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
