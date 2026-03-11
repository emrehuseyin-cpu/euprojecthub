"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    FileSignature,
    Save,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const contractSchema = z.object({
    title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır'),
    type: z.string().min(1, 'Lütfen sözleşme türü seçiniz'),
    project_id: z.string().min(1, 'Lütfen bir proje seçiniz'),
    partner_id: z.string().optional(),
    status: z.string().min(1, 'Durum seçiniz'),
    signed_date: z.string().optional(),
    expiry_date: z.string().optional(),
}).refine(data => {
    // If partner_id is not required for Hibe Sözleşmesi but is required for Ortaklık
    if (data.type === 'Ortaklık Anlaşması' && (!data.partner_id || data.partner_id === '')) {
        return false;
    }
    return true;
}, {
    message: "Ortaklık Anlaşması için ilgili kurum/ortak seçilmelidir",
    path: ["partner_id"]
}).refine(data => {
    if (data.signed_date && data.expiry_date) {
        const start = new Date(data.signed_date);
        const end = new Date(data.expiry_date);
        return end >= start;
    }
    return true;
}, {
    message: "Bitiş tarihi imza tarihinden önce olamaz",
    path: ["expiry_date"]
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function NewContractPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setValue
    } = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            status: 'Beklemede',
            type: 'Ortaklık Anlaşması'
        }
    });

    const selectedProjectId = watch('project_id');
    const selectedType = watch('type');

    useEffect(() => {
        async function loadProjects() {
            const { data } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        }
        loadProjects();
    }, []);

    useEffect(() => {
        async function loadPartners() {
            if (!selectedProjectId) {
                setPartners([]);
                return;
            }
            setLoadingPartners(true);
            const { data } = await supabase
                .from('partners')
                .select('id, name')
                .eq('project_id', selectedProjectId);

            if (data) setPartners(data);
            setLoadingPartners(false);
        }
        loadPartners();
    }, [selectedProjectId]);

    const onSubmit = async (data: ContractFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('contracts')
                .insert([
                    {
                        project_id: data.project_id,
                        partner_id: data.partner_id || null, // null if empty string
                        title: data.title,
                        type: data.type,
                        status: data.status,
                        signed_date: data.signed_date || null,
                        expiry_date: data.expiry_date || null,
                    }
                ]);

            if (error) throw error;

            trackEvent('contract_created', {
                project_id: data.project_id,
                type: data.type,
                partner_id: data.partner_id
            });

            router.push('/sozlesmeler');
            router.refresh();
        } catch (error: any) {
            trackError(error, { context: 'create_contract' });
            console.error('Error creating contract:', error);
            setSubmitError('Sözleşme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Top Navigation */}
                        <div>
                            <Link
                                href="/contracts"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Sözleşmeler Listesine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileSignature className="text-blue-600 w-6 h-6" />
                                    Yeni Sözleşme Kaydı
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Proje ortaklıkları, hibeler veya hizmet alımları için yeni bir sözleşme kaydedin.
                                </p>
                            </div>

                            <div className="p-6 sm:p-8">
                                {submitError && (
                                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{submitError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                    {/* Head Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                                Sözleşme Başlığı / Konusu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="title"
                                                type="text"
                                                placeholder="Örn: Roma Eğitim Derneği Partnership Agreement 2026"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                                {...register('title')}
                                            />
                                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Sözleşme Türü <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="type"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.type ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('type')}
                                            >
                                                <option value="Ortaklık Anlaşması">Ortaklık Anlaşması (Mandate)</option>
                                                <option value="Hibe Sözleşmesi">Hibe Sözleşmesi (Grant)</option>
                                                <option value="Alt Sözleşme">Alt Sözleşme (Sub-contract)</option>
                                                <option value="Diğer">Diğer</option>
                                            </select>
                                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                Güncel Durum <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="status"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.status ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('status')}
                                            >
                                                <option value="Beklemede">Beklemede (İmza Aşaması)</option>
                                                <option value="İmzalandı">İmzalandı (Aktif)</option>
                                                <option value="Süresi Doldu">Süresi Doldu (Kapalı)</option>
                                            </select>
                                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                                        </div>
                                    </div>

                                    {/* Relational Group */}
                                    <div className="pt-2">
                                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Bağlantılar</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                    İlgili Proje <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="project_id"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.project_id ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('project_id')}
                                                    onChange={(e) => {
                                                        setValue('project_id', e.target.value);
                                                        setValue('partner_id', ''); // Reset partner when project changes
                                                    }}
                                                >
                                                    <option value="">Proje Seçiniz</option>
                                                    {projects.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                                {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="partner_id" className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                                                    <span>İlgili Kurum / Ortak</span>
                                                    {loadingPartners && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                                                </label>
                                                <select
                                                    id="partner_id"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400 ${errors.partner_id ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('partner_id')}
                                                    disabled={!selectedProjectId || loadingPartners || selectedType === 'Hibe Sözleşmesi'}
                                                >
                                                    <option value="">{selectedType === 'Hibe Sözleşmesi' ? 'Koordinatör Özel' : 'Kurum Seçiniz'}</option>
                                                    {partners.map(a => (
                                                        <option key={a.id} value={a.id}>{a.name}</option>
                                                    ))}
                                                </select>
                                                {errors.partner_id && <p className="mt-1 text-sm text-red-600">{errors.partner_id.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tracking Dates */}
                                    <div className="pt-2">
                                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Zaman Çizelgesi</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="signed_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                    İmza Tarihi <span className="text-gray-400 font-normal text-xs ml-1">(Opsiyonel)</span>
                                                </label>
                                                <input
                                                    id="signed_date"
                                                    type="date"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
                                                    {...register('signed_date')}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                                                    <span>Geçerlilik Bitiş Tarihi</span>
                                                    <span className="text-gray-400 font-normal text-xs">(Opsiyonel)</span>
                                                </label>
                                                <input
                                                    id="expiry_date"
                                                    type="date"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.expiry_date ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('expiry_date')}
                                                />
                                                {errors.expiry_date && <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>}
                                                <p className="text-xs text-gray-500 mt-1">Bu tarih geçtiğinde sözleşme durumu sistem tarafından otomatik işaretlenebilir.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Area */}
                                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                        <Link
                                            href="/contracts"
                                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            İptal
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Kaydediliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Sözleşmeyi Kaydet
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
