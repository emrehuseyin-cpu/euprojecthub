"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Wallet,
    Plus,
    Search,
    TrendingUp,
    PieChart as PieChartIcon,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import ErasmusBudgetCalculator from '../components/ErasmusBudgetCalculator';
import { supabase } from '../lib/supabase';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

export default function BudgetPage() {
    const [data, setData] = useState<any>({ projects: [], categories: [] });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'calculator'>('overview');

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']; // Blue, Emerald, Amber, Purple, Red

    useEffect(() => {
        async function fetchBudgetData() {
            try {
                // Fetch projects
                const { data: projectsData, error: projError } = await supabase
                    .from('projects')
                    .select('id, name, budget')
                    .order('created_at', { ascending: false });

                if (projError) throw projError;

                // Fetch budget items (expenses)
                const { data: expensesData, error: expError } = await supabase
                    .from('budget_items')
                    .select('*');

                if (expError) throw expError;

                // Calculate Project Summaries
                const projectSummaries = (projectsData || []).map(project => {
                    const projectExpenses = (expensesData || []).filter(e => e.project_id === project.id);
                    const totalSpent = projectExpenses.reduce((sum, item) => sum + Number(item.spent_amount || 0), 0);
                    const totalBudget = Number(project.budget || 0);
                    const remaining = totalBudget - totalSpent;
                    const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

                    return {
                        id: project.id,
                        name: project.name,
                        totalBudget,
                        totalSpent,
                        remaining,
                        progress: Math.min(progress, 100).toFixed(1)
                    };
                });

                // Calculate Category Summaries for Recharts
                const categoryMap: { [key: string]: number } = {};
                (expensesData || []).forEach(expense => {
                    const cat = expense.category || 'Diğer';
                    categoryMap[cat] = (categoryMap[cat] || 0) + Number(expense.spent_amount || 0);
                });

                const categoryData = Object.keys(categoryMap).map(key => ({
                    name: key,
                    value: categoryMap[key]
                })).filter(cat => cat.value > 0);

                setData({
                    projects: projectSummaries,
                    categories: categoryData
                });

            } catch (err) {
                console.error('Error fetching budget data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchBudgetData();
    }, []);

    const filteredProjects = data.projects.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPlatformBudget = data.projects.reduce((sum: number, p: any) => sum + p.totalBudget, 0);
    const totalPlatformSpent = data.projects.reduce((sum: number, p: any) => sum + p.totalSpent, 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Wallet className="text-blue-600 w-6 h-6" />
                                    Bütçe ve Harcamalar
                                </h2>
                                <p className="text-gray-500 mt-1">Platform genelinde proje bütçelerini ve harcama kategorilerini takip edin.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex">
                                    <button 
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Harcama Özeti
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('calculator')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'calculator' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Bütçe Hesaplayıcı
                                    </button>
                                </div>
                                <Link
                                    href="/budget/new"
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                                >
                                    <Plus size={20} />
                                    <span>Yeni Harcama Ekle</span>
                                </Link>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Bütçe verileri hesaplanıyor...</p>
                            </div>
                        ) : activeTab === 'overview' ? (
                            <div className="space-y-8">
                                {/* Global Stats & Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Total Overview Card */}
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm border border-blue-500 p-6 text-white flex flex-col justify-center">
                                        <h3 className="text-blue-100 font-medium mb-1">Toplam Konsorsiyum Bütçesi</h3>
                                        <p className="text-4xl font-bold mb-6">{formatCurrency(totalPlatformBudget)}</p>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-blue-100">Toplam Harcanan</span>
                                                    <span className="font-semibold">{formatCurrency(totalPlatformSpent)}</span>
                                                </div>
                                                <div className="w-full bg-blue-800/50 rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-400 h-2 rounded-full"
                                                        style={{ width: `${totalPlatformBudget > 0 ? (totalPlatformSpent / totalPlatformBudget) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-blue-500/50 flex justify-between items-center text-sm">
                                                <span className="text-blue-100">Kalan Kullanılabilir Bütçe</span>
                                                <span className="font-bold text-lg">{formatCurrency(totalPlatformBudget - totalPlatformSpent)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Pie Chart */}
                                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-blue-500" />
                                            Kategori Bazlı Harcama Dağılımı
                                        </h3>

                                        {data.categories.length > 0 ? (
                                            <div className="flex-1 min-h-[250px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data.categories}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {data.categories.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(value: any) => formatCurrency(Number(value) || 0)}
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Legend verticalAlign="bottom" height={36} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                                <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                                                <p>Henüz yeterli harcama verisi yok.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Search / Filters for Projects Below */}
                                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-gray-900 text-lg">Proje Bütçe Özetleri</h3>
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Projelerde ara..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Project Budget Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredProjects.map((project: any) => (
                                        <div key={project.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-gray-900 text-lg line-clamp-1 flex-1 pr-2" title={project.name}>
                                                    {project.name}
                                                </h4>
                                                <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap border border-blue-100">
                                                    {project.progress}% Dolu
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Toplam Bütçe</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(project.totalBudget)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Harcanan Toplam</span>
                                                    <span className="font-semibold text-emerald-600">{formatCurrency(project.totalSpent)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100">
                                                    <span className="text-gray-500 font-medium">Kalan Bütçe</span>
                                                    <span className={`font-bold ${project.remaining < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                                        {formatCurrency(project.remaining)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                                    <div
                                                        className={`h-2 rounded-full ${Number(project.progress) > 90 ? 'bg-red-500' : Number(project.progress) > 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.min(Number(project.progress), 100)}%` }}
                                                    ></div>
                                                </div>
                                                {Number(project.progress) > 90 && (
                                                    <p className="text-[11px] text-red-500 flex items-center mt-1.5 font-medium">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Bütçe limitine yaklaşıldı
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {filteredProjects.length === 0 && (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl">
                                            <Wallet className="w-10 h-10 mb-3 text-gray-300" />
                                            <p>Görüntülenecek proje bütçesi bulunamadı.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <ErasmusBudgetCalculator />
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
