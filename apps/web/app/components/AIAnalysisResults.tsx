"use client";

import React from 'react';
import { Target, Zap, ShieldCheck, MessageSquare } from 'lucide-react';

interface AIAnalysisProps {
    analysis: string;
    validation: any;
}

export function AIAnalysisResults({ analysis, validation }: AIAnalysisProps) {
    // Generate mock/extracted scores for visuals
    const scores = [
        { label: 'Relevance', value: 85, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Quality', value: 70, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Impact', value: 90, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scores.map((score) => (
                    <div key={score.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover-lift glass">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-xl ${score.bg} ${score.color}`}>
                                <score.icon size={20} />
                            </div>
                            <span className="text-2xl font-black text-gray-900">{score.value}%</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{score.label}</p>
                        <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${score.color.replace('text', 'bg')}`}
                                style={{ width: `${score.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Analysis Text */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden glass">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-600" />
                    <h3 className="font-bold text-gray-900">Expert Feedback Analysis</h3>
                </div>
                <div className="p-8 prose prose-indigo max-w-none text-gray-700 leading-relaxed">
                    <div className="whitespace-pre-wrap">{analysis}</div>
                </div>
            </div>

            {/* Validation Badges */}
            {!validation.valid && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-900 text-sm">Critical Compliance Issues</h4>
                        <ul className="mt-2 space-y-1">
                            {validation.errors.map((err: string, i: number) => (
                                <li key={i} className="text-xs text-red-700 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
