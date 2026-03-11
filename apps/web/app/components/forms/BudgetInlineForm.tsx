"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';

const expenseSchema = z.object({
    category: z.string().min(1, 'Lütfen bir harcama kategorisi seçiniz'),
    description: z.string().min(3, 'Harcama açıklaması en az 3 karakter olmalıdır'),
    spent_amount: z.string().min(1, 'Harcama tutarını giriniz'),
    date: z.string().min(1, 'Harcama tarihini seçiniz'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Props {
    projectId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function BudgetInlineForm({ projectId, onSuccess, onCancel }: Props) {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0]
        }
    });

    const onSubmit = async (data: ExpenseFormValues) => {
        try {
            setSubmitError(null);

            const { error } = await supabase
                .from('budget_items')
                .insert([
                    {
                        project_id: projectId,
                        category: data.category,
                        description: data.description,
                        planned_amount: 0,
                        spent_amount: Number(data.spent_amount.replace(/[^0-9.-]+/g, "")),
                        date: data.date,
                    }
                ]);

            if (error) throw error;

            trackEvent('budget_item_added_inline', {
                project_id: projectId,
                category: data.category,
                amount: data.spent_amount
            });

            onSuccess();
        } catch (error: any) {
            trackError(error, { context: 'create_budget_item_inline' });
            setSubmitError('Harcama kaydedilirken bir hata oluştu.');
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Harcama Kategorisi</label>
                <select
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none transition-all ${errors.category ? 'border-red-300' : 'border-gray-200'}`}
                    {...register('category')}
                >
                    <option value="">Seçiniz</option>
                    <option value="Personel">Personel Giderleri</option>
                    <option value="Seyahat">Seyahat ve Konaklama</option>
                    <option value="Ekipman">Ekipman ve Malzeme</option>
                    <option value="Hizmet Alımı">Hizmet Alımı</option>
                    <option value="Diğer">Diğer Giderler</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Harcama Tutarı (€)</label>
                    <input
                        type="text"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.spent_amount ? 'border-red-300' : 'border-gray-200'}`}
                        placeholder="2,500.00"
                        {...register('spent_amount')}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Harcama Tarihi</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        {...register('date')}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Açıklama / Fatura No</label>
                <textarea
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Harcama detayı..."
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
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                    Harcamayı Kaydet
                </button>
            </div>
        </form>
    );
}
