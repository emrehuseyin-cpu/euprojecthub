"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    Users,
    Save,
    Loader2
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const partnerSchema = z.object({
    name: z.string().min(2, 'Kurum adı en az 2 karakter olmalıdır'),
    country: z.string().min(2, 'Lütfen geçerli bir ülke kodu giriniz (rn. TR)'),
    type: z.string().min(1, 'Lütfen kurum türünü seçiniz'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().url('Geçerli bir website adresi giriniz').optional().or(z.literal('')),
    project_id: z.string().min(1, 'Bağlı olduğu projeyi seçiniz')
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export default function NewPartnerPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerSchema),
    });

    useEffect(() => {
        async function loadProjects() {
            const { data, error } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        }
        loadProjects();
    }, []);

    const onSubmit = async (data: PartnerFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('partners')
                .insert([
                    {
                        name: data.name,
                        country: data.country.toUpperCase(),
                        type: data.type,
                        email: data.email || null,
                        phone: data.phone || null,
                        website: data.website || null,
                        project_id: data.project_id
                    }
                ]);

            if (error) throw error;

            trackEvent('partner_added', {
                partner_name: data.name,
                country: data.country,
                type: data.type,
                project_id: data.project_id
            });

            router.push('/ortaklar');
            router.refresh();
        } catch (error) {
            trackError(error, { context: 'create_partner' });
            console.error('Error creating partner:', error);
            setSubmitError('Ortak oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
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
                                href="/partners"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Ortaklar Listesine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="text-blue-600 w-6 h-6" />
                                    Yeni Ortak Ekle
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Proje konsorsiyumuna dahil olacak kurum veya kuruluşu ekleyin.
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
                                    {/* Kurum Adı */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Kurum / Kuruluş Adı <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Örn: Roma Eğitim Derneği"
                                            {...register('name')}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* ÜlkeKodu */}
                                        <div>
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                Ülke Kodu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="country"
                                                type="text"
                                                maxLength={3}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.country ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                                placeholder="Örn: IT, DE, TR"
                                                {...register('country')}
                                            />
                                            {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
                                        </div>

                                        {/* Kurum Türü */}
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Kurum Türü <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="type"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.type ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('type')}
                                            >
                                                <option value="">Seçiniz</option>
                                                <option value="STK">Sivil Toplum Kuruluşu (STK)</option>
                                                <option value="Üniversite">Üniversite / Akademi</option>
                                                <option value="Kamu">Kamu Kurumu</option>
                                                <option value="Özel">Özel Şirket / KOBİ</option>
                                            </select>
                                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                                        </div>
                                    </div>

                                    {/* Bağlı Proje */}
                                    <div>
                                        <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            Bağlı Olduğu Proje <span className="text-red-500">*</span>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* E-posta */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                İletişim E-posta
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                                placeholder="contact@institution.com"
                                                {...register('email')}
                                            />
                                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                                        </div>

                                        {/* Telefon */}
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Telefon Numarası
                                            </label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300`}
                                                placeholder="+39 06 1234567"
                                                {...register('phone')}
                                            />
                                        </div>
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                            Web Sitesi URL
                                        </label>
                                        <input
                                            id="website"
                                            type="url"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.website ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="https://www.institution.com"
                                            {...register('website')}
                                        />
                                        {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <Link
                                            href="/partners"
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
                                                    Ortak Ekleniyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Ortağı Kaydet
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
