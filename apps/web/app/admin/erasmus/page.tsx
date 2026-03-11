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
    FileText
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';

export default function ErasmusAdminPage() {
    const [activeTab, setActiveTab] = useState('rules');
    const [rules, setRules] = useState<any[]>([]);
    const [costs, setCosts] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'rules') {
                const { data } = await supabase.from('program_rules').select('*').order('created_at', { ascending: false });
                setRules(data || []);
            } else if (activeTab === 'costs') {
                const { data } = await supabase.from('budget_unit_costs').select('*').order('created_at', { ascending: false });
                setCosts(data || []);
            } else if (activeTab === 'logs') {
                const { data } = await supabase.from('rule_update_logs').select('*').order('created_at', { ascending: false });
                setLogs(data || []);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900">Erasmus+ 2026 Yönetimi</h1>
                                <p className="text-sm text-gray-500 mt-1">Program kurallarını, birim maliyetlerini ve kılavuz güncellemelerini yönetin.</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit">
                            <button
                                onClick={() => setActiveTab('rules')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rules' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <BookOpen size={16} /> Kural Kütüphanesi
                            </button>
                            <button
                                onClick={() => setActiveTab('costs')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'costs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Coins size={16} /> Bütçe Maliyetleri
                            </button>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <History size={16} /> Güncelleme Logları
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Upload size={16} /> PDF Yükle
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-[400px]">
                                    <RefreshCw className="animate-spin text-blue-600" />
                                </div>
                            ) : activeTab === 'rules' ? (
                                <div className="p-6">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-400 font-bold">
                                                <th className="pb-3 px-2">Program</th>
                                                <th className="pb-3 px-2">Kategori</th>
                                                <th className="pb-3 px-2">Key</th>
                                                <th className="pb-3 px-2">Değer</th>
                                                <th className="pb-3 px-2 text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {rules.map((rule) => (
                                                <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-2 font-black text-gray-900">{rule.program_type}</td>
                                                    <td className="py-4 px-2 text-gray-500">{rule.rule_category}</td>
                                                    <td className="py-4 px-2 font-mono text-xs">{rule.rule_key}</td>
                                                    <td className="py-4 px-2 text-xs max-w-xs overflow-hidden truncate">
                                                        {JSON.stringify(rule.rule_value)}
                                                    </td>
                                                    <td className="py-4 px-2 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Save size={16} /></button>
                                                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
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
                                            <tr className="border-b border-gray-100 text-gray-400 font-bold">
                                                <th className="pb-3 px-2">Kategori</th>
                                                <th className="pb-3 px-2">Alt Kategori</th>
                                                <th className="pb-3 px-2">Birim</th>
                                                <th className="pb-3 px-2">Tutar</th>
                                                <th className="pb-3 px-2 text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {costs.map((cost) => (
                                                <tr key={cost.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-2 font-black text-gray-900">{cost.category}</td>
                                                    <td className="py-4 px-2 text-gray-500">{cost.subcategory}</td>
                                                    <td className="py-4 px-2 text-xs">{cost.unit}</td>
                                                    <td className="py-4 px-2 font-bold text-blue-600">€{cost.amount}</td>
                                                    <td className="py-4 px-2 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Save size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : activeTab === 'upload' ? (
                                <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
                                        <Upload size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black">Erasmus+ Guide PDF Yükle</h3>
                                        <p className="text-sm text-gray-500 max-w-sm mt-2">
                                            Resmi 2026 kılavuzunu yükleyin. Sistem PDF'i tarayarak kural değişikliklerini otomatik tespit edecektir.
                                        </p>
                                    </div>
                                    <div className="w-full max-w-md p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 transition-all cursor-pointer bg-gray-50/50">
                                        <p className="text-sm text-gray-400 font-medium">Dosyayı buraya sürükleyin veya <span className="text-blue-600 underline">Göz Atın</span></p>
                                    </div>
                                    <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-all">
                                        PDF İşle ve Analiz Et
                                    </button>
                                </div>
                            ) : activeTab === 'logs' ? (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {logs.map((log) => (
                                            <div key={log.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <FileText className="text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{log.pdf_url || 'Programme_Guide_2026_v2.pdf'}</p>
                                                        <p className="text-xs text-gray-500">Tespit edilen değişiklik: {JSON.stringify(log.changes_detected)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full border border-amber-200 uppercase tracking-widest">BEKLEMEDE</span>
                                                    <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:shadow-md transition-all">ONAYLA</button>
                                                </div>
                                            </div>
                                        ))}
                                        {logs.length === 0 && (
                                            <div className="text-center py-20">
                                                <p className="text-gray-400 text-sm">Henüz bir güncelleme kaydı bulunmuyor.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
