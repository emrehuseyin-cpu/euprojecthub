"use client";

import Link from 'next/link';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function UnauthorizedPage() {
    const { role } = useAuth();
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F8F9FC' }}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <ShieldX size={32} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 text-sm mb-2">You don't have permission to view this page.</p>
                <p className="text-xs text-gray-400 mb-7">
                    Your role: <span className="font-bold text-gray-600 capitalize">{role || 'member'}</span>
                </p>
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
