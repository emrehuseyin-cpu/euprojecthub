"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    Wallet,
    Save,
    Loader2
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const expenseSchema = z.object({
    project_id: z.string().min(1, 'Harcamanın ait olduğu projeyi seçiniz'),
    category: z.string().min(1, 'Lütfen bir harcama kategorisi seçiniz'),
    description: z.string().min(3, 'Harcama açıklaması en az 3 karakter olmalıdır'),
    spent_amount: z.string().min(1, 'Harcama tutarını giriniz'),
    date: z.string().min(1, 'Harcama tarihini seçiniz'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function NewExpensePage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
    });

    useEffect(() => {
        async function loadProjects() {
            const { data, error } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        }
        loadProjects();
    }, []);

    const onSubmit = async (data: ExpenseFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('budget_items')
                .insert([
                    {
                        project_id: data.project_id,
                        category: data.category,
                        description: data.description,
                        // Optionally could also set planned_amount = 0 here if needed by DB constraints
                        planned_amount: 0,
                        spent_amount: Number(data.spent_amount.replace(/[^0-9.-]+/g, "")),
                        date: data.date,
                    }
                ]);

            if (error) throw error;

            trackEvent('budget_item_added', {
                project_id: data.project_id,
                category: data.category,
                amount: data.spent_amount
            });

            router.push('/butce');
            router.refresh();
        } catch (error: any) {
            trackError(error, { context: 'create_budget_item' });
            console.error('Error creating expense:', error);
            setSubmitError('Harcama kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
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
                                href="/budget"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Bütçe Özetine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Wallet className="text-blue-600 w-6 h-6" />
                                    Yeni Harcama Ekle
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Gerçekleşen harcamaları projeye yansıtıp bütçe takibi yapmak için formu doldurun.
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

                                    {/* Kategori Seçimi */}
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Harcama Kategorisi <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="category"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.category ? 'border-red-300' : 'border-gray-300'}`}
                                            {...register('category')}
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value="Personel">Personel Giderleri</option>
                                            <option value="Seyahat">Seyahat ve Konaklama</option>
                                            <option value="Ekipman">Ekipman ve Malzeme</option>
                                            <option value="Hizmet Alımı">Hizmet Alımı</option>
                                            <option value="Diğer">Diğer Giderler</option>
                                        </select>
                                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Harcanan Tutar */}
                                        <div>
                                            <label htmlFor="spent_amount" className="block text-sm font-medium text-gray-700 mb-1">
                                                Gerçekleşen Tutar <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">€</span>
                                                </div>
                                                <input
                                                    id="spent_amount"
                                                    type="text"
                                                    className={`w-full pl-8 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.spent_amount ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                                    placeholder="2,500.00"
                                                    {...register('spent_amount')}
                                                />
                                            </div>
                                            {errors.spent_amount && <p className="mt-1 text-sm text-red-600">{errors.spent_amount.message}</p>}
                                        </div>

                                        {/* Tarih */}
                                        <div>
                                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                                Harcama Tarihi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="date"
                                                type="date"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.date ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('date')}
                                            />
                                            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
                                        </div>
                                    </div>

                                    {/* Fatura / Açıklama */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Fatura No / Harcama Detayı <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Uçak bileti fatura no: TR12345..."
                                            {...register('description')}
                                        ></textarea>
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <Link
                                            href="/budget"
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
                                                    Harcama Kaydediliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Harcamayı Kaydet
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
