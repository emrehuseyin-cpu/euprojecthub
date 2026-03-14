"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Building, ArrowLeft, Search, Loader2, CheckCircle2, AlertCircle, Save, X, Globe, MapPin, Mail, Hash, Info } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

export default function NewOrganisationPage() {
    const router = useRouter();
    const { t } = useLanguage();
    // Use the standard supabase client as in other functional components

    const [loading, setLoading] = useState(false);
    const [searchingOid, setSearchingOid] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        oid: '',
        legal_name: '',
        type: 'NGO',
        country: '',
        city: '',
        email: '',
        website: '',
        address: ''
    });

    // Mock OID lookup (In a real app, this would call an Erasmus+ API wrapper)
    const handleOidLookup = async () => {
        if (!searchQuery) return;
        setSearchingOid(true);
        setError(null);

        // Simulate API delay
        await new Promise(r => setTimeout(r, 1500));

        // Logic for OID lookup. Normally we'd fetch from EC API.
        // For now, if OID is provided, we simulate a find.
        if (searchQuery.length < 8) {
            setError("OID must be at least 8 characters starting with 'E'");
            setSearchingOid(false);
            return;
        }

        // Just pre-fill with some data to demonstrate the flow
        setForm(f => ({
            ...f,
            oid: searchQuery,
            legal_name: "Mock Organisation (Found via OID)",
            country: "Turkey",
            city: "Ankara",
            type: "NGO",
            email: "info@mockorg.com",
            website: "https://mockorg.com"
        }));
        
        setSearchingOid(false);
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

                        {/* OID Lookup Tool */}
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-8 mb-8">
                            <h4 className="flex items-center gap-2 text-amber-700 font-black text-sm uppercase tracking-wider mb-4">
                                <Search size={16} /> OID Lookup (Recommended)
                            </h4>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" size={18} />
                                    <input 
                                        type="text"
                                        placeholder="Enter OID (e.g. E10208833)..."
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-amber-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-sm font-bold"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <button 
                                    onClick={handleOidLookup}
                                    disabled={searchingOid || !searchQuery}
                                    className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2">
                                    {searchingOid ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                    Lookup
                                </button>
                            </div>
                            <div className="mt-4 flex items-start gap-2 text-[10px] text-amber-600 font-bold bg-white/50 p-3 rounded-xl border border-amber-100/50">
                                <Info size={14} className="shrink-0" />
                                <p>Lookup pre-fills details from the official Erasmus+ Database. You can still edit them before saving.</p>
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
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">OID (Organisation ID)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input 
                                            type="text"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="E12345678"
                                            value={form.oid}
                                            onChange={e => setForm({...form, oid: e.target.value.toUpperCase()})}
                                        />
                                    </div>
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
