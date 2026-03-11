"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    FileText,
    Save,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const reportSchema = z.object({
    project_id: z.string().min(1, 'Lütfen bir proje seçiniz'),
    title: z.string().min(3, 'Rapor başlığı en az 3 karakter olmalıdır'),
    type: z.string().min(1, 'Lütfen bir rapor türü seçiniz'),
    content: z.string().min(10, 'Rapor içeriği çok kısa, lütfen detaylandırın'),
    status: z.string().min(1, 'Durum seçiniz'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function NewReportPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            status: 'Taslak',
            type: 'Ara Rapor'
        }
    });

    useEffect(() => {
        async function loadProjects() {
            const { data, error } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        }
        loadProjects();
    }, []);

    const onSubmit = async (data: ReportFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('reports')
                .insert([
                    {
                        project_id: data.project_id,
                        title: data.title,
                        type: data.type,
                        content: data.content,
                        status: data.status,
                    }
                ]);

            if (error) throw error;

            trackEvent('report_generated', {
                project_id: data.project_id,
                type: data.type,
                status: data.status
            });

            router.push('/raporlar');
            router.refresh();
        } catch (error: any) {
            trackError(error, { context: 'create_report' });
            console.error('Error creating report:', error);
            setSubmitError('Rapor kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
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
                                href="/reports"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Raporlar Listesine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="text-blue-600 w-6 h-6" />
                                    Yeni Rapor Oluştur
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Proje süreçlerinizi detaylandıran yeni bir rapor veya doküman taslağı ekleyin.
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                        {/* Rapor Türü */}
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Rapor Türü <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="type"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.type ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('type')}
                                            >
                                                <option value="Ara Rapor">Ara Rapor</option>
                                                <option value="Final Rapor">Final Rapor</option>
                                                <option value="Faaliyet Raporu">Faaliyet Raporu</option>
                                                <option value="Bütçe Raporu">Bütçe Raporu</option>
                                            </select>
                                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                                        </div>
                                    </div>

                                    {/* Rapor Başlığı */}
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Rapor Başlığı <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Örn: 2026 Q1 Finansal Ara Raporu"
                                            {...register('title')}
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                                    </div>

                                    {/* Durum */}
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mevcut Durum <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="status"
                                            className={`w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.status ? 'border-red-300' : 'border-gray-300'}`}
                                            {...register('status')}
                                        >
                                            <option value="Taslak">Taslak</option>
                                            <option value="İncelemede">İncelemeye Gönder</option>
                                            <option value="Onaylandı">Doğrudan Onayla</option>
                                        </select>
                                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                                    </div>

                                    {/* Rapor İçeriği */}
                                    <div>
                                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                            Özet / İçerik <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="content"
                                            rows={8}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${errors.content ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Raporun detaylarını veya özet metnini buraya giriniz..."
                                            {...register('content')}
                                        ></textarea>
                                        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
                                    </div>

                                    {/* Submit Area */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <Link
                                            href="/reports"
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
                                                    Rapor Kaydediliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Raporu Kaydet
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
