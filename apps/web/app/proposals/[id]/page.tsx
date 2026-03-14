"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { 
    LayoutDashboard, FileText, Wallet, Network, 
    CheckSquare, Folder, ArrowLeft, Loader2, 
    Save, Send, Clock, AlertTriangle, Info,
    ChevronRight, ChevronLeft, Bot, Sparkles,
    Users, Plus, Trash2, Globe, Hash, FileEdit, CheckCircle2
} from 'lucide-react';

type TabType = 'overview' | 'form' | 'budget' | 'packages' | 'tasks' | 'documents';

export default function ProposalEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('proposals')
                .select(`
                    *,
                    proposal_organisations(
                        role,
                        org:org_registry(*)
                    )
                `)
                .eq('id', id)
                .single();
            
            if (data) setProposal(data);
            setLoading(false);
        }
        if (id) load();
    }, [id]);

    const handleConvert = async () => {
        if (!confirm('This will create an active project from this proposal. Continue?')) return;
        setConverting(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    name: proposal.title,
                    program: proposal.action_code,
                    start_date: proposal.start_date || new Date().toISOString(),
                    end_date: proposal.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    budget: proposal.total_budget || 0,
                    description: proposal.project_summary || '',
                    status: 'Aktif',
                    proposal_id: proposal.id
                }])
                .select()
                .single();
            
            if (data) {
                // Mark proposal as converted
                await supabase.from('proposals').update({ status: 'Submitted' }).eq('id', id);
                router.push(`/projects/${data.id}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setConverting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Entering Editor...</p>
                </div>
            </div>
        );
    }

    const TABS = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'form', label: 'Form Builder', icon: FileText },
        ...(proposal?.action_code?.startsWith('KA220') ? [{ id: 'packages', label: 'Work Packages', icon: Network }] : []),
        { id: 'budget', label: 'Budget Builder', icon: Wallet },
        { id: 'tasks', label: 'Tasks & Team', icon: CheckSquare },
        { id: 'documents', label: 'Documents', icon: Folder },
    ];

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                
                {/* Editor Header */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/proposals')} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-gray-900 line-clamp-1">{proposal?.title}</h1>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 uppercase">
                                    {proposal?.action_code}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                Acronym: <span className="text-gray-600">{proposal?.project_acronym || '—'}</span> • 
                                Deadline: <span className="text-red-500">{proposal?.deadline ? new Date(proposal.deadline).toLocaleDateString() : 'TBA'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Completion</span>
                                <span className="text-[10px] font-black text-blue-500">45%</span>
                            </div>
                            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-gray-900/10 hover:bg-gray-800 transition-all">
                            <Send size={16} /> Submit Proposal
                        </button>
                        <button 
                            onClick={handleConvert}
                            disabled={converting}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50">
                            {converting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} 
                            Convert to Project
                        </button>
                    </div>
                </header>

                {/* Editor Navigation */}
                <nav className="bg-white border-b border-gray-100 px-8 flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all relative whitespace-nowrap
                                    ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                <Icon size={16} />
                                {tab.label}
                                {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 relative no-scrollbar">
                    <div className="max-w-6xl mx-auto h-full">
                        {activeTab === 'overview' && <OverviewTab proposal={proposal} />}
                        {activeTab === 'form' && <FormBuilderTab proposal={proposal} />}
                        {activeTab === 'packages' && <WorkPackagesTab proposal={proposal} />}
                        {activeTab === 'budget' && <BudgetTab proposal={proposal} />}
                        {activeTab === 'tasks' && <TasksTab proposal={proposal} />}
                        {activeTab === 'documents' && <DocumentsTab proposal={proposal} />}
                    </div>

                    {/* AI Floating Button */}
                    <button className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-2xl shadow-indigo-500/30 flex items-center justify-center group hover:scale-110 active:scale-95 transition-all">
                        <Bot size={28} className="group-hover:animate-bounce" />
                        <div className="absolute -top-12 right-0 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <span className="text-[10px] font-black text-violet-600 uppercase flex items-center gap-1">
                                <Sparkles size={12} /> AI Assistant Ready
                            </span>
                        </div>
                    </button>
                </main>
            </div>
        </div>
    );
}

// ─── TAB COMPONENTS ───────────────────────────────

function OverviewTab({ proposal }: { proposal: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                        <Clock className="text-blue-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Proposal Countdown</h3>
                    <p className="text-gray-400 text-sm mb-8">You have plenty of time to submit, but don&apos;t wait for the last minute!</p>
                    <div className="flex items-center gap-4 w-full max-w-sm">
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">12</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Days</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">14</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Hours</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">32</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Mins</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500"><Sparkles size={20} /></div>
                            <h4 className="font-black text-gray-900">AI Drafting</h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">I&apos;ve analyzed your project and can help you draft sections based on the current context.</p>
                        <button className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all">Start AI Draft</button>
                    </div>
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><Info size={20} /></div>
                            <h4 className="font-black text-gray-900">Program Info</h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">Current action follows the 2026 Erasmus+ Program Guide (Lump Sum Model II).</p>
                        <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all">View Guidelines</button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-black text-gray-900 flex items-center gap-2"><Users size={18} className="text-gray-400" /> Partners</h4>
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">{proposal?.proposal_organisations?.length || 0} TOTAL</span>
                    </div>
                    <div className="space-y-3">
                        {proposal?.proposal_organisations?.map((po: any) => (
                            <div key={po.org.id} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-50 hover:border-blue-100 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xs text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {po.org.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-gray-900 truncate">{po.org.name}</p>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{po.role} • {po.org.country}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormBuilderTab({ proposal }: { proposal: any }) {
    const supabase = createSupabaseBrowserClient();
    const [templates, setTemplates] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [activeGroup, setActiveGroup] = useState('A');
    const [draftingKey, setDraftingKey] = useState<string | null>(null);

    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    useEffect(() => {
        async function load() {
            setLoading(true);
            const { data: tplData } = await supabase.from('proposal_question_templates').select('*').eq('action_code', proposal.action_code).order('form_group').order('order_index');
            if (tplData) setTemplates(tplData);
            const { data: ansData } = await supabase.from('proposal_answers').select('*').eq('proposal_id', proposal.id);
            if (ansData) {
                const ansMap: Record<string, string> = {};
                ansData.forEach((a: any) => ansMap[a.question_key] = a.answer_text);
                setAnswers(ansMap);
            }
            setLoading(false);
        }
        if (proposal) load();
    }, [proposal]);

    const handleSave = async (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
        await supabase.from('proposal_answers').upsert({ proposal_id: proposal.id, question_key: key, answer_text: value, updated_at: new Date().toISOString() }, { onConflict: 'proposal_id,question_key' });
    };

    const handleAIDraft = async (tpl: any) => {
        setDraftingKey(tpl.question_key);
        try {
            const resp = await fetch('/api/proposals/draft', {
                method: 'POST',
                body: JSON.stringify({
                    proposalId: proposal.id,
                    questionKey: tpl.question_key,
                    questionText: tpl.question_text,
                    context: { title: proposal.title, acronym: proposal.project_acronym, action_code: proposal.action_code, partners: proposal.proposal_organisations?.map((po: any) => po.org.name) }
                })
            });
            const data = await resp.json();
            if (data.draft) handleSave(tpl.question_key, data.draft);
        } catch (err) { console.error(err); } finally { setDraftingKey(null); }
    };

    const currentTemplates = templates.filter(t => t.form_group === activeGroup);

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-blue-500" /></div>;

    return (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm h-[calc(100vh-280px)] flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-full md:w-72 bg-gray-50 border-r border-gray-100 flex flex-col">
                <div className="p-6 border-b border-gray-200/50">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Info size={14} /> Sections</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
                    {groups.map(g => {
                        const count = templates.filter(t => t.form_group === g).length;
                        if (count === 0) return null;
                        const completed = templates.filter(t => t.form_group === g && answers[t.question_key]).length;
                        return (
                            <button key={g} onClick={() => setActiveGroup(g)} className={`w-full text-left p-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${activeGroup === g ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}>
                                <span>Group {g}</span>
                                <span className="text-[10px] opacity-60">{completed}/{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-8 border-b border-gray-100 bg-white z-10">
                    <h3 className="text-xl font-black text-gray-900">Section {activeGroup}</h3>
                </div>
                <div className="flex-1 p-8 overflow-y-auto space-y-12 max-w-4xl no-scrollbar">
                    {currentTemplates.map(tpl => (
                        <div key={tpl.id} className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <label className="text-sm font-black text-gray-900 block px-1 leading-relaxed flex-1">{tpl.question_text}</label>
                                {tpl.is_ai_enabled && (
                                    <button onClick={() => handleAIDraft(tpl)} disabled={!!draftingKey} className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black hover:bg-violet-100 transition-all disabled:opacity-50">
                                        {draftingKey === tpl.question_key ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                                        AI DRAFT
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <textarea className="w-full p-6 bg-gray-50 border border-transparent rounded-[2rem] min-h-[160px] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700 leading-relaxed outline-none shadow-sm" placeholder="Type answer here..." value={answers[tpl.question_key] || ''} onChange={e => handleSave(tpl.question_key, e.target.value)} />
                                {answers[tpl.question_key] && <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100"><Check strokeWidth={4} className="w-2.5 h-2.5"/> Saved</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WorkPackagesTab({ proposal }: { proposal: any }) {
    const supabase = createSupabaseBrowserClient();
    const [wps, setWps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newWp, setNewWp] = useState({ wp_number: 1, title: '', lead_org_id: '', grant_amount: 0 });

    useEffect(() => {
        async function load() {
            setLoading(true);
            const { data } = await supabase.from('proposal_work_packages').select(`*, lead_org:org_registry(name), partner_shares:proposal_wp_partners(grant_share, org:org_registry(name))`).eq('proposal_id', proposal.id).order('wp_number');
            if (data) setWps(data);
            setLoading(false);
        }
        if (proposal) load();
    }, [proposal]);

    const handleAdd = async () => {
        const { data } = await supabase.from('proposal_work_packages').insert([{ ...newWp, proposal_id: proposal.id }]).select().single();
        if (data) {
            setWps(prev => [...prev, data]);
            setShowAdd(false);
            setNewWp({ wp_number: wps.length + 2, title: '', lead_org_id: '', grant_amount: 0 });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete WP?')) return;
        await supabase.from('proposal_work_packages').delete().eq('id', id);
        setWps(prev => prev.filter(w => w.id !== id));
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-blue-500" /></div>;

    const totalAllocated = wps.reduce((acc, w) => acc + Number(w.grant_amount), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase">Grant Allocation</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">€{totalAllocated.toLocaleString()} ALLOCATED</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"><Plus size={16} /> Add WP</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {wps.map(wp => (
                    <div key={wp.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black">WP{wp.wp_number}</div>
                                <div>
                                    <h4 className="font-black text-gray-900">{wp.title || '(No Title)'}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Lead: {wp.lead_org?.name || 'TBD'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <p className="text-lg font-black text-gray-900">€{Number(wp.grant_amount).toLocaleString()}</p>
                                <button onClick={() => handleDelete(wp.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showAdd && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-10">
                        <h3 className="text-2xl font-black text-gray-900 mb-6">New Work Package</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase">No</label><input type="number" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newWp.wp_number} onChange={e => setNewWp({...newWp, wp_number: Number(e.target.value)})}/></div>
                                <div className="col-span-3"><label className="text-[10px] font-black text-gray-400 uppercase">Title</label><input type="text" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newWp.title} onChange={e => setNewWp({...newWp, title: e.target.value})}/></div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase">Lead</label>
                                <select className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newWp.lead_org_id} onChange={e => setNewWp({...newWp, lead_org_id: e.target.value})}>
                                    <option value="">Select...</option>
                                    {proposal?.proposal_organisations?.map((po: any) => <option key={po.org.id} value={po.org.id}>{po.org.name}</option>)}
                                </select>
                            </div>
                            <div><label className="text-[10px] font-black text-gray-400 uppercase">Grant (€)</label><input type="number" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newWp.grant_amount} onChange={e => setNewWp({...newWp, grant_amount: Number(e.target.value)})}/></div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-gray-400 font-black">Cancel</button>
                            <button onClick={handleAdd} className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BudgetTab({ proposal }: { proposal: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <Wallet className="text-amber-500 mb-6" size={48} />
            <h3 className="text-xl font-black text-gray-900">Budget Builder</h3>
            <p className="text-gray-400 text-sm mt-2">Coming in Phase 5 update.</p>
        </div>
    );
}

function TasksTab({ proposal }: { proposal: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <CheckSquare className="text-emerald-500 mb-6" size={48} />
            <h3 className="text-xl font-black text-gray-900">Tasks & Team</h3>
            <p className="text-gray-400 text-sm mt-2">Coming in Phase 5 update.</p>
        </div>
    );
}

function DocumentsTab({ proposal }: { proposal: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <Folder className="text-blue-500 mb-6" size={48} />
            <h3 className="text-xl font-black text-gray-900">Documents</h3>
            <p className="text-gray-400 text-sm mt-2">Coming in Phase 5 update.</p>
        </div>
    );
}

function Check({ className, strokeWidth }: { className?: string, strokeWidth?: number }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
}
