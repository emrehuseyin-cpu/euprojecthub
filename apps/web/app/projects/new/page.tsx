"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    FolderKanban,
    Save,
    Loader2,
    Info,
    HelpCircle,
    AlertCircle,
    Calendar,
    Users,
    Wallet,
    Building2,
    CheckCircle2
} from 'lucide-react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { trackEvent, trackError } from '../../lib/analytics';
import { 
    validateProject
} from '@euprojecthub/core/src/erasmus/actions';
import { format } from 'date-fns';

const projectSchema = z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    programme_type: z.string().min(1, 'Please select a programme type'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    budget: z.string().min(1, 'Budget is required'),
    description: z.string().min(10, 'Summary must be at least 10 characters'),
    partnerCount: z.number().min(1, 'At least 1 partner is required'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<{ valid: boolean, errors: string[], warnings: string[] } | null>(null);
    const [erasmusActions, setErasmusActions] = useState<any[]>([]);
    const [isLoadingActions, setIsLoadingActions] = useState(true);

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
            programme_type: '',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: '',
            budget: '',
            description: '',
            partnerCount: 1,
        }
    });

    const programmeType = watch('programme_type');
    const partnerCount = watch('partnerCount');

    useEffect(() => {
        setIsLoadingActions(true);
        supabase
            .from('erasmus_actions')
            .select(`
                code, name_en, key_action, managing_body, deadline_round1, 
                deadline_round2, min_partners, min_countries, budget_type, 
                budget_options, min_budget_eur, max_budget_eur, 
                requires_eche, requires_accreditation, funding_rate_pct
            `)
            .eq('year', 2026)
            .order('key_action')
            .order('code')
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching actions:', error);
                    trackError(error, { context: 'fetch_erasmus_actions' });
                } else {
                    setErasmusActions(data || []);
                }
                setIsLoadingActions(false);
            });
    }, []);

    const grouped = useMemo(() => erasmusActions.reduce((acc, a) => {
        if (!acc[a.key_action]) acc[a.key_action] = [];
        acc[a.key_action].push(a);
        return acc;
    }, {} as Record<string, any[]>), [erasmusActions]);

    const KA_LABELS: Record<string, string> = {
        KA1: 'KA1 — Learning Mobility',
        KA2: 'KA2 — Cooperation', 
        KA3: 'KA3 — Policy Support',
        JM:  'JM — Jean Monnet',
    };

    function handleProgrammeSelect(code: string) {
        setValue('programme_type', code);
        if (code === 'other' || code === '') return;
        
        const action = erasmusActions.find(a => a.code === code);
        if (!action) return;
        
        // Auto-fill budget
        if (action.budget_options?.length > 0) {
            setValue('budget', action.budget_options[0].toString());
        } else if (action.min_budget_eur) {
            setValue('budget', action.min_budget_eur.toString());
        }
        
        // Auto-fill partners
        if (action.min_partners) {
            setValue('partnerCount', action.min_partners);
        }
    }

    const onSubmit = async (data: ProjectFormValues) => {
        try {
            setSubmitError(null);
            setValidationResult(null);

            const requestedBudget = Number(data.budget.toString().replace(/[^0-9.-]+/g, ""));
            const selectedAction = erasmusActions.find(a => a.code === data.programme_type);
            
            // Calculate duration for validation
            let durationMonths = 0;
            if (data.startDate && data.endDate) {
                const start = new Date(data.startDate);
                const end = new Date(data.endDate);
                durationMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            }

            // 1. Run Core Validation
            if (selectedAction) {
                const validation = await validateProject(supabase, {
                    action_code: selectedAction.code,
                    num_partners: data.partnerCount,
                    num_countries: 1, // Simplified for this context
                    duration_months: durationMonths,
                    requested_budget: requestedBudget,
                    has_eche: true, // Placeholder values for now
                    has_accreditation: true
                });

                if (!validation.valid) {
                    setValidationResult(validation);
                    setSubmitError('Program validation failed. Please check the rules box below.');
                    return;
                }
                setValidationResult(validation);
            }

            // 2. Insert into Supabase
            const { error } = await supabase
                .from('projects')
                .insert([
                    {
                        name: data.name,
                        program: selectedAction ? selectedAction.name_en : 'Other',
                        programme_type: data.programme_type,
                        budget: requestedBudget,
                        status: 'Aktif',
                        start_date: data.startDate,
                        end_date: data.endDate,
                        description: data.description,
                        partner_count: data.partnerCount,
                    }
                ]);

            if (error) throw error;

            trackEvent('project_created', { 
                project_name: data.name, 
                programme_type: data.programme_type, 
                budget: requestedBudget 
            });

            router.push('/projects');
            router.refresh();
        } catch (err: any) {
            trackError(err, { context: 'create_project' });
            console.error('Error creating project:', err);
            setSubmitError(err.message || 'An error occurred while creating the project.');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-3xl mx-auto space-y-6">

                        <div className="flex items-center justify-between">
                            <Link
                                href="/projects"
                                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Projects
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 bg-white">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <FolderKanban className="text-indigo-600 w-5 h-5" />
                                    </div>
                                    Create New Project
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 ml-11">
                                    Fill in the details below to initialize a new grant project on the platform.
                                </p>
                            </div>

                            <div className="p-8">
                                {submitError && (
                                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{submitError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Project Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5">
                                            Project Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                                            placeholder="e.g. GreenFuture Horizon 2026"
                                            {...register('name')}
                                        />
                                        {errors.name && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{errors.name.message}</p>}
                                    </div>

                                    {/* Programme Type */}
                                    <div>
                                        <label htmlFor="programme_type" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5">
                                            Programme Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="programme_type"
                                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white cursor-pointer ${errors.programme_type ? 'border-red-300' : 'border-gray-200'}`}
                                            value={programmeType}
                                            onChange={e => handleProgrammeSelect(e.target.value)}
                                        >
                                            <option value="">— Select a programme —</option>
                                            <option value="other">Other / Custom Fund</option>
                                            {isLoadingActions ? (
                                                <option disabled>Loading programmes...</option>
                                            ) : (
                                                Object.entries(grouped).map(([ka, acts]: any) => (
                                                    <optgroup key={ka} label={KA_LABELS[ka] || ka}>
                                                        {acts.map((a: any) => (
                                                            <option key={a.code} value={a.code}>
                                                                {a.code} — {a.name_en}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))
                                            )}
                                        </select>
                                        {errors.programme_type && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{errors.programme_type.message}</p>}
                                    </div>

                                    {/* Info Box for Selected Action */}
                                    {programmeType && programmeType !== 'other' && (() => {
                                        const action = erasmusActions.find(a => a.code === programmeType);
                                        if (!action) return null;
                                        
                                        // Calculate days until deadline
                                        const monthMap: Record<string, number> = {
                                            January:0, February:1, March:2, April:3, May:4, June:5,
                                            July:6, August:7, September:8, October:9, November:10, December:11
                                        };
                                        let daysLeft = null;
                                        if (action.deadline_round1) {
                                            const parts = action.deadline_round1.split(' ');
                                            if (parts.length >= 2) {
                                                const d = new Date(2026, monthMap[parts[1]], parseInt(parts[0]));
                                                daysLeft = Math.ceil((d.getTime() - Date.now()) / 86400000);
                                            }
                                        }
                                        
                                        return (
                                            <div className="mt-3 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Info size={14} />
                                                        Programme Rules
                                                    </span>
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-tight ${
                                                        action.managing_body === 'EACEA' 
                                                            ? 'bg-purple-100/80 text-purple-700' 
                                                            : 'bg-green-100/80 text-green-700'
                                                    }`}>
                                                        {action.managing_body === 'EACEA' ? '🏛️ EACEA' : '🏠 National Agency'}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    {action.deadline_round1 && (
                                                        <div className="bg-white/80 p-3 rounded-xl border border-blue-50">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Deadline</span>
                                                            <span className={`font-bold ${daysLeft !== null && daysLeft <= 30 ? 'text-red-600' : 'text-gray-800'}`}>
                                                                {action.deadline_round1} 2026
                                                                {daysLeft !== null && ` (${daysLeft}d left)`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {action.min_partners && (
                                                        <div className="bg-white/80 p-3 rounded-xl border border-blue-50">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Min Partnership</span>
                                                            <span className="font-bold text-gray-800">{action.min_partners} orgs from {action.min_countries} countries</span>
                                                        </div>
                                                    )}
                                                    {action.budget_options?.length > 0 && (
                                                        <div className="col-span-full bg-white/80 p-3 rounded-xl border border-blue-50">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Budget Options</span>
                                                            <span className="font-bold text-blue-600">
                                                                {action.budget_options.map((b: number) => '€' + b.toLocaleString()).join(' / ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {action.max_budget_eur && !action.budget_options?.length && (
                                                        <div className="bg-white/80 p-3 rounded-xl border border-blue-50">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Max EU Grant</span>
                                                            <span className="font-bold text-gray-800">€{action.max_budget_eur.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    <div className="bg-white/80 p-3 rounded-xl border border-blue-50">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Funding Rate</span>
                                                        <span className="font-bold text-gray-800">{action.funding_rate_pct}%</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {action.requires_eche && (
                                                        <div className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-start gap-2">
                                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                            <span>Erasmus Charter for Higher Education (ECHE) required for all EU HEIs.</span>
                                                        </div>
                                                    )}
                                                    {action.requires_accreditation && (
                                                        <div className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-start gap-2">
                                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                            <span>Valid Erasmus Accreditation required before applying.</span>
                                                        </div>
                                                    )}
                                                    {action.managing_body === 'EACEA' && (
                                                        <div className="text-[11px] text-purple-700 bg-purple-50/80 border border-purple-100 rounded-xl p-2.5 flex items-start gap-2">
                                                            <Building2 size={14} className="mt-0.5 shrink-0" />
                                                            <span>Central call — apply via EU Funding & Tenders Portal, not via National Agency.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Start Date */}
                                        <div>
                                            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5">
                                                Start Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="startDate"
                                                type="date"
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.startDate ? 'border-red-300' : 'border-gray-200'}`}
                                                {...register('startDate')}
                                            />
                                            {errors.startDate && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{errors.startDate.message}</p>}
                                        </div>

                                        {/* End Date */}
                                        <div>
                                            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5">
                                                End Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="endDate"
                                                type="date"
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.endDate ? 'border-red-300' : 'border-gray-200'}`}
                                                {...register('endDate')}
                                            />
                                            {errors.endDate && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{errors.endDate.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Total Budget */}
                                        <div>
                                            <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5">
                                                Total Budget (€) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                {(() => {
                                                    const action = erasmusActions.find(a => a.code === programmeType);
                                                    if (action?.budget_type === 'lump_sum' && action.budget_options?.length) {
                                                        return (
                                                            <select
                                                                id="budget"
                                                                className={`w-full pl-4 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none bg-white cursor-pointer ${errors.budget ? 'border-red-300' : 'border-gray-200'}`}
                                                                {...register('budget')}
                                                            >
                                                                <option value="">Select amount</option>
                                                                {action.budget_options.map((opt: number) => (
                                                                    <option key={opt} value={opt}>€{opt.toLocaleString()}</option>
                                                                ))}
                                                            </select>
                                                        );
                                                    }
                                                    return (
                                                        <input
                                                            id="budget"
                                                            type="text"
                                                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.budget ? 'border-red-300' : 'border-gray-200'}`}
                                                            placeholder="e.g. 250000"
                                                            {...register('budget')}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                            {errors.budget && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{errors.budget.message}</p>}
                                        </div>

                                        {/* Number of Partners */}
                                        <div>
                                            <label htmlFor="partnerCount" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5">
                                                Number of Partners <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="partnerCount"
                                                    type="number"
                                                    min="1"
                                                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${errors.partnerCount ? 'border-red-300' : 'border-gray-200'}`}
                                                    {...register('partnerCount', { valueAsNumber: true })}
                                                />
                                                {(() => {
                                                    const action = erasmusActions.find(a => a.code === programmeType);
                                                    if (action?.min_partners) {
                                                        return (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                                {partnerCount >= action.min_partners ? (
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                ) : (
                                                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                            {errors.partnerCount && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{errors.partnerCount.message}</p>}
                                            {(() => {
                                                const action = erasmusActions.find(a => a.code === programmeType);
                                                if (action?.min_partners && partnerCount < action.min_partners) {
                                                    return (
                                                        <p className="mt-1.5 text-[10px] text-amber-600 font-medium ml-1 flex items-center gap-1">
                                                            Requirement: Min {action.min_partners} partners
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>

                                    {/* Inline Validation Results */}
                                    {validationResult && (
                                        <div className="space-y-3 animate-in fade-in duration-500">
                                            {validationResult.errors.length > 0 && (
                                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                                    <p className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-2">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Critical Rule Violations:
                                                    </p>
                                                    <ul className="text-[11px] text-red-600 ml-4 list-disc space-y-1 opacity-90">
                                                        {validationResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                            {validationResult.warnings.length > 0 && (
                                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                                    <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-2">
                                                        <Info className="w-3.5 h-3.5" />
                                                        Important Warnings:
                                                    </p>
                                                    <ul className="text-[11px] text-amber-600 ml-4 list-disc space-y-1 opacity-90">
                                                        {validationResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Project Summary */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-0.5">
                                            Project Summary <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={5}
                                            className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                                            placeholder="Provide a brief overview of the project objectives and main activities..."
                                            {...register('description')}
                                        ></textarea>
                                        {errors.description && <p className="mt-1.5 text-xs text-red-600 font-medium ml-1">{errors.description.message}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                            <Info className="w-3 h-3" />
                                            Required fields are marked with *
                                        </div>
                                        <div className="flex gap-3">
                                            <Link
                                                href="/projects"
                                                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-70 disabled:shadow-none"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        Save Project
                                                    </>
                                                )}
                                            </button>
                                        </div>
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
