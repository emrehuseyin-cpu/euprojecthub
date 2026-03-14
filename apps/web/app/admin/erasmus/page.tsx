"use client";

import { useState, useEffect } from 'react';
import {
    BookOpen,
    Coins,
    Upload,
    History,
    Plus,
    Save,
    Trash2,
    Search,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    FileText,
    ExternalLink,
    MapPin,
    Users as UsersIcon,
    Euro
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function ErasmusAdminPage() {
    const [activeTab, setActiveTab] = useState('actions');
    const [actions, setActions] = useState<any[]>([]);
    const [travelCosts, setTravelCosts] = useState<any[]>([]);
    const [countryGroups, setCountryGroups] = useState<any[]>([]);
    const [dailyRates, setDailyRates] = useState<any[]>([]);
    const [awardCriteria, setAwardCriteria] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'actions') {
                const { data } = await supabase.from('erasmus_actions').select('*').eq('year', 2026).order('code');
                setActions(data || []);
            } else if (activeTab === 'costs') {
                const { data } = await supabase.from('erasmus_travel_costs').select('*').eq('year', 2026).order('min_km');
                setTravelCosts(data || []);
            } else if (activeTab === 'groups') {
                const { data } = await supabase.from('erasmus_country_groups').select('*').eq('year', 2026).order('group_number');
                setCountryGroups(data || []);
            } else if (activeTab === 'rates') {
                const { data } = await supabase.from('erasmus_youth_daily_rates').select('*').eq('year', 2026).order('country');
                setDailyRates(data || []);
            } else if (activeTab === 'criteria') {
                const { data } = await supabase.from('erasmus_award_criteria').select('*').order('action_code').order('sort_order');
                setAwardCriteria(data || []);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredActions = actions.filter(a => 
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.name_en.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Erasmus+ 2026 Database</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage all 37 programme actions, budget rules, travel bands, and country-specific rates.</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={fetchData}
                                    className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all text-sm">
                                    <Plus size={18} /> New Action
                                </button>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm w-fit">
                            <button
                                onClick={() => setActiveTab('actions')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'actions' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <BookOpen size={16} /> Action List
                            </button>
                            <button
                                onClick={() => setActiveTab('costs')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'costs' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <MapPin size={16} /> Travel Costs
                            </button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'groups' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <UsersIcon size={16} /> Country Groups
                            </button>
                            <button
                                onClick={() => setActiveTab('rates')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'rates' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Euro size={16} /> Daily Rates
                            </button>
                            <button
                                onClick={() => setActiveTab('criteria')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'criteria' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <CheckCircle size={16} /> Award Criteria
                            </button>
                        </div>

                        {/* Search & Statistics Bar */}
                        {activeTab === 'actions' && (
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text"
                                        placeholder="Search by code or name..."
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-2">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-none">Total Actions</span>
                                    <span className="text-xl font-black text-indigo-700 leading-none">{actions.length}</span>
                                </div>
                            </div>
                        )}

                        {/* Main Content Table Area */}
                        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                                    <div className="p-4 bg-indigo-50 rounded-2xl">
                                        <RefreshCw size={32} className="animate-spin text-indigo-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 tracking-tight uppercase">Fetching Erasmus+ Data...</p>
                                </div>
                            ) : activeTab === 'actions' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="py-4 px-6 text-center w-24">Code</th>
                                                <th className="py-4 px-2">Action Name</th>
                                                <th className="py-4 px-2">KA</th>
                                                <th className="py-4 px-2">Managing Body</th>
                                                <th className="py-4 px-2">Deadline (R1)</th>
                                                <th className="py-4 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {filteredActions.map((a) => (
                                                <tr key={a.id} className="hover:bg-indigo-50/30 transition-all group">
                                                    <td className="py-4 px-6 text-center">
                                                        <span className="font-mono text-xs font-black bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all shadow-sm">
                                                            {a.code}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <div className="font-bold text-gray-900 group-hover:text-indigo-900 transition-all">{a.name_en}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide flex items-center gap-1.5">
                                                            {a.budget_type} • {a.min_duration_months || '?'}-{a.max_duration_months || '?'} Months
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-tighter">
                                                            {a.key_action}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                                                            a.managing_body === 'EACEA' 
                                                                ? 'bg-purple-50 text-purple-700' 
                                                                : 'bg-emerald-50 text-emerald-700'
                                                        }`}>
                                                            {a.managing_body}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 font-black text-gray-900">{a.deadline_round1 || '—'}</td>
                                                    <td className="py-4 px-6 text-right space-x-1">
                                                        <button className="p-2.5 text-gray-400 hover:text-indigo-600 bg-transparent hover:bg-white rounded-xl transition-all"><Save size={18} /></button>
                                                        <button className="p-2.5 text-gray-400 hover:text-red-600 bg-transparent hover:bg-white rounded-xl transition-all"><Trash2 size={18} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : activeTab === 'costs' ? (
                                <div className="p-6">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="pb-4 px-2">Distance Band</th>
                                                <th className="pb-4 px-2 tracking-normal">Non-Green Travel</th>
                                                <th className="pb-4 px-2 tracking-normal">Green Travel</th>
                                                <th className="pb-4 px-2">Notes</th>
                                                <th className="pb-4 px-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {travelCosts.map((cost) => (
                                                <tr key={cost.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-2 font-black text-gray-900">{cost.min_km} — {cost.max_km} km</td>
                                                    <td className="py-4 px-2 text-gray-500 font-bold">€{cost.non_green_eur}</td>
                                                    <td className="py-4 px-2 text-indigo-600 font-black">€{cost.green_eur}</td>
                                                    <td className="py-4 px-2 text-xs text-gray-400 italic">{cost.note}</td>
                                                    <td className="py-4 px-2 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Save size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : activeTab === 'groups' ? (
                                <div className="p-6">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="pb-4 px-2">Country Name</th>
                                                <th className="pb-4 px-2">Group</th>
                                                <th className="pb-4 px-2 tracking-normal">Staff (Min-Max)</th>
                                                <th className="pb-4 px-2 tracking-normal">Student (Min-Max)</th>
                                                <th className="pb-4 px-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {countryGroups.map((g) => (
                                                <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-2 font-black text-gray-900">{g.country}</td>
                                                    <td className="py-4 px-2">
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">GROUP {g.group_number}</span>
                                                    </td>
                                                    <td className="py-4 px-2 text-xs font-bold text-gray-700">€{g.staff_min_eur_day}-{g.staff_max_eur_day}</td>
                                                    <td className="py-4 px-2 text-xs font-bold text-indigo-600">€{g.vet_learner_min_eur_day}-{g.vet_learner_max_eur_day}</td>
                                                    <td className="py-4 px-2 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Save size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : activeTab === 'rates' ? (
                                <div className="p-6">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="pb-4 px-2">Country Name</th>
                                                <th className="pb-4 px-2 tracking-normal">Youth Exchange</th>
                                                <th className="pb-4 px-2 tracking-normal">Youth Worker</th>
                                                <th className="pb-4 px-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {dailyRates.map((r) => (
                                                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-2 font-black text-gray-900">{r.country}</td>
                                                    <td className="py-4 px-2 text-gray-700 font-bold">€{r.youth_exchange_eur_day}/day</td>
                                                    <td className="py-4 px-2 text-indigo-600 font-black">€{r.youth_worker_eur_day}/day</td>
                                                    <td className="py-4 px-2 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Save size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : activeTab === 'criteria' ? (
                                <div className="p-6">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="pb-4 px-2">Action</th>
                                                <th className="pb-4 px-2">Criterion</th>
                                                <th className="pb-4 px-2 text-center">Min-Max Score</th>
                                                <th className="pb-4 px-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {awardCriteria.map((c) => (
                                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-2 font-black text-gray-600">{c.action_code}</td>
                                                    <td className="py-4 px-2 text-gray-900 font-bold">{c.criterion_name}</td>
                                                    <td className="py-4 px-2 text-center text-xs">
                                                        <span className="font-mono bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{c.min_score}</span>
                                                        <span className="mx-1.5 text-gray-300">/</span>
                                                        <span className="font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{c.max_score}</span>
                                                    </td>
                                                    <td className="py-4 px-2 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Save size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : null}
                            
                            {!loading && (activeTab === 'actions' ? filteredActions.length : 0) === 0 && (
                                <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
                                    <div className="p-6 bg-gray-50 rounded-full">
                                        <AlertTriangle size={48} className="text-gray-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-gray-900">No Data Found</h3>
                                        <p className="text-sm text-gray-400 max-w-xs mx-auto">Either the table is empty or the year 2026 filter returned no results.</p>
                                    </div>
                                    <button 
                                        onClick={fetchData}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                                    >
                                        Try Refreshing
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
