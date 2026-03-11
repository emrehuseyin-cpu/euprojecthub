"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    Activity,
    Save,
    Loader2
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const activitySchema = z.object({
    project_id: z.string().min(1, 'Faaliyetin bağlı olduğu projeyi seçiniz'),
    title: z.string().min(3, 'Faaliyet başlığı en az 3 karakter olmalıdır'),
    description: z.string().min(5, 'Faaliyet açıklaması giriniz'),
    location: z.string().min(2, 'Konum/Lokasyon belirtiniz'),
    start_date: z.string().min(1, 'Başlangıç tarihini seçiniz'),
    end_date: z.string().min(1, 'Bitiş tarihini seçiniz'),
    status: z.string().min(1, 'Durum seçiniz'),
    participant_count: z.string().min(1, 'Katılımcı sayısını giriniz (Yoksa 0 yazın)')
});

type ActivityFormValues = z.infer<typeof activitySchema>;

export default function NewActivityPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            status: 'Planlandı',
            participant_count: '0'
        }
    });

    useEffect(() => {
        async function loadProjects() {
            const { data, error } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        }
        loadProjects();
    }, []);

    const onSubmit = async (data: ActivityFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('activities')
                .insert([
                    {
                        project_id: data.project_id,
                        title: data.title,
                        description: data.description,
                        location: data.location,
                        start_date: data.start_date,
                        end_date: data.end_date,
                        status: data.status,
                        participant_count: parseInt(data.participant_count, 10),
                    }
                ]);

            if (error) throw error;

            trackEvent('activity_created', {
                project_id: data.project_id,
                status: data.status,
                participant_count: data.participant_count
            });

            router.push('/faaliyetler');
            router.refresh();
        } catch (error: any) {
            trackError(error, { context: 'create_activity' });
            console.error('Error creating activity:', error);
            setSubmitError('Faaliyet kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* Top Navigation Back */}
                        <div>
                            <Link
                                href="/activities"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Faaliyetler Listesine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Activity className="text-blue-600 w-6 h-6" />
                                    Yeni Faaliyet Planla
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Proje kapsamında gerçekleştirilecek toplantı, eğitim, hareketlilik veya etkinlikleri planlayın.
                                </p>
                            </div>

                            <div className="p-6 sm:p-8">
                                {submitError && (
                                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{submitError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Proje Seçimi */}
                                    <div>
                                        <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            İlgili Proje <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="project_id"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.project_id ? 'border-red-300' : 'border-gray-300'}`}
                                            {...register('project_id')}
                                        >
                                            <option value="">Proje Seçiniz</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>}
                                    </div>

                                    {/* Faaliyet Başlığı */}
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Etkinlik / Faaliyet Adı <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Örn: 2. Ulusötesi Proje Toplantısı (TPM2)"
                                            {...register('title')}
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Başlangıç Tarihi */}
                                        <div>
                                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                Başlangıç Tarihi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="start_date"
                                                type="date"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.start_date ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('start_date')}
                                            />
                                            {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
                                        </div>

                                        {/* Bitiş Tarihi */}
                                        <div>
                                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                Bitiş Tarihi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="end_date"
                                                type="date"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.end_date ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('end_date')}
                                            />
                                            {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Konum */}
                                        <div className="md:col-span-1">
                                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                                Konum / Platform <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="location"
                                                type="text"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.location ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Örn: Roma, İtalya veya Zoom"
                                                {...register('location')}
                                            />
                                            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
                                        </div>

                                        {/* Durum */}
                                        <div className="md:col-span-1">
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                Gerçekleşme Durumu <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="status"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.status ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('status')}
                                            >
                                                <option value="Planlandı">Planlandı</option>
                                                <option value="Devam Ediyor">Devam Ediyor</option>
                                                <option value="Tamamlandı">Tamamlandı</option>
                                            </select>
                                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                                        </div>

                                        {/* Katılımcı Sayısı */}
                                        <div className="md:col-span-1">
                                            <label htmlFor="participant_count" className="block text-sm font-medium text-gray-700 mb-1">
                                                Katılımcı Sayısı <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="participant_count"
                                                type="number"
                                                min="0"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.participant_count ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('participant_count')}
                                            />
                                            {errors.participant_count && <p className="mt-1 text-sm text-red-600">{errors.participant_count.message}</p>}
                                        </div>
                                    </div>

                                    {/* Detaylar */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Etkinlik Açıklaması / Gündem <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={4}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Faaliyetin içeriği, gündem maddeleri ve hedef kitlesini belirtin..."
                                            {...register('description')}
                                        ></textarea>
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <Link
                                            href="/activities"
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
                                                    Faaliyet Kaydediliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Faaliyeti Planla
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
