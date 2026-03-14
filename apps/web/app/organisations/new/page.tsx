"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Building, ArrowLeft, Search, Loader2, CheckCircle2, AlertCircle, Save, X, Globe, MapPin, Mail, Hash, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { getOrganisationByPIC } from '@euprojecthub/core';

export default function NewOrganisationPage() {
    const router = useRouter();
    const { t } = useLanguage();
    // Use the standard supabase client as in other functional components

    const [loading, setLoading] = useState(false);
    const [searchingOid, setSearchingOid] = useState(false);
    const [searchingPic, setSearchingPic] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [picSuccess, setPicSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handleSearchEC = () => {
        window.open('https://webgate.ec.europa.eu/erasmus-esc/index/organisations/search-for-an-organisation', '_blank');
    };

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
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#F8F9FC' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-12">
                    <div className="max-w-3xl mx-auto">
                        {/* Back Link */}
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold text-sm transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Registry
                        </button>

                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Add New Organisation</h2>
                            <p className="text-gray-500">Search by OID or enter details manually to add to your registry.</p>
                        </div>

                        {/* External Lookup Tool */}
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-8 mb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h4 className="flex items-center gap-2 text-amber-700 font-black text-sm uppercase tracking-wider mb-2">
                                        <Search size={16} /> Official EC Database
                                    </h4>
                                    <p className="text-[10px] text-amber-600 font-bold max-w-sm">
                                        Search the official EC database, find your partner, then copy their OID and PIC back here.
                                    </p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleSearchEC}
                                    title="Search the official EC database, then copy the OID back here"
                                    className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Globe size={18} />
                                    Search EC Database ↗
                                </button>
                            </div>
                        </div>

                        {/* Organisation Form */}
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 md:p-12 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Legal Name</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input 
                                            required
                                            type="text"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="National Agency / Association Name..."
                                            value={form.legal_name}
                                            onChange={e => setForm({...form, legal_name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Organisation Type</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900 appearance-none shadow-sm"
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
                                    <div className="flex items-center justify-between px-1 mb-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">OID (Organisation ID)</label>
                                        {form.oid && (
                                            <a 
                                                href="https://webgate.ec.europa.eu/erasmus-esc/index/organisations/search-for-an-organisation"
                                                target="_blank"
                                                className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-tighter"
                                            >
                                                Verify on EC website ↗
                                            </a>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Hash className={`absolute left-4 top-4 transition-colors ${form.oid ? (isOidValid ? 'text-emerald-500' : 'text-red-500') : 'text-gray-300'}`} size={18} />
                                        <input 
                                            type="text"
                                            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-gray-900 ${form.oid ? (isOidValid ? 'border-emerald-100 focus:ring-emerald-500/10 focus:border-emerald-500' : 'border-red-100 focus:ring-red-500/10 focus:border-red-500') : 'border-gray-100 focus:ring-indigo-500/10 focus:border-indigo-500'}`}
                                            placeholder="E12345678"
                                            value={form.oid}
                                            onChange={e => setForm({...form, oid: e.target.value.toUpperCase()})}
                                        />
                                        {form.oid && (
                                            <div className="absolute right-4 top-4">
                                                {isOidValid ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 px-1 text-[9px] text-gray-400 font-medium leading-relaxed">
                                        Format E12345678. Find it at webgate.ec.europa.eu or ask your coordinator.
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between px-1 mb-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">PIC Number</label>
                                        {(form.pic && isPicValid) && (
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handlePicLookup(form.pic)}
                                                    className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-tighter flex items-center gap-1"
                                                >
                                                    <Sparkles size={10} /> Auto-fill Details
                                                </button>
                                                <a 
                                                    href={`https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/${form.pic}`}
                                                    target="_blank"
                                                    className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-tighter"
                                                >
                                                    Verify ↗
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Hash className={`absolute left-4 top-4 transition-colors ${form.pic ? (isPicValid ? 'text-emerald-500' : 'text-red-500') : 'text-gray-300'}`} size={18} />
                                        <input 
                                            type="text"
                                            disabled={searchingPic}
                                            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-gray-900 ${form.pic ? (isPicValid ? 'border-emerald-100 focus:ring-emerald-500/10 focus:border-emerald-500' : 'border-red-100 focus:ring-red-500/10 focus:border-red-500') : 'border-gray-100 focus:ring-indigo-500/10 focus:border-indigo-500'} disabled:opacity-50`}
                                            placeholder="9 digits (e.g. 949123456)"
                                            value={form.pic}
                                            onChange={e => setForm({...form, pic: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                                        />
                                        {searchingPic ? (
                                            <div className="absolute right-4 top-4">
                                                <Loader2 size={18} className="text-blue-500 animate-spin" />
                                            </div>
                                        ) : form.pic && (
                                            <div className="absolute right-4 top-4">
                                                {isPicValid ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
                                            </div>
                                        )}
                                    </div>
                                    {picSuccess && (
                                        <p className="mt-2 px-1 text-[9px] text-emerald-600 font-bold leading-relaxed flex items-center gap-1 italic">
                                            <CheckCircle2 size={10} /> {picSuccess}
                                        </p>
                                    )}
                                    <p className="mt-2 px-1 text-[9px] text-gray-400 font-medium leading-relaxed">
                                        9 digits, no letters. Auto-fill from EU Portal enabled once valid.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Country</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input 
                                            required
                                            type="text"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="e.g. Turkey"
                                            value={form.country}
                                            onChange={e => setForm({...form, country: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">City</label>
                                    <input 
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                                        placeholder="e.g. Ankara"
                                        value={form.city}
                                        onChange={e => setForm({...form, city: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Contact Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input 
                                            type="email"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="contact@organisation.eu"
                                            value={form.email}
                                            onChange={e => setForm({...form, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input 
                                            type="url"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="https://organisation.eu"
                                            value={form.website}
                                            onChange={e => setForm({...form, website: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Address</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                                        placeholder="Street, Building No, Zip Code..."
                                        value={form.address}
                                        onChange={e => setForm({...form, address: e.target.value})}
                                    />
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
                                    className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                                    <X size={18} /> Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading || !form.legal_name}
                                    className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-gray-900/10 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Organisation
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
