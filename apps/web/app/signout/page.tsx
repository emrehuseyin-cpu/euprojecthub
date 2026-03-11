'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function SignOutPage() {
    useEffect(() => {
        const signOut = async () => {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
            window.location.replace('/login');
        };
        signOut();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2a4a 50%, #1e1b4b 100%)' }}>
            <Loader2 className="animate-spin text-indigo-400 mb-3" size={28} />
            <p className="text-slate-400 text-sm">Signing out...</p>
        </div>
    );
}
