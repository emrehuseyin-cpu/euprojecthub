"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { 
    ScrollText, ArrowRight, ArrowLeft, Check, 
    Rocket, Target, Users, Search, Loader2, 
    AlertCircle, Info, Calendar, Globe, Clock,
    CheckCircle2, Plus, Save, Hash, X
} from 'lucide-react';
import { OrgLookupModal } from '../../components/OrgLookupModal';

const STEPS = [
    { id: 'action', title: 'Action selection', icon: Target },
    { id: 'details', title: 'Basic details', icon: ScrollText },
    { id: 'partners', title: 'Add partners', icon: Users }
];

export default function NewProposalWizard() {
    const router = useRouter();
    // Use the standard supabase client as in other functional components
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actions, setActions] = useState<any[]>([]);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loadingActions, setLoadingActions] = useState(true);
    const [loadingOrgs, setLoadingOrgs] = useState(true);

    const [form, setForm] = useState({
        action_code: '',
        title: '',
        project_acronym: '',
        main_language: 'English',
        year: 2026,
        deadline: '',
        selectedOrgs: [] as string[]
    });

    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickAddForm, setQuickAddForm] = useState({
        legal_name: '',
        oid: '',
        pic: '',
        country: '',
        type: 'NGO'
    });
    const [quickAddLoading, setQuickAddLoading] = useState(false);
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

    const oidRegex = /^E\d{8}$/;
    const picRegex = /^\d{9}$/;
    const isOidValid = oidRegex.test(quickAddForm.oid);
    const isPicValid = picRegex.test(quickAddForm.pic);

    async function loadOrgs() {
        setLoadingOrgs(true);
        try {
            const { data, error } = await supabase
                .from('org_registry')
                .select('*')
                .order('legal_name');
            if (data) setOrgs(data);
        } finally {
            setLoadingOrgs(false);
        }
    }

    useEffect(() => {
        async function load() {
            setLoadingActions(true);
            try {
                const { data: actionsData, error: actionsError } = await supabase
                    .from('erasmus_actions')
                    .select('*')
                    .eq('year', 2026)
                    .order('code');
                if (actionsData) setActions(actionsData);
            } finally {
                setLoadingActions(false);
            }
            loadOrgs();
        }
        load();
    }, []);

    const handleQuickAdd = async () => {
        if (!quickAddForm.legal_name) return;
        setQuickAddLoading(true);
        const { data, error } = await supabase
            .from('org_registry')
            .insert([quickAddForm])
            .select()
            .single();

        if (!error && data) {
            setOrgs(prev => [...prev, data].sort((a,b) => a.legal_name.localeCompare(b.legal_name)));
            setForm(f => ({...f, selectedOrgs: [...f.selectedOrgs, data.id]}));
            setQuickAddForm({ legal_name: '', oid: '', pic: '', country: '', type: 'NGO' });
            setShowQuickAdd(false);
        } else if (error) {
            alert(error.message);
        }
        setQuickAddLoading(false);
    };

    const handleOrgSelect = (selectedOrg: any) => {
        setQuickAddForm(prev => ({
            ...prev,
            legal_name: selectedOrg.name,
            pic: selectedOrg.pic,
            country: selectedOrg.country,
        }));
        setIsLookupModalOpen(false);
    };

    const grouped = actions.reduce((acc, a) => {
        if (!acc[a.key_action]) acc[a.key_action] = [];
        acc[a.key_action].push(a);
        return acc;
    }, {} as Record<string, any[]>);

    const KA_LABELS: Record<string, string> = {
        KA1: 'KA1 — Learning Mobility',
        KA2: 'KA2 — Cooperation', 
        KA3: 'KA3 — Policy Support',
        JM:  'Jean Monnet',
    };

    const selectedAction = actions.find(a => a.code === form.action_code);

    const handleSubmit = async () => {
        setLoading(true);
        
        // 1. Create Proposal
        const { data: proposal, error: pError } = await supabase
            .from('proposals')
            .insert([{
                title: form.title,
                project_acronym: form.project_acronym,
                action_code: form.action_code,
                main_language: form.main_language,
                year: form.year,
                deadline: selectedAction?.deadline_round1 || null,
                status: 'draft'
            }])
            .select()
            .single();

        if (pError) {
            alert(pError.message);
            setLoading(false);
            return;
        }

        // 2. Add Selected Organisations
        if (form.selectedOrgs.length > 0) {
            const orgLinks = form.selectedOrgs.map(orgId => ({
                proposal_id: proposal.id,
                org_registry_id: orgId,
                role: 'partner' // Default role
            }));
            const { error: oError } = await supabase.from('proposal_orgs').insert(orgLinks);
            if (oError) {
                console.error('Wizard: Error linking orgs:', oError);
                // We don't block the whole process if org linking fails, but we log it
            }
        }

        router.push(`/proposals/${proposal.id}`);
    };

    const nextStep = () => {
        if (step === 1 && !form.action_code) return;
        if (step === 2 && !form.title) return;
        if (step < 3) setStep(step + 1);
        else handleSubmit();
    };

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Stepper */}
                        <div className="flex items-center justify-between mb-12 relative px-4">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                const isCompleted = step > i + 1;
                                const isActive = step === i + 1;
                                
                                return (
                                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl
                                            ${isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                                              isActive ? 'bg-blue-600 text-white shadow-blue-600/20 scale-110' : 'bg-white text-gray-300 border border-gray-100'}`}>
                                            {isCompleted ? <Check size={24} strokeWidth={3} /> : <Icon size={24} />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {s.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Content Area */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-8 md:p-12 relative overflow-hidden">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

                            {/* Step 1: Action Selection */}
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center max-w-lg mx-auto mb-10">
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">Select Grant Program</h2>
                                        <p className="text-gray-500">Choose the Erasmus+ action you want to apply for. Year 2026 rules will apply.</p>
                                    </div>

                                    {loadingActions ? (
                                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="animate-spin text-blue-500" size={32} />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading actions...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-10 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                            {Object.entries(grouped).map(([ka, acts]: any) => (
                                                <div key={ka} className="space-y-4">
                                                    <div className="flex items-center gap-3 ml-2">
                                                        <div className="h-px flex-1 bg-gray-100" />
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                            {KA_LABELS[ka] || ka}
                                                        </span>
                                                        <div className="h-px flex-1 bg-gray-100" />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {acts.map((action: any) => (
                                                            <button 
                                                                key={action.code}
                                                                onClick={() => setForm({...form, action_code: action.code})}
                                                                className={`p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${form.action_code === action.code ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-gray-50/30 hover:border-blue-100 hover:bg-white'}`}>
                                                                <div className="flex items-start justify-between mb-3 relative z-10">
                                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shadow-sm transition-all ${form.action_code === action.code ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-100 group-hover:border-blue-200'}`}>
                                                                        {action.code}
                                                                    </span>
                                                                    {form.action_code === action.code && (
                                                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white animate-in zoom-in-50 duration-300">
                                                                            <Check size={12} strokeWidth={4} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm font-black text-gray-900 line-clamp-2 relative z-10 leading-snug">{action.name_en}</p>
                                                                <div className="mt-3 flex items-center gap-2 relative z-10">
                                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight bg-gray-100/50 px-1.5 py-0.5 rounded">
                                                                        {action.managing_body}
                                                                    </span>
                                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight bg-gray-100/50 px-1.5 py-0.5 rounded">
                                                                       {action.budget_type?.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                                {/* Interactive hover background */}
                                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/40 group-hover:to-transparent transition-all duration-500" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedAction && (
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                                <Info size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-emerald-800">Program Rules Loaded</p>
                                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5 leading-relaxed">
                                                    Deadline: {selectedAction.deadline_round1 || 'TBA'} • 
                                                    Min Partners: {selectedAction.min_partners || '2'} • 
                                                    Funding: {selectedAction.funding_rate_pct || '100'}%
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Basic Details */}
                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="text-center max-w-lg mx-auto mb-10">
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">Project Identity</h2>
                                        <p className="text-gray-500">Give your idea a name and a catchy acronym. This will appear on all forms.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Project Full Title</label>
                                            <input 
                                                required
                                                type="text"
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                                placeholder="e.g. Digital Transformation in Youth Work..."
                                                value={form.title}
                                                onChange={e => setForm({...form, title: e.target.value})}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Project Acronym</label>
                                                <input 
                                                    type="text"
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                                    placeholder="DIGI-YOUTH"
                                                    value={form.project_acronym}
                                                    onChange={e => setForm({...form, project_acronym: e.target.value.toUpperCase()})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Application Language</label>
                                                <select 
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 appearance-none shadow-sm"
                                                    value={form.main_language}
                                                    onChange={e => setForm({...form, main_language: e.target.value})}
                                                >
                                                    <option>English</option>
                                                    <option>Turkish</option>
                                                    <option>German</option>
                                                    <option>French</option>
                                                    <option>Spanish</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Partners */}
                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Registered Partners</h4>
                                        <button 
                                            onClick={() => setShowQuickAdd(!showQuickAdd)}
                                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-tight transition-all"
                                        >
                                            {showQuickAdd ? <X size={12} /> : <Plus size={12} />}
                                            {showQuickAdd ? 'Close Form' : 'Quick Add Partner'}
                                        </button>
                                    </div>

                                    {showQuickAdd && (
                                        <div className="mb-6 p-6 bg-blue-50/30 border border-blue-100 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <div className="flex items-center justify-between mb-1.5 px-1">
                                                        <label className="block text-[9px] font-black text-blue-900/40 uppercase tracking-widest">Legal Name</label>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setIsLookupModalOpen(true)}
                                                            className="text-[8px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 uppercase tracking-tighter"
                                                        >
                                                            <Search size={10} /> Search EC Database →
                                                        </button>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        placeholder="Organisation Name..."
                                                        className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                                        value={quickAddForm.legal_name}
                                                        onChange={e => setQuickAddForm({...quickAddForm, legal_name: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5 px-1">
                                                        <label className="block text-[9px] font-black text-blue-900/40 uppercase tracking-widest">OID</label>
                                                        {quickAddForm.oid && (
                                                            <a href="https://webgate.ec.europa.eu/erasmus-esc/index/organisations/search-for-an-organisation" target="_blank" className="text-[8px] font-black text-blue-600 hover:underline uppercase">Verify ↗</a>
                                                        )}
                                                    </div>
                                                    <div className="relative">
                                                        <input 
                                                            type="text"
                                                            placeholder="E12345678"
                                                            className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all font-bold text-sm ${quickAddForm.oid ? (isOidValid ? 'border-emerald-200 focus:ring-emerald-500/10 focus:border-emerald-500' : 'border-red-200 focus:ring-red-500/10 focus:border-red-500') : 'border-blue-100 focus:ring-blue-500/10 focus:border-blue-500'}`}
                                                            value={quickAddForm.oid}
                                                            onChange={e => setQuickAddForm({...quickAddForm, oid: e.target.value.toUpperCase()})}
                                                        />
                                                        {quickAddForm.oid && (
                                                            <div className="absolute right-3 top-3">
                                                                {isOidValid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5 px-1">
                                                        <label className="block text-[9px] font-black text-blue-900/40 uppercase tracking-widest">PIC</label>
                                                        {quickAddForm.pic && isPicValid && (
                                                            <a href={`https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/${quickAddForm.pic}`} target="_blank" className="text-[8px] font-black text-blue-600 hover:underline uppercase">Verify ↗</a>
                                                        )}
                                                    </div>
                                                    <div className="relative">
                                                        <input 
                                                            type="text"
                                                            placeholder="9 digits"
                                                            className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all font-bold text-sm ${quickAddForm.pic ? (isPicValid ? 'border-emerald-200 focus:ring-emerald-500/10 focus:border-emerald-500' : 'border-red-200 focus:ring-red-500/10 focus:border-red-500') : 'border-blue-100 focus:ring-blue-500/10 focus:border-blue-500'}`}
                                                            value={quickAddForm.pic}
                                                            onChange={e => setQuickAddForm({...quickAddForm, pic: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                                                        />
                                                        {quickAddForm.pic && (
                                                            <div className="absolute right-3 top-3">
                                                                {isPicValid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleQuickAdd}
                                                disabled={quickAddLoading || !quickAddForm.legal_name}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                {quickAddLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                                Register Partner & Select
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {loadingOrgs ? (
                                            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                        ) : orgs.length > 0 ? (
                                            orgs.map(org => {
                                                const isSelected = form.selectedOrgs.includes(org.id);
                                                return (
                                                    <button 
                                                        key={org.id}
                                                        onClick={() => {
                                                            if (isSelected) setForm({...form, selectedOrgs: form.selectedOrgs.filter(id => id !== org.id)});
                                                            else setForm({...form, selectedOrgs: [...form.selectedOrgs, org.id]});
                                                        }}
                                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${isSelected ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-gray-50/30 hover:border-blue-100'}`}>
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                                            {org.legal_name[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="text-sm font-black text-gray-900">{org.legal_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{org.country || 'No Country'} • {org.oid || 'No OID'}</p>
                                                        </div>
                                                        {isSelected && <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check size={14} /></div>}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                                <p className="text-sm font-bold text-gray-400">Registry is empty</p>
                                                <button onClick={() => setShowQuickAdd(true)} className="text-xs text-blue-600 font-black hover:underline mt-2 inline-block">Add first organisation →</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                                        <Users className="text-blue-500 shrink-0" size={18} />
                                        <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                                            {form.selectedOrgs.length} partners selected. You can add or remove partners later from the proposal editor.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                                <button 
                                    onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-gray-400 hover:text-gray-900 font-black text-sm transition-all group">
                                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                    {step === 1 ? 'Cancel' : 'Previous Step'}
                                </button>
                                <button 
                                    onClick={nextStep}
                                    disabled={loading || (step === 1 && !form.action_code) || (step === 2 && !form.title)}
                                    className="flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-[1.25rem] font-black text-sm shadow-2xl shadow-gray-900/20 active:scale-95 disabled:opacity-50 transition-all">
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 
                                     step === 3 ? <Rocket size={18} /> : <ArrowRight size={18} />}
                                    {step === 3 ? 'Launch Proposal Hub' : 'Next Step'}
                                </button>
                            </div>
                        </div>

                        {/* Hint Box */}
                        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> Auto-Save Enabled</span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date().getFullYear()} Rules Applied</span>
                        </div>
                    </div>
                </main>
            </div>

            <OrgLookupModal 
                isOpen={isLookupModalOpen}
                onClose={() => setIsLookupModalOpen(false)}
                onSelect={handleOrgSelect}
            />
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
