"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    User,
    ShieldCheck,
    Download,
    Trash2,
    Mail,
    Globe2,
    Calendar,
    Activity,
    AlertTriangle,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ParticipantDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [participant, setParticipant] = useState<any>(null);
    const [consent, setConsent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch participant with relations
                const { data: pData, error: pError } = await supabase
                    .from('participants')
                    .select(`
            *,
            project:projects(name),
            activity:activities(title)
          `)
                    .eq('id', params.id)
                    .single();

                if (pError) throw pError;
                if (pData) {
                    setParticipant({
                        ...pData,
                        projectName: pData.project ? pData.project.name : 'Genel',
                        activityName: pData.activity ? pData.activity.title : 'Genel'
                    });
                }

                // Fetch GDPR consent
                const { data: cData, error: cError } = await supabase
                    .from('consent_records')
                    .select('*')
                    .eq('participant_id', params.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (cData) setConsent(cData);
                // ignore cError since there might be no consent record for older ones
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.id]);

    const handleAnonymize = async () => {
        if (!confirm('Bu katılımcının kişisel verilerini anonimleştirmek istediğinize emin misiniz? İstatistiksel veriler kalacak, ancak kimliği tespit edilebilir bilgiler geri dönülemez şekilde silinecektir.')) {
            return;
        }

        try {
            setIsDeleting(true);

            const { error } = await supabase
                .from('participants')
                .update({
                    first_name: 'Anonim',
                    last_name: 'Kullanıcı',
                    email: `anonim_${Math.floor(Math.random() * 10000)}@redacted.com`,
                    status: 'Anonimleştirildi'
                })
                .eq('id', params.id);

            if (error) throw error;

            // Log erasure in data retention log
            await supabase.from('data_retention_log').insert([{
                table_name: 'participants',
                record_id: params.id,
                action: 'MANUAL_ANONYMIZATION',
                executed_at: new Date().toISOString()
            }]);

            alert('Kullanıcı başarıyla anonimleştirildi.');
            router.push('/katilimcilar');
        } catch (err) {
            console.error(err);
            alert('Anonimleştirme sırasında hata oluştu.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownloadData = () => {
        setIsDownloading(true);

        // Create GDPR compliant JSON payload
        const exportData = {
            user_info: {
                id: participant.id,
                first_name: participant.first_name,
                last_name: participant.last_name,
                email: participant.email,
                country: participant.country,
                birth_year: participant.birth_year,
                gender: participant.gender,
                fewer_opportunities: participant.fewer_opportunities,
                registration_date: participant.created_at
            },
            project_participation: {
                project: participant.projectName,
                activity: participant.activityName,
                status: participant.status
            },
            gdpr_consents: consent ? [
                {
                    type: consent.consent_type,
                    granted: consent.granted,
                    timestamp: consent.created_at,
                    ip_address: consent.ip_address || 'Bilinmiyor'
                }
            ] : []
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `gdpr_export_${participant.id.substring(0, 8)}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        setIsDownloading(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="mt-4 text-gray-500 font-medium">Katılımcı bilgileri yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!participant) {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                        <h2 className="text-xl font-bold">Kayıt Bulunamadı</h2>
                        <Link href="/participants" className="mt-4 text-blue-600 font-medium hover:underline">Listeye Dön</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* Top Navigation */}
                        <div>
                            <Link
                                href="/participants"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Katılımcı Listesine Dön
                            </Link>
                        </div>

                        {/* Profile Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl border border-blue-200 shadow-sm shrink-0">
                                        {participant.first_name.charAt(0)}{participant.last_name.charAt(0)}
                                    </div>
                                    <div className="text-center sm:text-left space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900">{participant.first_name} {participant.last_name}</h2>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-500 mt-2">
                                            <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400" /> {participant.email}</span>
                                            <span className="flex items-center"><Globe2 className="w-4 h-4 mr-1 text-gray-400" /> {participant.country}</span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${participant.status === 'Onaylandı' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                {participant.status}
                                            </span>
                                            {participant.fewer_opportunities && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                                                    Dezavantajlı / Özel Durum
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                    <button
                                        onClick={handleDownloadData}
                                        disabled={isDownloading}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Download className="w-4 h-4" /> Veriyi İndir (JSON)
                                    </button>
                                    <button
                                        onClick={handleAnonymize}
                                        disabled={isDeleting || participant.status === 'Anonimleştirildi'}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Veriyi Sil (Anonimleştir)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Left Column */}
                            <div className="md:col-span-2 space-y-6">

                                {/* Participation Details */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <Activity className="w-5 h-5 text-indigo-500" />
                                        Katılım Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Bağlı Proje</p>
                                            <p className="font-semibold text-gray-900">{participant.projectName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Katıldığı Faaliyet</p>
                                            <p className="font-semibold text-gray-900">{participant.activityName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Kayıt Tarihi</p>
                                            <p className="font-semibold text-gray-900">{format(parseISO(participant.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Demographics */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <User className="w-5 h-5 text-indigo-500" />
                                        Demografik Bilgiler
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Doğum Yılı</p>
                                            <p className="font-semibold text-gray-900">{participant.birth_year || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Güncel Yaş</p>
                                            <p className="font-semibold text-gray-900">{participant.birth_year ? new Date().getFullYear() - participant.birth_year : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Cinsiyet</p>
                                            <p className="font-semibold text-gray-900">{participant.gender || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column (GDPR Panel) */}
                            <div className="space-y-6">

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        <h3 className="font-bold text-white tracking-wide">GDPR Durumu</h3>
                                    </div>
                                    <div className="p-5">
                                        {consent ? (
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{consent.consent_type}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Veri işleme ve aktarım onayı alındı.</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2 mt-4">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-medium text-gray-500">Onay Tarihi:</span>
                                                        <span className="font-semibold text-gray-900">{format(parseISO(consent.created_at), 'dd MMM yyyy', { locale: tr })}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-medium text-gray-500">IP Adresi:</span>
                                                        <span className="font-mono text-gray-900">{consent.ip_address || "Sistem Üzerinden"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-center p-4">
                                                <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                                                <h4 className="font-semibold text-gray-900">Açık Onay Kaydı Yok</h4>
                                                <p className="text-xs text-gray-500 mt-1">Sistemde bu kullanıcıya ait açık rıza beyanı (GDPR Consent) bulunamadı. Kullanıcı sisteme eski yöntemle aktarılmış olabilir.</p>
                                            </div>
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
