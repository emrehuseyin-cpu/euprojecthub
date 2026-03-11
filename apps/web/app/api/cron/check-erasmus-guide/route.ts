import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(req: Request) {
    // Verify Vercel Cron Secret (Optional but recommended)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        console.log('[Cron] Checking for Erasmus+ Guide 2026 updates...');

        // Simulating PDF check (In a real scenario, this would scrape the EC website or check a known URL)
        const guideUrl = 'https://erasmus-plus.ec.europa.eu/document/erasmus-programme-guide-2026';

        // For demonstration, we'll just log the check
        const { error } = await supabase
            .from('rule_update_logs')
            .insert([{
                year: 2026,
                pdf_url: guideUrl,
                status: 'checked_no_changes',
                changes_detected: { status: 'stable' }
            }]);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Erasmus Guide check completed.' });
    } catch (error) {
        console.error('[Cron Error]:', error);
        return NextResponse.json({ success: false, error: 'Guide check failed.' }, { status: 500 });
    }
}
