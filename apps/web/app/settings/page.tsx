"use client";

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import {
    Settings,
    User,
    Layout,
    Bell,
    Link as LinkIcon,
    CheckCircle2,
    AlertCircle,
    Save,
    Loader2,
    Upload
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('Profil');
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Integrations state mockup
    const [anthropicKey, setAnthropicKey] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setSavedSuccess(false);

        // Simulate save duration
        setTimeout(() => {
            setIsSaving(false);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }, 1000);
    };

    const tabs = [
        { id: 'Profil', icon: <User className="w-4 h-4" /> },
        { id: 'Platform', icon: <Layout className="w-4 h-4" /> },
        { id: 'Bildirimler', icon: <Bell className="w-4 h-4" /> },
        { id: 'Entegrasyonlar', icon: <LinkIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="text-blue-600 w-6 h-6" />
                                    Sistem Ayarları
                                </h2>
                                <p className="text-gray-500 mt-1">Platform tercihlerinizi, bildirim ve harici entegrasyon yapılandırmalarınızı düzenleyin.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Değişiklikleri Kaydet</span>
                            </button>
                        </div>

                        {savedSuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Ayarlarınız başarıyla güncellendi.</span>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                            {/* Settings Sidebar */}
                            <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-200 p-4">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                        >
                                            {tab.icon}
                                            {tab.id}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Settings Content */}
                            <div className="flex-1 p-6 sm:p-8">

                                {/* 1. Profil Sekmesi */}
                                {activeTab === 'Profil' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Kişisel Profil</h3>
                                            <div className="space-y-4 max-w-lg">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                                    <input type="text" defaultValue="Emre Hüseyin Yiğit" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
                                                    <input type="email" defaultValue="emre@moderngelisim.org.tr" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Güvenlik</h3>
                                            <div className="space-y-4 max-w-lg">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                                    <input type="password" placeholder="Şifrenizi güncellemek için yazın" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Platform Sekmesi */}
                                {activeTab === 'Platform' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Kurumsal Kimlik</h3>
                                            <div className="space-y-6 max-w-lg">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Adı</label>
                                                    <input type="text" defaultValue="EUProjectHub" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Logosu</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                                            EU
                                                        </div>
                                                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                                                            <Upload className="w-4 h-4" /> Yeni Logo Yükle
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">Önerilen format: PNG, Şeffaf arka plan, Max 2MB.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Birincil Renk Teması</label>
                                                    <div className="flex gap-3">
                                                        {['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-500', 'bg-slate-900'].map((color, i) => (
                                                            <button key={i} className={`w-8 h-8 rounded-full ${color} ${i === 0 ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Bildirimler Sekmesi */}
                                {activeTab === 'Bildirimler' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">E-posta Bildirim Tercihleri</h3>
                                            <div className="space-y-4">
                                                {[
                                                    { id: 'notif-1', title: 'Yeni Proje Eklendiğinde', desc: 'Platforma dahil edilen her yeni proje için bildirim al.', checked: true },
                                                    { id: 'notif-2', title: 'Bütçe Aşımı Durumunda', desc: 'Herhangi bir bütçe kalemi planlananı aştığında uyar.', checked: true },
                                                    { id: 'notif-3', title: 'Yaklaşan Faaliyet Hatırlatıcıları', desc: 'Başlamasına 3 gün kalan faaliyetler için özet al.', checked: true },
                                                    { id: 'notif-4', title: 'Sözleşme Süresi Dolduğunda', desc: 'Geçerliliği biten ortaklık veya proje sözleşmelerinde uyar.', checked: false },
                                                    { id: 'notif-5', title: 'Rapor Onay Durumları', desc: 'Taslaktaki raporlarınız onaylandığında bildirim al.', checked: true },
                                                ].map((item) => (
                                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                                            <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. Entegrasyonlar Sekmesi */}
                                {activeTab === 'Entegrasyonlar' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Bağlı Sistemler</h3>
                                            <div className="space-y-4">

                                                {/* WP Integration */}
                                                <div className="flex flex-col sm:flex-row gap-4 justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900">WordPress CMS</h4>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">Bağlı <CheckCircle2 className="w-3 h-3 ml-1" /></span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">Blog, haberler ve duyurular için dış içerik yönetimi.</p>
                                                        <p className="text-xs font-medium text-gray-400 mt-2 font-mono">https://dev.moderngelisim.org.tr</p>
                                                    </div>
                                                    <button className="self-start text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg bg-white">Yapılandır</button>
                                                </div>

                                                {/* Supabase Integration */}
                                                <div className="flex flex-col sm:flex-row gap-4 justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900">Supabase DB</h4>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">Bağlı <CheckCircle2 className="w-3 h-3 ml-1" /></span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">Ana veritabanı, auth yönetimi ve depolama servisi.</p>
                                                        <p className="text-xs font-medium text-gray-400 mt-2 font-mono">jafatlroukhhewlxnogg.supabase.co</p>
                                                    </div>
                                                    <button className="self-start text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg bg-white">Yapılandır</button>
                                                </div>

                                                {/* Moodle Integration */}
                                                <div className="flex flex-col sm:flex-row gap-4 justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900">Moodle LMS</h4>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">Bağlı <CheckCircle2 className="w-3 h-3 ml-1" /></span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">Eğitim Yönetim Sistemi entegrasyonu (REST API).</p>
                                                        <p className="text-xs font-medium text-gray-400 mt-2 font-mono">https://lms.moderngelisim.org.tr</p>
                                                    </div>
                                                    <button className="self-start text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg bg-white">Yapılandır</button>
                                                </div>

                                                {/* Anthropic AI Integration */}
                                                <div className="flex flex-col sm:flex-row gap-4 justify-between p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
                                                    <div className="flex-1 w-full max-w-lg">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-indigo-900">Anthropic Claude AI</h4>
                                                            {anthropicKey ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">Bağlı <CheckCircle2 className="w-3 h-3 ml-1" /></span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Eksik <AlertCircle className="w-3 h-3 ml-1" /></span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-indigo-700 mt-1 mb-3">AI Asistan için kullanılan Anthropic API Anahtarı.</p>
                                                        <input
                                                            type="password"
                                                            placeholder="sk-ant-api..."
                                                            value={anthropicKey}
                                                            onChange={(e) => setAnthropicKey(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-white"
                                                        />
                                                        <p className="text-[11px] text-gray-500 mt-1.5">Key sadece .env.local üzerinden sisteme aktarılır. Arayüz geçici test içindir.</p>
                                                    </div>
                                                </div>

                                                {/* n8n Integration */}
                                                <div className="flex flex-col sm:flex-row gap-4 justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/30 opacity-70">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900">n8n Otomasyonları</h4>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">Yakında</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">Mevcut workflow'ların harici webhook tetikleyicileri.</p>
                                                    </div>
                                                    <button disabled className="self-start text-sm font-medium text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg bg-gray-50 cursor-not-allowed">Hizmet Dışı</button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
