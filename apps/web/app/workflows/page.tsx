"use client";

import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Zap, Play, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const workflows = [
    {
        id: '1',
        name: 'Yeni Proje → Web Sitesi Oluştur',
        description: 'Yeni proje eklendiğinde otomatik olarak projeye özel tanıtım web sitesi oluşturur ve yayınlar.',
        status: 'Aktif',
        lastRun: '10 dk önce'
    },
    {
        id: '2',
        name: 'Faaliyet Tamamlandı → WP Güncelle',
        description: 'Bir faaliyet tamamlandığında WordPress bloguna otomatik olarak haber ekler.',
        status: 'Aktif',
        lastRun: '2 saat önce'
    },
    {
        id: '3',
        name: 'Bütçe Aşımı → Email Bildirimi',
        description: 'Herhangi bir bütçe kalemi %90 sınırını aştığında koordinatöre uyarı e-postası gönderir.',
        status: 'Aktif',
        lastRun: 'Dün, 14:30'
    },
    {
        id: '4',
        name: 'Ortak Eklendi → Hoş Geldin Emaili',
        description: 'Yeni bir ortak projeye eklendiğinde bilgi kiti ve erişim linklerini e-posta ile iletir.',
        status: 'Pasif',
        lastRun: 'Hiç çalışmadı'
    },
    {
        id: '5',
        name: 'Rapor Hazır → PDF Oluştur',
        description: 'Dönem sonu geldiğinde ilgili faaliyet raporlarını birleştirerek PDF formatına dönüştürür.',
        status: 'Pasif',
        lastRun: '15 gün önce'
    },
    {
        id: '6',
        name: 'Katılımcı Kaydı → Sertifika Gönder',
        description: 'Etkinlik sonrası katılım listesindeki kişilere otomatik olarak oluşturulan e-sertifikaları iletir.',
        status: 'Pasif',
        lastRun: 'Hiç çalışmadı'
    }
];

export default function WorkflowsPage() {
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
                                    <Zap className="text-blue-600 w-6 h-6" />
                                    Otomasyonlar (Workflows)
                                </h2>
                                <p className="text-gray-500 mt-1">Platform içi ve dışı süreçlerinizi n8n gücüyle otomatikleştirin.</p>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                                </span>
                                Yakında: n8n Entegrasyonu
                            </div>
                        </div>

                        {/* Workflows Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {workflows.map((workflow) => (
                                <div key={workflow.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col h-full relative p-6 group">

                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2 rounded-lg ${workflow.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                            <Zap size={20} />
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${workflow.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {workflow.status === 'Aktif' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                                            {workflow.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                        {workflow.name}
                                    </h3>

                                    <p className="text-sm text-gray-500 flex-1 mb-6">
                                        {workflow.description}
                                    </p>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                                            {workflow.lastRun}
                                        </div>

                                        <button
                                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${workflow.status === 'Aktif'
                                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                }`}
                                            disabled={workflow.status !== 'Aktif'}
                                        >
                                            <Play className="w-3.5 h-3.5" />
                                            <span>Çalıştır</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
