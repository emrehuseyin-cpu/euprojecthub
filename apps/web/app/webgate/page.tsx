"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { trackEvent, trackError } from '../lib/analytics';
import { Link as LinkIcon, Download, FileJson, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type ExportType = 'Katılımcı Listesi (C7 Formu)' | 'Faaliyet Raporu' | 'Bütçe Özeti' | 'Ortak Bilgileri';

export default function WebgatePage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Form State
    const [projectId, setProjectId] = useState('');
    const [exportType, setExportType] = useState<ExportType>('Katılımcı Listesi (C7 Formu)');
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [exportHistory, setExportHistory] = useState<any[]>([]);

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            const { data: projData } = await supabase.from('projects').select('id, name').order('created_at', { ascending: false });
            if (projData) setProjects(projData);

            // Fetch Export History (assuming webgate_exports table exists - if not this will silently fail and return [])
            const { data: historyData } = await supabase
                .from('webgate_exports')
                .select('*, project:projects(name)')
                .order('created_at', { ascending: false })
                .limit(10);

            if (historyData) setExportHistory(historyData);
            setLoading(false);
        }
        fetchInitialData();
    }, []);

    const fetchExportData = async () => {
        if (!projectId) return null;

        switch (exportType) {
            case 'Katılımcı Listesi (C7 Formu)':
                const { data: participants } = await supabase
                    .from('participants')
                    .select('*, activity:activities(title, start_date, end_date), project:projects(name)')
                    .eq('project_id', projectId);

                return participants?.map(p => ({
                    'Participant ID': `P-${p.id.split('-')[0].toUpperCase()}`,
                    'First Name': p.first_name,
                    'Last Name': p.last_name,
                    'Date of Birth': p.birth_year ? `${p.birth_year}-01-01` : '-', // Estimation as only year is stored initially
                    'Gender': p.gender === 'Erkek' ? 'M' : p.gender === 'Kadın' ? 'F' : 'X',
                    'Nationality': p.country.substring(0, 2).toUpperCase(), // Note: Ideally should map to true ISO codes
                    'Fewer Opportunities': p.fewer_opportunities ? 'YES' : 'NO',
                    'Activity Title': p.activity?.title || '-',
                    'Activity Start Date': p.activity?.start_date || '-',
                    'Activity End Date': p.activity?.end_date || '-',
                    'Sending Organisation': '-', // To be filled by user later
                    'Receiving Organisation': p.project?.name || '-'
                })) || [];

            case 'Faaliyet Raporu':
                const { data: activities } = await supabase
                    .from('activities')
                    .select('*')
                    .eq('project_id', projectId);

                return activities?.map(a => ({
                    'Activity ID': `A-${a.id.split('-')[0].toUpperCase()}`,
                    'Activity Type': a.type,
                    'Title': a.title,
                    'Start Date': a.start_date || '-',
                    'End Date': a.end_date || '-',
                    'Location (Country)': a.location || '-',
                    'Number of Participants': 0, // Would require a complex join or separate count query
                    'Status': a.status
                })) || [];

            case 'Bütçe Özeti':
                const { data: budgetItems } = await supabase
                    .from('budget_items')
                    .select('*')
                    .eq('project_id', projectId);

                const { data: project } = await supabase
                    .from('projects')
                    .select('budget')
                    .eq('id', projectId)
                    .single();

                const categorySums = budgetItems?.reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
                    return acc;
                }, {} as Record<string, number>) || {};

                return Object.keys(categorySums).map(cat => ({
                    'Budget Category': cat,
                    'Planned Amount (EUR)': '-', // We do not store planned vs actual granularly yet
                    'Spent Amount (EUR)': categorySums[cat],
                    'Difference': '-'
                }));

            case 'Ortak Bilgileri':
                const { data: partners } = await supabase
                    .from('partners')
                    .select('*')
                    .eq('project_id', projectId);

                return partners?.map(p => ({
                    'Organisation Name': p.name,
                    'Country': p.country,
                    'OID': '-', // User fills manually
                    'Role': p.type === 'Koordinatör' ? 'Coordinator' : 'Partner',
                    'Contact Person': '-',
                    'Email': p.email || '-'
                })) || [];
        }
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();
        setExporting(true);
        const data = await fetchExportData();
        setPreviewData(data);
        setExporting(false);
    };

    const logExport = async (dataPayload: any) => {
        try {
            await supabase.from('webgate_exports').insert([{
                project_id: projectId,
                export_type: exportType,
                status: 'Completed',
                data: dataPayload
            }]);

            trackEvent('webgate_exported', {
                project_id: projectId,
                export_type: exportType
            });

            // Refresh history quietly
            const { data: historyData } = await supabase.from('webgate_exports').select('*, project:projects(name)').order('created_at', { ascending: false }).limit(10);
            if (historyData) setExportHistory(historyData);
        } catch (e: any) {
            trackError(e, { context: 'webgate_export' });
            console.error("Failed to log export", e);
        }
    }

    const downloadCSV = async () => {
        if (!previewData || previewData.length === 0) return;
        const headers = Object.keys(previewData[0]);
        const csvRows = [
            headers.join(','),
            ...previewData.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(','))
        ];
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `webgate_${exportType.toLowerCase().replace(/ /g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await logExport(previewData);
    };

    const downloadJSON = async () => {
        if (!previewData) return;
        const jsonString = JSON.stringify(previewData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `webgate_${exportType.toLowerCase().replace(/ /g, '_')}_${format(new Date(), 'yyyyMMdd')}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await logExport(previewData);
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <LinkIcon size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Webgate Export (Erasmus+ Raporlama)</h1>
                                <p className="text-gray-500">Resmi Webgate sistemine aktarım için verilerinizi uygun formatta hazırlayın.</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 text-sm items-start">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>
                                <strong>Bilgi:</strong> Bu modül, verilerinizi Webgate platformuna toplu olarak aktarabilmeniz
                                veya CSV dosyaları halinde yükleyebilmeniz için Erasmus+ standartlarında dışa aktarır.
                                Eksik alanları CSV dosyasında manuel doldurmanız gerekebilir (Örn: OID numarası).
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Export Form */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-bold mb-4">Export Sihirbazı</h2>
                                    <form onSubmit={handlePreview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Proje</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                required
                                                value={projectId}
                                                onChange={e => setProjectId(e.target.value)}
                                            >
                                                <option value="">Proje Seçin</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Export Türü</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                value={exportType}
                                                onChange={(e) => setExportType(e.target.value as ExportType)}
                                            >
                                                <option value="Katılımcı Listesi (C7 Formu)">Katılımcı Listesi (C7 Formu)</option>
                                                <option value="Faaliyet Raporu">Faaliyet Raporu</option>
                                                <option value="Bütçe Özeti">Bütçe Özeti</option>
                                                <option value="Ortak Bilgileri">Ortak Bilgileri</option>
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={exporting || !projectId}
                                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                        >
                                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verileri Derle ve Önizle'}
                                        </button>
                                    </form>
                                </div>

                                {/* History */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Son Dışa Aktarımlar</h2>
                                    <div className="space-y-3">
                                        {exportHistory.length > 0 ? exportHistory.map(hist => (
                                            <div key={hist.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-gray-900 truncate w-32">{hist.project?.name || 'Bilinmiyor'}</p>
                                                    <p className="text-xs text-gray-500">{hist.export_type}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">{format(new Date(hist.created_at), 'dd MMM yyyy')}</span>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-400 italic">Henüz export kaydı bulunmuyor.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden min-h-[500px]">
                                    <div className="border-b border-gray-100 bg-gray-50 p-4 flex justify-between items-center">
                                        <h2 className="font-bold text-gray-900">Önizleme ({exportType})</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={downloadJSON}
                                                disabled={!previewData || previewData.length === 0}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 disabled:opacity-50 transition-colors"
                                            >
                                                <FileJson className="w-4 h-4" /> JSON Export
                                            </button>
                                            <button
                                                onClick={downloadCSV}
                                                disabled={!previewData || previewData.length === 0}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" /> Excel / CSV Export
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-0 overflow-x-auto flex-1">
                                        {!previewData ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-20">
                                                <Download className="w-12 h-12 mb-3 text-gray-300" />
                                                <p>Verileri sağdan seçip "Derle ve Önizle" butonuna basın.</p>
                                            </div>
                                        ) : previewData.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-amber-600 mt-20 font-medium">
                                                Seçilen proje ve tür için veri bulunamadı.
                                            </div>
                                        ) : (
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                                    <tr>
                                                        {Object.keys(previewData[0]).map((header) => (
                                                            <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {previewData.map((row, i) => (
                                                        <tr key={i} className="hover:bg-gray-50">
                                                            {Object.values(row).map((val: any, j) => (
                                                                <td key={j} className="px-4 py-3text-gray-900">
                                                                    {val?.toString() || '-'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
