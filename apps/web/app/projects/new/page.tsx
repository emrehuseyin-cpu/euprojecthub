"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    FolderKanban,
    Save,
    Loader2
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';
import { ERASMUS_PROGRAMS, validateProject } from '@euprojecthub/core';

const projectSchema = z.object({
    name: z.string().min(3, 'Proje adı en az 3 karakter olmalıdır'),
    program: z.string().min(1, 'Lütfen bir program seçiniz'),
    type: z.string().min(1, 'Lütfen proje türünü seçiniz'),
    startDate: z.string().min(1, 'Başlangıç tarihi zorunludur'),
    endDate: z.string().min(1, 'Bitiş tarihi zorunludur'),
    budget: z.string().min(1, 'Bütçe belirtmelisiniz'),
    description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
    partnerCount: z.number().min(1, 'En az 1 ortak belirtilmelidir'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<{ valid: boolean, errors: string[], warnings: string[] } | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            program: '',
            type: '',
            startDate: '',
            endDate: '',
            budget: '',
            description: '',
            partnerCount: 1,
        }
    });

    const selectedProgram = watch('program');

    // Erasmus specific rules extraction
    const erasmusKey = (selectedProgram && selectedProgram.startsWith('Erasmus+ '))
        ? selectedProgram.replace('Erasmus+ ', '') as keyof typeof ERASMUS_PROGRAMS
        : null;
    const erasmusRules = erasmusKey ? ERASMUS_PROGRAMS[erasmusKey] : null;

    const onSubmit = async (data: ProjectFormValues) => {
        try {
            setSubmitError(null);

            // Erasmus Validation
            if (erasmusKey) {
                const validation = validateProject({
                    program_type: erasmusKey,
                    partner_count: data.partnerCount,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    budget: data.budget
                });

                if (!validation.valid) {
                    setSubmitError(`Program Kuralları Hatası: ${validation.errors.join(', ')}`);
                    setValidationResult(validation);
                    return;
                }
                setValidationResult(validation);
            }

            const { error } = await supabase
                .from('projects')
                .insert([
                    {
                        name: data.name,
                        program: data.program,
                        budget: Number(data.budget.replace(/[^0-9.-]+/g, "")),
                        status: 'Aktif',
                        start_date: data.startDate,
                        end_date: data.endDate,
                        description: data.description,
                        partner_count: data.partnerCount,
                    }
                ]);

            if (error) {
                throw error;
            }

            // Track
            trackEvent('project_created', { project_name: data.name, program: data.program, budget: data.budget });

            // Redirect back to projects list after success
            router.push('/projeler');
            router.refresh();
        } catch (error) {
            trackError(error, { context: 'create_project' });
            console.error('Error creating project:', error);
            setSubmitError('Proje oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
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
                                href="/projects"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Projeler Listesine Dön
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FolderKanban className="text-blue-600 w-6 h-6" />
                                    Yeni Proje Oluştur
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Platformunuza yeni bir hibe girişinde bulunmak için aşağıdaki formu doldurun.
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
                                    {/* Proje Adı */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Proje Adı <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Örn: GreenFuture EU"
                                            {...register('name')}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Program */}
                                        <div>
                                            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                                                Hibe Programı <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="program"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.program ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('program')}
                                            >
                                                <option value="">Seçiniz</option>
                                                <option value="Erasmus+ KA220">Erasmus+ KA220 (İşbirliği Ortaklıkları)</option>
                                                <option value="Erasmus+ KA210">Erasmus+ KA210 (Küçük Ölçekli)</option>
                                                <option value="Erasmus+ KA152">Erasmus+ KA152 (Gençlik Değişimleri)</option>
                                                <option value="ESC30">ESC30 (Dayanışma Projeleri)</option>
                                                <option value="Horizon Europe">Horizon Europe</option>
                                            </select>
                                            {errors.program && <p className="mt-1 text-sm text-red-600">{errors.program.message}</p>}
                                        </div>

                                        {/* Proje Türü Kısaltması */}
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Kısa Tür Belirteci <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="type"
                                                type="text"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.type ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                                placeholder="Örn: Erasmus+, ESC vb."
                                                {...register('type')}
                                            />
                                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Başlangıç Tarihi */}
                                        <div>
                                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Başlangıç Tarihi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="startDate"
                                                type="date"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.startDate ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('startDate')}
                                            />
                                            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
                                        </div>

                                        {/* Bitiş Tarihi */}
                                        <div>
                                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Bitiş Tarihi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="endDate"
                                                type="date"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.endDate ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('endDate')}
                                            />
                                            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Bütçe */}
                                        <div>
                                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                                                Toplam Bütçe <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">€</span>
                                                </div>
                                                {erasmusRules && 'budgetOptions' in erasmusRules ? (
                                                    <select
                                                        id="budget"
                                                        className={`w-full pl-8 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.budget ? 'border-red-300' : 'border-gray-300'}`}
                                                        {...register('budget')}
                                                    >
                                                        <option value="">Lump Sum Seçiniz</option>
                                                        {(erasmusRules.budgetOptions as any).map((opt: number) => (
                                                            <option key={opt} value={opt}>€{opt.toLocaleString()}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        id="budget"
                                                        type="text"
                                                        className={`w-full pl-8 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.budget ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                                        placeholder="250,000"
                                                        {...register('budget')}
                                                    />
                                                )}
                                            </div>
                                            {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
                                            {erasmusRules && (
                                                <p className="mt-1.5 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                                                    ℹ️ <strong>{erasmusKey}</strong> kuralları gereği ön tanımlı lump sum bütçelerden biri seçilmelidir.
                                                </p>
                                            )}
                                        </div>

                                        {/* Ortak Sayısı */}
                                        <div>
                                            <label htmlFor="partnerCount" className="block text-sm font-medium text-gray-700 mb-1">
                                                Ortak Sayısı <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="partnerCount"
                                                type="number"
                                                min="1"
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.partnerCount ? 'border-red-300' : 'border-gray-300'}`}
                                                {...register('partnerCount', { valueAsNumber: true })}
                                            />
                                            {errors.partnerCount && <p className="mt-1 text-sm text-red-600">{errors.partnerCount.message}</p>}
                                            {erasmusRules && (
                                                <p className={`mt-1.5 text-xs p-2 rounded-md ${(erasmusRules as any).minPartners > (watch('partnerCount') || 0) ? 'text-red-600 bg-red-50 font-bold' : 'text-green-600 bg-green-50'}`}>
                                                    {(erasmusRules as any).minPartners > (watch('partnerCount') || 0)
                                                        ? `⚠️ En az ${(erasmusRules as any).minPartners} ortak gereklidir.`
                                                        : `✅ Minimum ortak şartı karşılanıyor.`}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Program Uyarıları / Bilgileri */}
                                    {erasmusRules && (
                                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                🇪🇺 Erasmus+ 2026 Kılavuz Bilgisi
                                            </h4>
                                            <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                                                <li><strong>Süre:</strong> {(erasmusRules as any).minDurationMonths}-{(erasmusRules as any).maxDurationMonths} ay arası.</li>
                                                <li><strong>Başvuru:</strong> {(erasmusRules as any).mainDeadline} (Ana Dönem)</li>
                                                {(erasmusRules as any).excludedCountries?.map((c: string) => (
                                                    <li key={c} className="text-red-500 underline font-medium">⚠️ {c} kuruluşları hibe kapsamı dışındadır.</li>
                                                ))}
                                                <li><strong>Kaynak:</strong> Erasmus+ Programme Guide 2026</li>
                                            </ul>
                                        </div>
                                    )}

                                    {validationResult && !validationResult.valid && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                            <p className="text-sm font-bold text-red-700">Kritik Hatalar:</p>
                                            <ul className="text-xs text-red-600 mt-1 list-disc ml-4">
                                                {validationResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Açıklama */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Proje Özeti / Açıklama <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={4}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                                            placeholder="Projenin temel hedeflerini ve faaliyetlerini kısaca özetleyin..."
                                            {...register('description')}
                                        ></textarea>
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <Link
                                            href="/projects"
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
                                                    Projeyi Kaydet
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
