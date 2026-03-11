"use client";

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Settings, Calendar, Wallet, Activity, Users, FileText,
    GraduationCap, BookOpen, ExternalLink, Loader2, Plus, Download,
    MapPin, BarChart3, CheckCircle2, Clock, AlertCircle, X, FileSignature, Link as LinkIcon, Sparkles
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { getCourses } from '../../lib/moodle';
import { trackEvent } from '../../lib/analytics';
import { format, differenceInDays } from 'date-fns';
import dynamic from 'next/dynamic';
import { ActivityInlineForm } from '../../components/forms/ActivityInlineForm';
import { ParticipantInlineForm } from '../../components/forms/ParticipantInlineForm';
import { BudgetInlineForm } from '../../components/forms/BudgetInlineForm';
import { SlideOver } from '../../components/SlideOver';

// Dynamic imports for heavy components
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
const ProjectCharts = dynamic(() => import('../../components/ProjectCharts').then(mod => mod.ProjectCharts), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-2xl" />
});

const COLORS = ['#4F6EF7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'activities', label: 'Activities', icon: '📅' },
    { id: 'participants', label: 'Participants', icon: '👥' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'partners', label: 'Partners', icon: '🤝' },
    { id: 'contracts', label: 'Contracts', icon: '📄' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'lms', label: 'LMS Courses', icon: '🎓' },
    { id: 'webgate', label: 'Webgate', icon: '📤' },
];

const statusStyle: Record<string, string> = {
    'Aktif': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Tamamlandı': 'bg-blue-100 text-blue-700 border-blue-200',
    'İnceleniyor': 'bg-amber-100 text-amber-700 border-amber-200',
    'Planlandı': 'bg-purple-100 text-purple-700 border-purple-200',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {status}
        </span>
    );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState('overview');

    // Project data
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Tab data
    const [activities, setActivities] = useState<any[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [budgetItems, setBudgetItems] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [contracts, setContracts] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    // Tab loading states
    const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({});

    // Modals
    const [modal, setModal] = useState<string | null>(null);

    // AI Analysis
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [erasmusReport, setErasmusReport] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [erasmusLoading, setErasmusLoading] = useState(false);

    // Activity status filter
    const [activityFilter, setActivityFilter] = useState('All');

    useEffect(() => {
        trackEvent('project_viewed', { project_id: id });

        // Initial load in parallel
        Promise.all([
            fetchProject(),
            loadTabData('overview')
        ]);
    }, [id]);

    const fetchProject = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('projects').select('*').eq('id', id).single();
            setProject(data);
        } finally {
            setLoading(false);
        }
    };

    const loadTabData = useCallback(async (tab: string) => {
        if (tabLoading[tab]) return;
        setTabLoading(prev => ({ ...prev, [tab]: true }));
        try {
            const fetchActions = [];

            if (tab === 'activities' || tab === 'overview') {
                fetchActions.push(
                    supabase.from('activities').select('*').eq('project_id', id).order('start_date', { ascending: true })
                        .then(({ data }) => data && setActivities(data))
                );
            }
            if (tab === 'participants' || tab === 'overview') {
                fetchActions.push(
                    supabase.from('participants').select('*, activity:activities(title)').eq('project_id', id).order('created_at', { ascending: false })
                        .then(({ data }) => data && setParticipants(data))
                );
            }
            if (tab === 'budget' || tab === 'overview') {
                fetchActions.push(
                    supabase.from('budget_items').select('*').eq('project_id', id)
                        .then(({ data }) => data && setBudgetItems(data))
                );
            }
            if (tab === 'partners') {
                fetchActions.push(
                    supabase.from('partners').select('*').eq('project_id', id)
                        .then(({ data }) => data && setPartners(data))
                );
            }
            if (tab === 'contracts') {
                fetchActions.push(
                    supabase.from('contracts').select('*').eq('project_id', id).order('created_at', { ascending: false })
                        .then(({ data }) => data && setContracts(data))
                );
            }
            if (tab === 'reports') {
                fetchActions.push(
                    supabase.from('reports').select('*').eq('project_id', id).order('created_at', { ascending: false })
                        .then(({ data }) => data && setReports(data))
                );
            }
            if (tab === 'lms' && courses.length === 0) {
                fetchActions.push(
                    getCourses().then((data) => data && Array.isArray(data) && setCourses(data.slice(0, 6)))
                );
            }

            await Promise.all(fetchActions);
        } catch (error) {
            console.error('[loadTabData] Error:', error);
        } finally {
            setTabLoading(prev => ({ ...prev, [tab]: false }));
        }
    }, [id, tabLoading, courses.length]);

    useEffect(() => {
        loadTabData('overview');
    }, [id]);

    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab]);

    if (loading) return (
        <div className="flex h-screen" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            </div>
        </div>
    );

    if (!project) return (
        <div className="flex h-screen" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center text-gray-500">Project not found.</div>
            </div>
        </div>
    );

    const daysLeft = project.end_date ? differenceInDays(new Date(project.end_date), new Date()) : null;
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'Tamamlandı').length;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
    const totalSpent = budgetItems.reduce((s, b) => s + Number(b.amount || 0), 0);

    const budgetChartData = budgetItems.reduce((acc: any, curr) => {
        const key = curr.category || 'Other';
        const existing = acc.find((a: any) => a.name === key);
        if (existing) existing.value += Number(curr.amount);
        else acc.push({ name: key, value: Number(curr.amount) });
        return acc;
    }, []);

    const countryDist = participants.reduce((acc: any, p) => {
        if (p.country) acc[p.country] = (acc[p.country] || 0) + 1;
        return acc;
    }, {});

    const runErasmusAI = async () => {
        if (!project) return;
        setErasmusLoading(true);
        setErasmusReport(null);
        try {
            const response = await fetch('/api/erasmus/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectData: project }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setErasmusReport(data.analysis);
            trackEvent('erasmus_ai_analysis_run', { project_id: id });
        } catch (error) {
            console.error('Erasmus AI Error:', error);
            alert('Erasmus+ analizi yapılamadı.');
        } finally {
            setErasmusLoading(false);
        }
    };

    const runAI = async () => {
        setAiLoading(true);
        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: id })
            });
            const data = await response.json();
            if (data.report) {
                setAiReport(data.report);
                setModal('ai-report');
            } else {
                alert("AI Error: " + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert("AI Analysis failed.");
        } finally {
            setAiLoading(false);
        }
    };

    const exportCSV = (data: any[], filename: string) => {
        if (!data.length) return;
        const keys = Object.keys(data[0]);
        const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    };

    return (
        <div className="flex h-screen text-gray-900 font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">

                    {/* ─── PROJECT HEADER ─── */}
                    <div className="bg-white border-b border-gray-100 shadow-sm">
                        <div className="max-w-7xl mx-auto px-6 pt-5 pb-0">
                            <Link href="/projects" className="inline-flex items-center text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-4">
                                <ArrowLeft size={15} className="mr-1" /> Back to Projects
                            </Link>

                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-5">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">{project.program || 'No Program'}</span>
                                        <StatusBadge status={project.status || 'Unknown'} />
                                        {daysLeft !== null && (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${daysLeft < 30 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 mb-1">{project.name}</h1>
                                    <p className="text-gray-500 text-sm max-w-2xl leading-relaxed line-clamp-2">{project.description || 'No description.'}</p>

                                    <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span className="font-medium">{project.start_date ? format(new Date(project.start_date), 'dd MMM yyyy') : '—'}</span>
                                            <span className="text-gray-300">→</span>
                                            <span className="font-medium">{project.end_date ? format(new Date(project.end_date), 'dd MMM yyyy') : '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Wallet size={14} className="text-gray-400" />
                                            <span className="font-bold text-gray-900">€{Number(project.budget || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4 max-w-md">
                                        <div className="flex justify-between text-xs mb-1.5 text-gray-500">
                                            <span>Progress ({completedActivities}/{totalActivities} activities)</span>
                                            <span className="font-bold text-indigo-600">{progress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#4F6EF7,#818CF8)' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* AI Actions */}
                                    <div className="flex flex-col gap-2 p-2 bg-blue-50 border border-blue-100 rounded-xl">
                                        <button
                                            onClick={() => {
                                                setModal('ai-analysis');
                                                runAI();
                                            }}
                                            disabled={aiLoading}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
                                            Genel Sağlık Analizi
                                        </button>

                                        {project?.program?.includes('Erasmus') && (
                                            <button
                                                onClick={() => {
                                                    setModal('erasmus-ai');
                                                    runErasmusAI();
                                                }}
                                                disabled={erasmusLoading}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
                                            >
                                                {erasmusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
                                                Erasmus+ 2026 Analizi
                                            </button>
                                        )}
                                    </div>
                                    <Link href={`/reports/new?project_id=${id}`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-all">
                                        <FileText size={15} /> Generate Report
                                    </Link>
                                    <Link href={`/webgate?project_id=${id}`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-all">
                                        <ExternalLink size={15} /> Webgate
                                    </Link>
                                    <Link href={`/projects/${id}/edit`}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105"
                                        style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                                        <Settings size={15} /> Edit
                                    </Link>
                                </div>
                            </div>

                            {/* ─── TABS ─── */}
                            <nav className="flex gap-0 overflow-x-auto -mb-px">
                                {TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`whitespace-nowrap px-4 py-3.5 border-b-2 text-sm font-semibold transition-all ${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                            }`}>
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* ─── TAB CONTENT ─── */}
                    <div className="max-w-7xl mx-auto px-6 py-6">

                        {/* ══ OVERVIEW ══ */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Activities', value: `${completedActivities}/${totalActivities}`, sub: 'completed', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
                                        { label: 'Participants', value: participants.length, sub: 'registered', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50' },
                                        { label: 'Budget Spent', value: `€${totalSpent.toLocaleString()}`, sub: `of €${Number(project.budget || 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                        { label: 'Partners', value: partners.length || '—', sub: 'active', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
                                    ].map(card => (
                                        <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                                            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                                                <card.icon size={18} className={card.color} />
                                            </div>
                                            <p className="text-2xl font-black text-gray-900">{card.value}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{card.label} · {card.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <h3 className="font-bold text-gray-900 border-l-4 border-orange-400 pl-3 mb-4">Recent Activities</h3>
                                        <div className="space-y-3">
                                            {activities.slice(0, 3).map(a => (
                                                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                                                        {a.start_date ? format(new Date(a.start_date), 'MMM').toUpperCase() : '—'}
                                                        <span className="text-base leading-none">{a.start_date ? format(new Date(a.start_date), 'dd') : ''}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-gray-900 truncate">{a.title}</p>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={9} /> {a.location || 'TBD'}</p>
                                                    </div>
                                                    <StatusBadge status={a.status || 'Planlandı'} />
                                                </div>
                                            ))}
                                            {activities.length === 0 && <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">No activities yet</p>}
                                        </div>
                                    </div>
                                    <ProjectCharts budgetData={budgetChartData} COLORS={COLORS} />
                                </div>

                                {project.description && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <h3 className="font-bold text-gray-900 border-l-4 border-blue-400 pl-3 mb-3">Project Description</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══ ACTIVITIES ══ */}
                        {activeTab === 'activities' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {['All', 'Aktif', 'Tamamlandı', 'Planlandı'].map(f => (
                                            <button key={f} onClick={() => setActivityFilter(f)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activityFilter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setModal('activity')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
                                        style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                                        <Plus size={15} /> Add Activity
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                                <th className="px-5 py-3 text-left font-semibold">Activity</th>
                                                <th className="px-5 py-3 text-left font-semibold">Date</th>
                                                <th className="px-5 py-3 text-left font-semibold">Location</th>
                                                <th className="px-5 py-3 text-left font-semibold">Participants</th>
                                                <th className="px-5 py-3 text-left font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {activities
                                                .filter(a => activityFilter === 'All' || a.status === activityFilter)
                                                .map((a, idx) => (
                                                    <tr key={a.id} className={`hover:bg-indigo-50/40 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                                                        <td className="px-5 py-3.5 font-semibold text-gray-900">{a.title}</td>
                                                        <td className="px-5 py-3.5 text-gray-500 text-xs">{a.start_date ? format(new Date(a.start_date), 'dd MMM yyyy') : '—'}</td>
                                                        <td className="px-5 py-3.5 text-gray-500 text-xs flex items-center gap-1"><MapPin size={10} />{a.location || 'TBD'}</td>
                                                        <td className="px-5 py-3.5 text-gray-600 font-medium">{a.participant_count || 0}</td>
                                                        <td className="px-5 py-3.5"><StatusBadge status={a.status || 'Planlandı'} /></td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    {activities.length === 0 && <p className="text-center text-gray-400 py-12">No activities yet</p>}
                                </div>
                            </div>
                        )}

                        {/* ══ PARTICIPANTS ══ */}
                        {activeTab === 'participants' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                                        <p className="text-3xl font-black text-indigo-600">{participants.length}</p>
                                        <p className="text-xs text-gray-500 mt-1">Total Participants</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                                        <p className="text-3xl font-black text-emerald-600">{Object.keys(countryDist).length}</p>
                                        <p className="text-xs text-gray-500 mt-1">Countries</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                                        <p className="text-3xl font-black text-orange-600">{participants.filter(p => p.fewer_opportunities).length}</p>
                                        <p className="text-xs text-gray-500 mt-1">Fewer Opportunities</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Participants ({participants.length})</h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => exportCSV(participants, `participants-${id}.csv`)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-all">
                                            <Download size={14} /> Export CSV
                                        </button>
                                        <button onClick={() => setModal('participant')}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
                                            style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                                            <Plus size={15} /> Add Participant
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                                <th className="px-5 py-3 text-left font-semibold">Name</th>
                                                <th className="px-5 py-3 text-left font-semibold">Country</th>
                                                <th className="px-5 py-3 text-left font-semibold">Activity</th>
                                                <th className="px-5 py-3 text-left font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {participants.map((p, idx) => (
                                                <tr key={p.id} className={`hover:bg-indigo-50/40 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                                style={{ background: `hsl(${((p.first_name || '').charCodeAt(0) || 0) * 11 % 360}, 65%, 60%)` }}>
                                                                {p.first_name?.[0]}{p.last_name?.[0]}
                                                            </div>
                                                            <span className="font-semibold text-gray-900">{p.first_name} {p.last_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">{p.country || '—'}</span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-500 text-xs">{p.activity?.title || '—'}</td>
                                                    <td className="px-5 py-3.5"><StatusBadge status={p.status || 'Aktif'} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {participants.length === 0 && <p className="text-center text-gray-400 py-12">No participants yet</p>}
                                </div>
                            </div>
                        )}

                        {/* ══ BUDGET ══ */}
                        {activeTab === 'budget' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Total Budget', value: `€${Number(project.budget || 0).toLocaleString()}`, color: 'text-indigo-600' },
                                        { label: 'Total Spent', value: `€${totalSpent.toLocaleString()}`, color: 'text-emerald-600' },
                                        { label: 'Remaining', value: `€${(Number(project.budget || 0) - totalSpent).toLocaleString()}`, color: Number(project.budget || 0) - totalSpent < 0 ? 'text-red-600' : 'text-orange-600' },
                                    ].map(c => (
                                        <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                                            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Expenses ({budgetItems.length})</h3>
                                    <button onClick={() => setModal('budget')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
                                        style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                                        <Plus size={15} /> Add Expense
                                    </button>
                                </div>
                                {budgetChartData.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <h3 className="font-bold text-gray-900 border-l-4 border-indigo-400 pl-3 mb-4">Spending by Category</h3>
                                        <ProjectCharts budgetData={budgetChartData} COLORS={COLORS} />
                                    </div>
                                )}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                                <th className="px-5 py-3 text-left font-semibold">Description</th>
                                                <th className="px-5 py-3 text-left font-semibold">Category</th>
                                                <th className="px-5 py-3 text-left font-semibold">Amount</th>
                                                <th className="px-5 py-3 text-left font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {budgetItems.map((b, idx) => (
                                                <tr key={b.id} className={`hover:bg-indigo-50/40 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                                                    <td className="px-5 py-3.5 font-semibold text-gray-900">{b.description || b.title || '—'}</td>
                                                    <td className="px-5 py-3.5"><span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">{b.category || '—'}</span></td>
                                                    <td className="px-5 py-3.5 font-bold text-emerald-700">€{Number(b.amount).toLocaleString()}</td>
                                                    <td className="px-5 py-3.5 text-gray-500 text-xs">{b.created_at ? format(new Date(b.created_at), 'dd MMM yyyy') : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {budgetItems.length === 0 && <p className="text-center text-gray-400 py-12">No expenses yet</p>}
                                </div>
                            </div>
                        )}

                        {/* ══ PARTNERS ══ */}
                        {activeTab === 'partners' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Partner Organizations ({partners.length})</h3>
                                    <button onClick={() => setModal('partner')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
                                        style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                                        <Plus size={15} /> Add Partner
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {partners.map(p => (
                                        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                                                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
                                                    {p.country || '??'}
                                                </div>
                                                <span className="text-xs font-bold px-2 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg">{p.type || 'Partner'}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-1">{p.name}</h4>
                                            <p className="text-xs text-gray-500">{p.country} · {p.city || '—'}</p>
                                            {p.contact_email && <p className="text-xs text-indigo-600 mt-2">{p.contact_email}</p>}
                                        </div>
                                    ))}
                                    {partners.length === 0 && (
                                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-400">No partners yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ CONTRACTS ══ */}
                        {activeTab === 'contracts' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Contracts ({contracts.length})</h3>
                                    <button onClick={() => setModal('contract')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
                                        style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                                        <Plus size={15} /> Add Contract
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                                <th className="px-5 py-3 text-left font-semibold">Contract</th>
                                                <th className="px-5 py-3 text-left font-semibold">Type</th>
                                                <th className="px-5 py-3 text-left font-semibold">Status</th>
                                                <th className="px-5 py-3 text-left font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {contracts.map((c, idx) => (
                                                <tr key={c.id} className={`hover:bg-indigo-50/40 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                                                    <td className="px-5 py-3.5 font-semibold text-gray-900">{c.title}</td>
                                                    <td className="px-5 py-3.5 text-gray-500 text-xs">{c.type || '—'}</td>
                                                    <td className="px-5 py-3.5"><StatusBadge status={c.status || 'Aktif'} /></td>
                                                    <td className="px-5 py-3.5 text-gray-500 text-xs">{c.contract_date ? format(new Date(c.contract_date), 'dd MMM yyyy') : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {contracts.length === 0 && <p className="text-center text-gray-400 py-12">No contracts yet</p>}
                                </div>
                            </div>
                        )}

                        {/* ══ REPORTS ══ */}
                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Reports ({reports.length})</h3>
                                    <Link href={`/reports/new?project_id=${id}`}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
                                        style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                                        <Plus size={15} /> Generate Report
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {reports.map(r => (
                                        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><FileText size={16} className="text-indigo-500" /></div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{r.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy') : '—'} · {r.type || 'Report'}</p>
                                                </div>
                                            </div>
                                            <Link href={`/reports/${r.id}`} className="text-xs text-indigo-600 font-semibold hover:underline">View →</Link>
                                        </div>
                                    ))}
                                    {reports.length === 0 && (
                                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center py-16">
                                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-400">No reports yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ LMS ══ */}
                        {activeTab === 'lms' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Linked Moodle Courses</h3>
                                    <Link href="/lms" className="text-sm text-indigo-600 font-semibold hover:underline">Browse All Courses →</Link>
                                </div>
                                {tabLoading['lms'] ? (
                                    <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {courses.map(course => (
                                            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><BookOpen size={18} className="text-indigo-500" /></div>
                                                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">Active</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm" dangerouslySetInnerHTML={{ __html: course.fullname || 'Unknown Course' }} />
                                                <p className="text-xs text-gray-400 mb-4 flex-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: course.summary || 'No description.' }} />
                                                <a href={`https://lms.moderngelisim.org.tr/course/view.php?id=${course.id}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors border border-indigo-100">
                                                    Open Course <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        ))}
                                        {courses.length === 0 && !tabLoading['lms'] && (
                                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                                                <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-400">No courses linked</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══ WEBGATE ══ */}
                        {activeTab === 'webgate' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900 border-l-4 border-teal-400 pl-3 mb-5">Webgate Export Options</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'Participant List', desc: 'All participants for this project', icon: Users, count: participants.length, data: participants, file: `participants-${id}.csv` },
                                            { label: 'Activity Report', desc: 'All activities with details', icon: Activity, count: activities.length, data: activities, file: `activities-${id}.csv` },
                                            { label: 'Budget Summary', desc: 'Financial summary export', icon: Wallet, count: budgetItems.length, data: budgetItems, file: `budget-${id}.csv` },
                                        ].map(exp => (
                                            <div key={exp.label} className="border border-gray-100 rounded-2xl p-5 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                                                    <exp.icon size={18} className="text-teal-600" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">{exp.label}</h4>
                                                <p className="text-xs text-gray-500 mb-4">{exp.desc} · <span className="font-bold">{exp.count} records</span></p>
                                                <button onClick={() => exportCSV(exp.data, exp.file)}
                                                    className="w-full flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors">
                                                    <Download size={14} /> Export CSV
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                                    <LinkIcon className="w-10 h-10 text-teal-500 mx-auto mb-3" />
                                    <h4 className="font-bold text-gray-900 mb-2">Full Webgate Export</h4>
                                    <p className="text-sm text-gray-500 mb-4">Export all project data in Webgate-compatible format</p>
                                    <Link href={`/webgate?project_id=${id}`}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all"
                                        style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
                                        <ExternalLink size={15} /> Open Webgate Export
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Modal
                open={modal === 'erasmus-ai'}
                onClose={() => setModal(null)}
                title="🇪🇺 Erasmus+ 2026 Uzman Analizi"
            >
                {erasmusLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-gray-500 animate-pulse font-medium">Program kılavuzu taranıyor ve analiz yapılıyor...</p>
                    </div>
                ) : erasmusReport ? (
                    <div className="prose prose-blue max-w-none prose-sm">
                        <ReactMarkdown>{erasmusReport}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Analiz başlatılamadı.</p>
                    </div>
                )}
            </Modal>

            {/* ─── SLIDE-OVERS (PREMIUM UI) ─── */}
            <SlideOver
                open={modal === 'activity'}
                onClose={() => setModal(null)}
                title="Yeni Faaliyet"
                description="Projeniz için yeni bir faaliyet veya etkinlik tanımlayın."
            >
                <ActivityInlineForm
                    projectId={id}
                    onCancel={() => setModal(null)}
                    onSuccess={() => {
                        setModal(null);
                        loadTabData('activities');
                    }}
                />
            </SlideOver>

            <SlideOver
                open={modal === 'participant'}
                onClose={() => setModal(null)}
                title="Yeni Katılımcı"
                description="Faaliyetlerinize katılan yeni bir kişiyi sisteme kaydedin."
            >
                <ParticipantInlineForm
                    projectId={id}
                    onCancel={() => setModal(null)}
                    onSuccess={() => {
                        setModal(null);
                        loadTabData('participants');
                    }}
                />
            </SlideOver>

            <SlideOver
                open={modal === 'budget'}
                onClose={() => setModal(null)}
                title="Yeni Harcama Kaydı"
                description="Gerçekleşen proje harcamalarınızı ve faturalarınızı girin."
            >
                <BudgetInlineForm
                    projectId={id}
                    onCancel={() => setModal(null)}
                    onSuccess={() => {
                        setModal(null);
                        loadTabData('budget');
                    }}
                />
            </SlideOver>

            {/* ─── REMAINING MODALS ─── */}
            <Modal open={modal === 'partner'} onClose={() => setModal(null)} title="Add Partner">
                <p className="text-sm text-gray-500 mb-4">Add a new partner organization.</p>
                <Link href={`/partners/new?project_id=${id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                    Go to Add Partner Page
                </Link>
            </Modal>
            <Modal open={modal === 'contract'} onClose={() => setModal(null)} title="Add Contract">
                <p className="text-sm text-gray-500 mb-4">Add a new contract to this project.</p>
                <Link href={`/contracts/new?project_id=${id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg,#4F6EF7,#818CF8)' }}>
                    Go to Add Contract Page
                </Link>
            </Modal>
            <Modal open={modal === 'ai-report'} onClose={() => setModal(null)} title="AI Proje Sağlık Analizi 🤖">
                <div className="prose prose-sm max-w-none ai-report-container">
                    {aiReport && (
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-4" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 mt-6 border-b pb-1" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2 mt-4" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-3 text-gray-600 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="text-gray-600" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                            }}
                        >
                            {aiReport}
                        </ReactMarkdown>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-2 text-xs">
                    <button onClick={() => setModal(null)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold transition-colors hover:bg-gray-200">Kapat</button>
                    <button onClick={() => setModal(null)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:bg-indigo-700">Anladım</button>
                </div>
            </Modal>
        </div>
    );
}
