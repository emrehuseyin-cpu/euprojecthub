"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const activitySchema = z.object({
    title: z.string().min(3, 'Faaliyet başlığı en az 3 karakter olmalıdır'),
    description: z.string().min(5, 'Faaliyet açıklaması giriniz'),
    location: z.string().min(2, 'Konum/Lokasyon belirtiniz'),
    start_date: z.string().min(1, 'Başlangıç tarihini seçiniz'),
    end_date: z.string().min(1, 'Bitiş tarihini seçiniz'),
    status: z.string().min(1, 'Durum seçiniz'),
    participant_count: z.string().min(1, 'Katılımcı sayısını giriniz (Yoksa 0 yazın)')
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface Props {
    projectId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ActivityInlineForm({ projectId, onSuccess, onCancel }: Props) {
    const [submitError, setSubmitError] = useState<string | null>(null);

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

    const onSubmit = async (data: ActivityFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('activities')
                .insert([
                    {
                        project_id: projectId,
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

            trackEvent('activity_created_inline', {
                project_id: projectId,
                status: data.status
            });

            onSuccess();
        } catch (error: any) {
            trackError(error, { context: 'create_activity_inline' });
            setSubmitError('Faaliyet kaydedilirken bir hata oluştu.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {submitError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-xs">
                    {submitError}
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faaliyet Adı</label>
                <input
                    type="text"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Örn: Açılış Toplantısı"
                    {...register('title')}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Başlangıç</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        {...register('start_date')}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bitiş</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        {...register('end_date')}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Konum</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Şehir veya Online"
                        {...register('location')}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Durum</label>
                    <select
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none"
                        {...register('status')}
                    >
                        <option value="Planlandı">Planlandı</option>
                        <option value="Devam Ediyor">Devam Ediyor</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Açıklama</label>
                <textarea
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Faaliyet detayları..."
                    {...register('description')}
                ></textarea>
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
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Kaydet
                </button>
            </div>
        </form>
    );
}
