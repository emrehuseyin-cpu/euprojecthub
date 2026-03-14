"use client";

import {
  BarChart3,
  FolderKanban,
  Users,
  Activity,
  Wallet,
  MapPin,
  Clock,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Newspaper
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { supabase } from './lib/supabase';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getRecentPosts } from './lib/wordpress';
import { useLanguage } from './lib/i18n';

const ErasmusDeadlineWidget = dynamic(() => import('./components/ErasmusDeadlineWidget'), {
  ssr: false,
  loading: () => <div className="h-48 bg-white/50 animate-pulse rounded-2xl" />
});

const EUCallsWidget = dynamic(() => import('./components/dashboard/EUCallsWidget'), {
  ssr: false,
  loading: () => <div className="h-48 bg-white/50 animate-pulse rounded-[2rem]" />
});

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl p-6 h-36" style={{ background: 'rgba(79,110,247,0.08)' }}>
          <div className="h-3 bg-white/30 rounded w-1/2 mb-3"></div>
          <div className="h-9 bg-white/20 rounded w-1/3 mt-2"></div>
        </div>
      ))}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl p-3 animate-pulse bg-gray-50">
          <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

const statCards = [
  {
    key: 'activeProjects',
    labelKey: 'dash_active_projects',
    trendKey: 'dash_trend_projects',
    icon: FolderKanban,
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/30',
  },
  {
    key: 'totalBudget',
    labelKey: 'dash_total_budget',
    trendKey: 'dash_trend_budget',
    icon: Wallet,
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/30',
    isCurrency: true,
  },
  {
    key: 'activePartners',
    labelKey: 'dash_partners',
    trendKey: 'dash_trend_partners',
    icon: Users,
    gradient: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/30',
  },
  {
    key: 'completedActivities',
    labelKey: 'dash_completed_activities',
    trendKey: 'dash_trend_activities',
    icon: Activity,
    gradient: 'from-orange-500 to-orange-600',
    shadow: 'shadow-orange-500/30',
  },
];

interface DashboardClientProps {
  initialStats: any;
  initialProjects: any[];
  initialActivities: any[];
  initialParticipants: any[];
  initialBudget: any[];
  initialNews: any[];
}

export default function DashboardClient({
  initialStats,
  initialProjects,
  initialActivities,
  initialParticipants,
  initialBudget,
  initialNews
}: DashboardClientProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [recentProjects, setRecentProjects] = useState(initialProjects);
  const [upcomingActivities, setUpcomingActivities] = useState(initialActivities);
  const [recentParticipants, setRecentParticipants] = useState(initialParticipants);
  const [budgetItems, setBudgetItems] = useState(initialBudget);
  const [news, setNews] = useState(initialNews);
  const [newsLoading, setNewsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { count: activeProjectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Aktif');
      const { data: projectsData } = await supabase.from('projects').select('budget');
      const totalBudget = projectsData?.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) || 0;
      const { count: activePartnersCount } = await supabase.from('partners').select('*', { count: 'exact', head: true });
      const { count: completedActivitiesCount } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('status', 'Tamamlandı');

      setStats({
        activeProjects: activeProjectsCount || 0,
        totalBudget,
        activePartners: activePartnersCount || 0,
        completedActivities: completedActivitiesCount || 0
      });

      const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5);
      if (projects) setRecentProjects(projects);

      const today = new Date().toISOString().split('T')[0];
      const { data: activities } = await supabase.from('activities').select('*, project:projects(name)').gte('start_date', today).order('start_date', { ascending: true }).limit(3);
      if (activities) setUpcomingActivities(activities);

      const { data: participants } = await supabase.from('participants').select('*, project:projects(name)').order('created_at', { ascending: false }).limit(5);
      if (participants) setRecentParticipants(participants);

      const { data: bItems } = await supabase.from('budget_items').select('*');
      if (bItems) {
        const grouped = bItems.reduce((acc: any, curr: any) => {
          acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
          return acc;
        }, {});
        setBudgetItems(Object.keys(grouped).map(k => ({ name: k, value: grouped[k] })));
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `€${(amount / 1000).toFixed(1)}K`;
    return `€${amount}`;
  };

  const getStatValue = (card: typeof statCards[0]) => {
    const raw = stats[card.key as keyof typeof stats];
    return card.isCurrency ? formatCurrency(raw) : raw;
  };

  const statusColors: Record<string, string> = {
    'Aktif': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'İnceleniyor': 'bg-amber-100 text-amber-700 border-amber-200',
    'Tamamlandı': 'bg-blue-100 text-blue-700 border-blue-200',
    'Planlandı': 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div className="flex h-screen text-gray-900 font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 pt-5">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Header */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('dash_title')}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{t('dash_subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <Clock size={11} />
                  {t('dash_updated')} {format(lastUpdated, 'HH:mm:ss')}
                </span>
                <button
                  onClick={fetchDashboardData}
                  className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-100 rounded-lg hover:bg-blue-50 transition-all shadow-sm hover:scale-105 active:scale-95"
                  title="Refresh"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>
                <Link
                  href="/projects/new"
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 text-sm"
                  style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}
                >
                  + New Project
                </Link>
              </div>
            </div>

            {/* ─── STAT CARDS ─── */}
            {loading ? <DashboardSkeleton /> : (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {statCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.key}
                      className={`relative rounded-2xl p-6 text-white overflow-hidden bg-gradient-to-br ${card.gradient} shadow-xl ${card.shadow} cursor-default select-none
                        hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="relative z-10">
                        <p className="text-white/80 text-sm font-medium">{t(card.labelKey as any)}</p>
                        <h3 className="text-4xl font-black mt-2 tracking-tight">{getStatValue(card)}</h3>
                        <div className="flex items-center gap-1.5 mt-3 text-white/70 text-xs font-medium">
                          <TrendingUp size={12} className="text-white/90" />
                          {t(card.trendKey as any)}
                        </div>
                      </div>
                      <div className="absolute -bottom-4 -right-4 opacity-[0.15]">
                        <Icon size={96} strokeWidth={1.5} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── ROW 1: Projects Table + Budget Chart ─── */}
            <div className={`grid grid-cols-1 xl:grid-cols-3 gap-5 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                    <FolderKanban className="w-4 h-4 text-blue-500" />
                    {t('dash_recent_projects')}
                  </h3>
                  <Link href="/projects" className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 hover:gap-2 transition-all">
                    {t('dash_view_all')} <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/70 text-gray-400 text-xs tracking-wider uppercase">
                        <th className="px-5 py-3 font-semibold">{t('name')}</th>
                        <th className="px-5 py-3 font-semibold">Program</th>
                        <th className="px-5 py-3 font-semibold">{t('nav_budget')}</th>
                        <th className="px-5 py-3 font-semibold">{t('status')}</th>
                        <th className="px-5 py-3 text-right font-semibold">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-400">{t('loading')}</td></tr>
                      ) : recentProjects.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-400">{t('dash_no_projects')}</td></tr>
                      ) : recentProjects.map((project, idx) => (
                        <tr key={project.id} className={`hover:bg-indigo-50/40 transition-colors cursor-pointer group ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{project.name}</div>
                            <div className="text-gray-400 text-xs mt-0.5 line-clamp-1">{project.description || t('no_description')}</div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 text-xs font-medium">{project.program}</td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">€{project.budget?.toLocaleString() || 0}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[project.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {project.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                              {t('details')} <ArrowRight size={11} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 p-6 flex flex-col">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-l-4 border-indigo-500 pl-3 mb-5">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  {t('dash_budget_breakdown')}
                </h3>
                <div className="flex-1 w-full min-h-[240px] relative">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">{t('loading')}</div>
                  ) : budgetItems.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-sm">
                      <Wallet className="w-8 h-8 mb-2 opacity-20" />
                      {t('dash_no_budget')}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={budgetItems} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                          {budgetItems.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* ─── ROW 2: Activities + Participants + News ─── */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 p-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-l-4 border-emerald-500 pl-3 mb-5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  {t('dash_upcoming_activities')}
                </h3>
                <div className="space-y-4">
                  {loading ? <div className="text-sm text-gray-400">{t('loading')}</div> : upcomingActivities.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">{t('dash_no_activities')}</div>
                  ) : upcomingActivities.map(activity => (
                    <div key={activity.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-xl -mx-2 transition-colors">
                      <div className="w-12 h-12 rounded-xl flex flex-col justify-center items-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <span className="text-[9px] font-bold text-white/80 leading-none mb-0.5">{format(new Date(activity.start_date), 'MMM').toUpperCase()}</span>
                        <span className="text-lg font-black text-white leading-none">{format(new Date(activity.start_date), 'dd')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{activity.title}</h4>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{activity.project?.name || t('unknown_project')}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin size={9} /> {activity.location || t('location_tbd')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 border-l-4 border-purple-500 pl-3">
                    <Users className="w-4 h-4 text-purple-500" />
                    Recent Participants
                  </h3>
                  <Link href="/participants" className="flex items-center gap-0.5 text-xs text-blue-600 font-semibold hover:gap-1.5 transition-all">
                    {t('all')} <ArrowRight size={11} />
                  </Link>
                </div>
                <div className="space-y-2">
                  {loading ? <div className="text-sm text-gray-400">{t('loading')}</div> : recentParticipants.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">{t('dash_no_participants')}</div>
                  ) : recentParticipants.map((participant, idx) => (
                    <div key={participant.id} className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/50 -mx-2 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/80' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: `hsl(${(participant.first_name?.charCodeAt(0) || 0) * 11 % 360}, 65%, 60%)` }}>
                          {participant.first_name?.[0]}{participant.last_name?.[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{participant.first_name} {participant.last_name}</h4>
                          <p className="text-[11px] text-gray-400 max-w-[130px] truncate">{participant.project?.name || 'No project'}</p>
                        </div>
                      </div>
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                        {participant.country}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                    <Newspaper className="w-4 h-4 text-blue-500" />
                    {t('dash_announcements')}
                  </h3>
                </div>
                <div className="p-4 flex-1 space-y-2.5">
                  {newsLoading ? <NewsSkeleton /> : news.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8">{t('dash_no_news')}</div>
                  ) : news.map((post) => (
                    <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer"
                      className="group flex flex-col gap-1.5 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all rounded-xl p-3">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{format(new Date(post.date), 'dd MMM yyyy')}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── ROW 3: Erasmus+ Deadlines & Live EU Calls ─── */}
            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-5 transition-all duration-700 delay-400 mt-5 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="xl:col-span-1">
                <ErasmusDeadlineWidget />
              </div>
              <div className="xl:col-span-1">
                <EUCallsWidget />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
