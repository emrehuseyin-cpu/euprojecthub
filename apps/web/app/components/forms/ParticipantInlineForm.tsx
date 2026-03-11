"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const participantSchema = z.object({
    first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    country: z.string().min(2, 'Ülke seçiniz'),
    birth_year: z.number().min(1900, 'Geçerli bir yıl giriniz').max(new Date().getFullYear(), 'Geçersiz yıl'),
    gender: z.string().min(1, 'Cinsiyet seçiniz'),
    activity_id: z.string().optional(),
    status: z.string().min(1, 'Durum seçiniz'),
    fewer_opportunities: z.boolean(),
    gdpr_consent: z.boolean().refine(val => val === true, { message: "Onay gereklidir" }),
});

type ParticipantFormValues = {
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    birth_year: number;
    gender: string;
    activity_id?: string;
    status: string;
    fewer_opportunities: boolean;
    gdpr_consent: boolean;
};

interface Props {
    projectId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const countries = [
    "Türkiye", "Almanya", "Fransa", "İtalya", "İspanya", "İngiltere",
    "Hollanda", "Belçika", "Yunanistan", "Bulgaristan", "Romanya", "Polonya"
].sort();

export function ParticipantInlineForm({ projectId, onSuccess, onCancel }: Props) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ParticipantFormValues>({
        resolver: zodResolver(participantSchema),
        defaultValues: {
            status: 'Beklemede',
            gender: 'Belirtmek İstemiyorum',
            fewer_opportunities: false,
            gdpr_consent: false,
            birth_year: 1990
        }
    });

    useEffect(() => {
        async function loadActivities() {
            setLoadingActivities(true);
            const { data } = await supabase
                .from('activities')
                .select('id, title')
                .eq('project_id', projectId);

            if (data) setActivities(data);
            setLoadingActivities(false);
        }
        loadActivities();
    }, [projectId]);

    const onSubmit = async (data: ParticipantFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('participants')
                .insert([
                    {
                        project_id: projectId,
                        activity_id: data.activity_id || null,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        country: data.country,
                        birth_year: data.birth_year,
                        gender: data.gender,
                        status: data.status,
                        fewer_opportunities: data.fewer_opportunities
                    }
                ]);

            if (error) throw error;

            trackEvent('participant_added_inline', {
                project_id: projectId,
                activity_id: data.activity_id
            });

            onSuccess();
        } catch (error: any) {
            trackError(error, { context: 'create_participant_inline' });
            setSubmitError('Katılımcı kaydedilirken bir hata oluştu.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {submitError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-xs">
                    {submitError}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ad</label>
                    <input
                        type="text"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.first_name ? 'border-red-300' : 'border-gray-200'}`}
                        {...register('first_name')}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Soyad</label>
                    <input
                        type="text"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.last_name ? 'border-red-300' : 'border-gray-200'}`}
                        {...register('last_name')}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">E-posta</label>
                <input
                    type="email"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="ornek@mail.com"
                    {...register('email')}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ülke</label>
                    <select
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none"
                        {...register('country')}
                    >
                        <option value="">Seçiniz</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Doğum Yılı</label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        {...register('birth_year', { valueAsNumber: true })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Cinsiyet</label>
                    <select
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none"
                        {...register('gender')}
                    >
                        <option value="Kadın">Kadın</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">İlgili Faaliyet</label>
                    <select
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none"
                        {...register('activity_id')}
                        disabled={loadingActivities}
                    >
                        <option value="">Genel Katılımcı</option>
                        {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2 py-1">
                <input
                    id="fewer_opportunities_inline"
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    {...register('fewer_opportunities')}
                />
                <label htmlFor="fewer_opportunities_inline" className="text-xs text-gray-600 cursor-pointer">
                    Dezavantajlı (Fewer Opportunities)
                </label>
            </div>

            <div className="flex items-center gap-2 py-1">
                <input
                    id="gdpr_consent_inline"
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    {...register('gdpr_consent')}
                />
                <label htmlFor="gdpr_consent_inline" className="text-xs text-gray-600 cursor-pointer font-medium">
                    Kurum Onayı (Veri Saklama İzni) <span className="text-red-500">*</span>
                </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    Katılımcı Ekle
                </button>
            </div>
        </form>
    );
}
