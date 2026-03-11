"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    UserPlus,
    Save,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const participantSchema = z.object({
    first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    country: z.string().min(2, 'Ülke seçiniz'),
    birth_year: z.number().min(1900, 'Geçerli bir yıl giriniz').max(new Date().getFullYear(), 'Geçersiz yıl'),
    gender: z.string().min(1, 'Cinsiyet seçiniz'),
    project_id: z.string().min(1, 'Lütfen bir proje seçiniz'),
    activity_id: z.string().optional(),
    status: z.string().min(1, 'Durum seçiniz'),
    fewer_opportunities: z.boolean().default(false),
    gdpr_consent: z.boolean().refine(val => val === true, { message: "Veri saklama onayını kabul etmelisiniz" }),
});

type ParticipantFormValues = {
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    birth_year: number;
    gender: string;
    project_id: string;
    status: string;
    gdpr_consent: boolean;
    fewer_opportunities?: boolean;
    activity_id?: string;
};

export default function NewParticipantPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ParticipantFormValues>({
        resolver: zodResolver(participantSchema),
        defaultValues: {
            status: 'Beklemede',
            gender: 'Belirtmek İstemiyorum',
            fewer_opportunities: false,
            gdpr_consent: false
        }
    });

    const selectedProjectId = watch('project_id');

    useEffect(() => {
        async function loadProjects() {
            const { data, error } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        }
        loadProjects();
    }, []);

    useEffect(() => {
        async function loadActivities() {
            if (!selectedProjectId) {
                setActivities([]);
                return;
            }
            setLoadingActivities(true);
            const { data, error } = await supabase
                .from('activities')
                .select('id, title')
                .eq('project_id', selectedProjectId);

            if (data) setActivities(data);
            setLoadingActivities(false);
        }
        loadActivities();
    }, [selectedProjectId]);

    const onSubmit = async (data: ParticipantFormValues) => {
        try {
            setSubmitError(null);

            const { data: insertedParticipant, error } = await supabase
                .from('participants')
                .insert([
                    {
                        project_id: data.project_id,
                        activity_id: data.activity_id || null, // null if empty string
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        country: data.country,
                        birth_year: data.birth_year,
                        gender: data.gender,
                        status: data.status,
                        fewer_opportunities: data.fewer_opportunities
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            // Removed consent_records creation logic from Phase 3

            trackEvent('participant_added', {
                project_id: data.project_id,
                activity_id: data.activity_id,
                country: data.country,
                gender: data.gender,
                fewer_opportunities: data.fewer_opportunities,
                status: data.status
            });

            router.push('/katilimcilar');
            router.refresh();
        } catch (error: any) {
            trackError(error, { context: 'create_participant' });
            console.error('Error creating participant:', error);
            setSubmitError('Kayıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const countries = [
        "Türkiye", "Almanya", "Fransa", "İtalya", "İspanya", "İngiltere",
        "Hollanda", "Belçika", "Yunanistan", "Bulgaristan", "Romanya", "Polonya"
    ].sort();

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
                                href="/participants"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Katılımcı Listesine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <UserPlus className="text-blue-600 w-6 h-6" />
                                    Yeni Katılımcı Kaydı
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Proje faaliyetlerine, toplantılarına veya eğitimlerine katılacak yeni bir kişiyi sisteme ekleyin.
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

                                    {/* Personal Detail Group */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Kişisel Bilgiler</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ad <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="first_name"
                                                    type="text"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.first_name ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('first_name')}
                                                />
                                                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Soyad <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="last_name"
                                                    type="text"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.last_name ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('last_name')}
                                                />
                                                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    E-posta <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('email')}
                                                />
                                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ülke <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="country"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.country ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('country')}
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="birth_year" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Doğum Yılı <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="birth_year"
                                                        type="number"
                                                        placeholder="1990"
                                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.birth_year ? 'border-red-300' : 'border-gray-300'}`}
                                                        {...register('birth_year', { valueAsNumber: true })}
                                                    />
                                                    {errors.birth_year && <p className="mt-1 text-sm text-red-600">{errors.birth_year.message}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Cinsiyet
                                                    </label>
                                                    <select
                                                        id="gender"
                                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.gender ? 'border-red-300' : 'border-gray-300'}`}
                                                        {...register('gender')}
                                                    >
                                                        <option value="Kadın">Kadın</option>
                                                        <option value="Erkek">Erkek</option>
                                                        <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Alignment Group */}
                                    <div className="pt-2">
                                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Proje ve İdari Durum</h3>
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
                                                        setValue('activity_id', ''); // Reset activity when project changes
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
                                                <label htmlFor="activity_id" className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                                                    <span>Faaliyet (İsteğe Bağlı)</span>
                                                    {loadingActivities && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                                                </label>
                                                <select
                                                    id="activity_id"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                                    {...register('activity_id')}
                                                    disabled={!selectedProjectId || loadingActivities}
                                                >
                                                    <option value="">Genel Katılımcı</option>
                                                    {activities.map(a => (
                                                        <option key={a.id} value={a.id}>{a.title}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Başvuru/Kayıt Durumu
                                                </label>
                                                <select
                                                    id="status"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.status ? 'border-red-300' : 'border-gray-300'}`}
                                                    {...register('status')}
                                                >
                                                    <option value="Beklemede">Beklemede</option>
                                                    <option value="Onaylandı">Onaylandı</option>
                                                    <option value="Reddedildi">Reddedildi</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* GDPR & Additional Info */}
                                    <div className="pt-2">
                                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Özel Durum ve İzinler (GDPR)</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                                                <input
                                                    id="fewer_opportunities"
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    {...register('fewer_opportunities')}
                                                />
                                                <div>
                                                    <label htmlFor="fewer_opportunities" className="font-medium text-gray-900 text-sm">Fewer Opportunities (Dezavantajlı/Engelli)</label>
                                                    <p className="text-xs text-gray-500 mt-0.5">Katılımcı Erasmus+ kapsamında engelli veya dezavantajlı grupta yer alıyor mu?</p>
                                                </div>
                                            </div>

                                            <div className={`flex items-start gap-3 p-4 border rounded-lg ${errors.gdpr_consent ? 'border-red-300 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/30'}`}>
                                                <input
                                                    id="gdpr_consent"
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                                                    {...register('gdpr_consent')}
                                                />
                                                <div>
                                                    <label htmlFor="gdpr_consent" className="font-medium text-gray-900 text-sm">
                                                        Kurum Onayı <span className="text-red-500">*</span>
                                                    </label>
                                                    <p className="text-xs text-gray-600 mt-0.5">
                                                        "Bu katılımcının verilerinin platformda saklanmasına kuruluşumuz onay almıştır"
                                                    </p>
                                                    {errors.gdpr_consent && <p className="text-xs text-red-600 mt-1">{errors.gdpr_consent.message}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Area */}
                                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                        <Link
                                            href="/participants"
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
                                                    Katılımcıyı Kaydet
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
