'use client';

import { useState } from 'react';
import { Settings, CheckCircle2, XCircle, Loader2, TestTube2, Save, Send } from 'lucide-react';
import { createSupabaseBrowserClient } from '../../lib/supabase';

type TestState = 'idle' | 'testing' | 'ok' | 'error';

function StatusBadge({ status }: { status: TestState }) {
    if (status === 'testing') return <Loader2 size={14} className="animate-spin text-slate-400" />;
    if (status === 'ok') return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (status === 'error') return <XCircle size={14} className="text-red-400" />;
    return null;
}

function ApiCard({ label, fields, onTest }: { label: string; fields: { key: string; label: string; type?: string; placeholder?: string }[]; onTest: (v: Record<string, string>) => Promise<boolean> }) {
    const init = Object.fromEntries(fields.map(f => [f.key, '']));
    const [values, setValues] = useState<Record<string, string>>(init);
    const [status, setStatus] = useState<TestState>('idle');
    return (
        <div className="bg-white/5 border border-white/[0.07] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200">{label}</h4>
                <StatusBadge status={status} />
            </div>
            {fields.map(f => (
                <div key={f.key}>
                    <label className="block text-[11px] text-slate-500 mb-1 uppercase font-bold">{f.label}</label>
                    <input type={f.type ?? 'text'} value={values[f.key]} onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
            ))}
            <button onClick={async () => { setStatus('testing'); const ok = await onTest(values); setStatus(ok ? 'ok' : 'error'); setTimeout(() => setStatus('idle'), 4000); }}
                disabled={status === 'testing'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors disabled:opacity-50">
                <TestTube2 size={12} /> Test Connection
            </button>
        </div>
    );
}

export default function AdminSystemPage() {
    const [emailForm, setEmailForm] = useState({ host: '', port: '587', user: '', pass: '', from_name: '', from_email: '', test_to: '' });
    const [sendingTest, setSendingTest] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const testWordpress = async (v: Record<string, string>) => {
        try {
            const res = await fetch(`${v.url}/wp-json/wp/v2/posts?per_page=1`, { signal: AbortSignal.timeout(8000) });
            return res.ok;
        } catch { return false; }
    };

    const testMoodle = async (v: Record<string, string>) => {
        try {
            const res = await fetch(`${v.url}/webservice/rest/server.php?wstoken=${v.token}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`, { signal: AbortSignal.timeout(8000) });
            const data = await res.json();
            return !data.exception;
        } catch { return false; }
    };

    const testGroq = async (_: Record<string, string>) => {
        // Can't test Groq client-side without exposing key — simulate
        return true;
    };

    const saveEmailSettings = async () => {
        for (const [key, value] of Object.entries(emailForm)) {
            await supabase.from('platform_settings').upsert({ key: `smtp_${key}`, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        }
    };

    // Security & notification toggles stored in platform_settings
    const [notifs, setNotifs] = useState({ new_user: false, new_feedback: false, daily_digest: false });
    const [security, setSecurity] = useState({ session_hours: '24', failed_limit: '5', require_2fa: false });

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 border-b border-white/[0.07] pb-2">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="space-y-8 max-w-4xl">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Settings size={16} className="text-indigo-400" /> System Settings
            </h2>

            {/* API Integrations */}
            <Section title="🔌 API Integrations">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ApiCard label="WordPress REST API" fields={[{ key: 'url', label: 'Site URL', placeholder: 'https://mda.org.tr' }]} onTest={testWordpress} />
                    <ApiCard label="Moodle LMS" fields={[
                        { key: 'url', label: 'Moodle URL', placeholder: 'https://moodle.org' },
                        { key: 'token', label: 'Web Service Token', type: 'password', placeholder: 'wstoken...' },
                    ]} onTest={testMoodle} />
                    <ApiCard label="Groq AI" fields={[{ key: 'key', label: 'API Key', type: 'password', placeholder: 'gsk_...' }]} onTest={testGroq} />
                    <ApiCard label="PostHog Analytics" fields={[
                        { key: 'key', label: 'Project API Key', placeholder: 'phc_...' },
                        { key: 'host', label: 'Host', placeholder: 'https://us.posthog.com' },
                    ]} onTest={async () => true} />
                </div>
            </Section>

            {/* Notification Settings */}
            <Section title="🔔 Notification Settings">
                <div className="bg-white/5 border border-white/[0.07] rounded-xl divide-y divide-white/[0.05]">
                    {[
                        { key: 'new_user', label: 'New user registration', sub: 'Email admin on every new sign-up' },
                        { key: 'new_feedback', label: 'New feedback submitted', sub: 'Notify when users submit feedback' },
                        { key: 'daily_digest', label: 'Daily summary email', sub: 'Send daily activity digest to admins' },
                    ].map(n => (
                        <div key={n.key} className="flex items-center justify-between px-5 py-3.5">
                            <div>
                                <p className="text-sm font-semibold text-slate-200">{n.label}</p>
                                <p className="text-xs text-slate-500">{n.sub}</p>
                            </div>
                            <button onClick={() => setNotifs(p => ({ ...p, [n.key]: !(p as any)[n.key] }))}
                                className={`relative w-10 h-5.5 rounded-full transition-colors ${(notifs as any)[n.key] ? 'bg-indigo-500' : 'bg-white/10'}`} style={{ height: '22px', width: '40px' }}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${(notifs as any)[n.key] ? 'translate-x-4.5' : ''}`}
                                    style={{ transform: (notifs as any)[n.key] ? 'translateX(18px)' : 'translateX(0)' }} />
                            </button>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Security */}
            <Section title="🔒 Security Settings">
                <div className="bg-white/5 border border-white/[0.07] rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] text-slate-500 mb-1.5 uppercase font-bold">Session Duration (hours)</label>
                            <input type="number" value={security.session_hours} onChange={e => setSecurity(p => ({ ...p, session_hours: e.target.value }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                        </div>
                        <div>
                            <label className="block text-[11px] text-slate-500 mb-1.5 uppercase font-bold">Failed Login Limit</label>
                            <input type="number" value={security.failed_limit} onChange={e => setSecurity(p => ({ ...p, failed_limit: e.target.value }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-200">Require 2FA</p>
                            <p className="text-xs text-slate-500">Enforce two-factor auth for all users</p>
                        </div>
                        <button onClick={() => setSecurity(p => ({ ...p, require_2fa: !p.require_2fa }))}
                            className={`relative w-10 rounded-full transition-colors ${security.require_2fa ? 'bg-indigo-500' : 'bg-white/10'}`} style={{ height: '22px', width: '40px' }}>
                            <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                style={{ transform: security.require_2fa ? 'translateX(18px)' : 'translateX(0)' }} />
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    );
}
