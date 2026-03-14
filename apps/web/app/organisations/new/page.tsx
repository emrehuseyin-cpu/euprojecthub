"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { 
    Building2, ArrowLeft, Search, Loader2, CheckCircle2, 
    AlertCircle, Save, X, Globe, MapPin, Mail, Hash, 
    Info, Sparkles, Wand2, Globe2, Link as LinkIcon
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { getOrganisationByPIC } from '@euprojecthub/core';
import OrgSearchModal from '../../components/OrgSearchModal';

export default function NewOrganisationPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [searchingPic, setSearchingPic] = useState(false);
    const [picSuccess, setPicSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

    const [form, setForm] = useState({
        oid: '',
        pic: '',
        legal_name: '',
        type: 'NGO',
        country: '',
        city: '',
        email: '',
        website: '',
        address: ''
    });

    const oidRegex = /^E\d{8}$/;
    const picRegex = /^\d{9}$/;
    const isOidValid = oidRegex.test(form.oid);
    const isPicValid = picRegex.test(form.pic);

    const handlePicLookup = async (pic: string) => {
        if (!/^\d{9}$/.test(pic)) return;
        setSearchingPic(true);
        setPicSuccess(null);
        setError(null);

        try {
            const data = await getOrganisationByPIC(pic);
            if (data) {
                setForm(f => ({
                    ...f,
                    pic: data.pic,
                    legal_name: data.name,
                    city: data.city || f.city,
                    country: data.country || f.country,
                }));
                setPicSuccess(`Found: ${data.name} from ${data.city}, ${data.country}`);
            } else {
                setError("Organisation not found on EU Portal. Please check the PIC.");
            }
        } catch (err) {
            setError("Failed to fetch from EU Portal.");
        } finally {
            setSearchingPic(false);
        }
    };

    const handleOrgSelect = async (selectedOrg: any) => {
        setForm(prev => ({
            ...prev,
            legal_name: selectedOrg.name,
            pic: selectedOrg.pic,
            city: selectedOrg.city,
            country: selectedOrg.country,
            // These might be dynamically added fields
            registrationNum: selectedOrg.registrationNum || '',
            vat: selectedOrg.vat || '',
        }));
        
        setShowSuccessToast(`Organisation details populated from EC Database`);
        setTimeout(() => setShowSuccessToast(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error: insertError } = await supabase
            .from('org_registry')
            .insert([form]);

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
        } else {
            router.push('/organisations');
        }
    };

    return (
        <div className="flex h-screen font-sans overflow-hidden bg-[#F1F5F9]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-8 md:p-12 space-y-8">
                        
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 font-bold text-xs transition-colors group uppercase tracking-widest">
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                    Back to Registry
                                </button>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add New Organisation</h1>
                                <p className="text-slate-500 mt-1 font-medium">Register a partner institution to your directory.</p>
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => setIsSearchModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/10 active:scale-95 transition-all text-sm"
                            >
                                <Search size={18} />
                                Search Database
                            </button>
                        </div>

                        {/* Search Hint Box */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Info size={20} />
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-blue-900">Pro-Tip: Use the EC Search</h4>
                                <p className="text-xs text-blue-700/80 mt-1 font-medium leading-relaxed">
                                    Searching the official database is much faster. It automatically fills in the OID, PIC, Legal Name, and address details directly from the EU Portal.
                                </p>
                             </div>
                        </div>

                        {/* Organisation Form */}
                        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 space-y-10">
                            
                            {/* Section: Basic Identity */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                    <Building2 className="text-blue-600" size={18} />
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Institution Identity</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Legal Organisation Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input 
                                                required
                                                type="text"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900"
                                                placeholder="e.g. University of Example"
                                                value={form.legal_name}
                                                onChange={e => setForm({...form, legal_name: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Organisation Type</label>
                                        <select 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 appearance-none shadow-sm"
                                            value={form.type}
                                            onChange={e => setForm({...form, type: e.target.value})}
                                        >
                                            <option value="NGO">NGO (Non-Profit)</option>
                                            <option value="HEI">Higher Education Institute</option>
                                            <option value="School">School / Institute</option>
                                            <option value="SME">SME / Private Company</option>
                                            <option value="Public">Public Body / Authority</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">PIC Number (9 Digits)</label>
                                        <div className="relative">
                                            <Hash className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${form.pic ? (isPicValid ? 'text-emerald-500' : 'text-slate-300') : 'text-slate-300'}`} size={18} />
                                            <input 
                                                type="text"
                                                disabled={searchingPic}
                                                className={`w-full pl-12 pr-12 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-semibold text-slate-900 ${form.pic ? (isPicValid ? 'border-emerald-200 focus:ring-emerald-500/10 focus:border-emerald-500' : 'border-slate-100 focus:ring-blue-500/10 focus:border-blue-500') : 'border-slate-100 focus:ring-blue-500/10 focus:border-blue-500'} disabled:opacity-50`}
                                                placeholder="e.g. 949123456"
                                                value={form.pic}
                                                onChange={e => setForm({...form, pic: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                                            />
                                            {isPicValid && !searchingPic && (
                                                <button 
                                                    type="button"
                                                    onClick={() => handlePicLookup(form.pic)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors"
                                                    title="Auto-fill data"
                                                >
                                                    <Sparkles size={18} />
                                                </button>
                                            )}
                                            {searchingPic && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <Loader2 size={18} className="text-blue-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Location & Contact */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                    <MapPin className="text-blue-600" size={18} />
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Location & Contact</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Country</label>
                                        <div className="relative">
                                            <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input 
                                                required
                                                type="text"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900"
                                                placeholder="e.g. Turkey"
                                                value={form.country}
                                                onChange={e => setForm({...form, country: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">City</label>
                                        <input 
                                            type="text"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900"
                                            placeholder="e.g. Ankara"
                                            value={form.city}
                                            onChange={e => setForm({...form, city: e.target.value})}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Website URL</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input 
                                                type="url"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900"
                                                placeholder="https://example.org"
                                                value={form.website}
                                                onChange={e => setForm({...form, website: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Legal Address</label>
                                        <textarea 
                                            rows={2}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900"
                                            placeholder="Street name, Number, Zip code..."
                                            value={form.address}
                                            onChange={e => setForm({...form, address: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading || !form.legal_name}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Register Organisation
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            <OrgSearchModal 
                open={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSelect={handleOrgSelect}
            />

            {showSuccessToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                        <p className="text-sm font-bold tracking-tight">{showSuccessToast}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
