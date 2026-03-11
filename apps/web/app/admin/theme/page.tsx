'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { Palette, Save, RefreshCw, Loader2 } from 'lucide-react';

const FONTS = ['Inter', 'Poppins', 'Roboto', 'Nunito', 'DM Sans'];
const FONT_SIZES = [{ value: 'normal', label: 'Normal (14px)' }, { value: 'large', label: 'Large (15px)' }, { value: 'xl', label: 'Extra Large (16px)' }];
const SIDEBAR_WIDTHS = ['narrow', 'normal', 'wide'];
const CARD_RADIUS = ['none', 'small', 'normal', 'large'];
const TABLE_DENSITY = ['compact', 'normal', 'spacious'];

type ThemeSettings = {
    primary_color: string; sidebar_color: string; accent_color: string;
    font_family: string; font_size: string; dark_mode: string;
    sidebar_width: string; card_radius: string; table_density: string;
    platform_name: string; login_bg_color: string;
};

const DEFAULT: ThemeSettings = {
    primary_color: '#4F6EF7', sidebar_color: '#1E2A4A', accent_color: '#818CF8',
    font_family: 'Inter', font_size: 'normal', dark_mode: 'false',
    sidebar_width: 'normal', card_radius: 'normal', table_density: 'normal',
    platform_name: 'EUProjectHub', login_bg_color: '#0f172a',
};

export default function AdminThemePage() {
    const [settings, setSettings] = useState<ThemeSettings>(DEFAULT);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from('platform_settings').select('key, value');
            if (data) {
                const map: Record<string, string> = {};
                data.forEach(r => { map[r.key] = r.value ?? ''; });
                setSettings(prev => ({ ...prev, ...map }));
            }
            setLoading(false);
        }
        load();
    }, []);

    const set = (key: keyof ThemeSettings, value: string) =>
        setSettings(prev => ({ ...prev, [key]: value }));

    const save = async () => {
        setSaving(true);
        for (const [key, value] of Object.entries(settings)) {
            await supabase.from('platform_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        }
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const reset = () => setSettings(DEFAULT);

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="bg-white/5 border border-white/[0.07] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">{title}</h3>
            {children}
        </div>
    );

    const ColorPicker = ({ label, k }: { label: string; k: keyof ThemeSettings }) => (
        <div className="flex items-center gap-3">
            <input type="color" value={settings[k]} onChange={e => set(k, e.target.value)}
                className="w-10 h-10 rounded-xl border border-white/10 cursor-pointer bg-transparent" />
            <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">{label}</p>
                <p className="text-[11px] text-slate-500 font-mono">{settings[k]}</p>
            </div>
            <input value={settings[k]} onChange={e => set(k, e.target.value)}
                className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        </div>
    );

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-400" /></div>;

    return (
        <div className="space-y-5 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Palette size={16} className="text-indigo-400" /> UI & Theme Settings
                </h2>
                <div className="flex gap-2">
                    <button onClick={reset} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                        <RefreshCw size={12} /> Reset
                    </button>
                    <button onClick={save} disabled={saving}
                        className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white shadow-lg disabled:opacity-50 transition-all"
                        style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Live preview */}
            <div className="rounded-xl overflow-hidden border border-white/[0.07]">
                <div className="bg-white/5 px-4 py-2.5 border-b border-white/[0.07]">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Live Preview</p>
                </div>
                <div className="flex h-20">
                    <div className="w-28 flex items-center justify-center text-white text-xs font-black" style={{ background: settings.sidebar_color }}>
                        {settings.platform_name}
                    </div>
                    <div className="flex-1" style={{ background: '#F8F9FC' }}>
                        <div className="h-full flex items-center px-4 gap-3">
                            <div className="h-8 px-4 rounded-lg text-white text-xs font-bold flex items-center" style={{ background: settings.primary_color }}>{settings.font_family}</div>
                            <div className="h-8 px-4 rounded-lg text-white text-xs font-bold flex items-center" style={{ background: settings.accent_color }}>Accent</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Section title="🎨 Colors">
                    <ColorPicker label="Primary Color" k="primary_color" />
                    <ColorPicker label="Sidebar Color" k="sidebar_color" />
                    <ColorPicker label="Accent Color" k="accent_color" />
                    <ColorPicker label="Login Background" k="login_bg_color" />
                </Section>

                <Section title="✍️ Typography">
                    <div>
                        <label className="block text-[11px] text-slate-500 mb-2 uppercase font-bold">Font Family</label>
                        <div className="grid grid-cols-2 gap-2">
                            {FONTS.map(f => (
                                <button key={f} onClick={() => set('font_family', f)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${settings.font_family === f ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}
                                    style={{ fontFamily: f }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] text-slate-500 mb-2 uppercase font-bold">Font Size</label>
                        <div className="flex gap-2">
                            {FONT_SIZES.map(f => (
                                <button key={f.value} onClick={() => set('font_size', f.value)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${settings.font_size === f.value ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="🏷️ Branding">
                    {[{ label: 'Platform Name', key: 'platform_name', placeholder: 'EUProjectHub' }].map(f => (
                        <div key={f.key}>
                            <label className="block text-[11px] text-slate-500 mb-1.5 uppercase font-bold">{f.label}</label>
                            <input value={(settings as any)[f.key]} onChange={e => set(f.key as any, e.target.value)}
                                placeholder={f.placeholder}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>
                    ))}
                </Section>

                <Section title="📐 Layout">
                    {[
                        { label: 'Sidebar Width', key: 'sidebar_width', options: SIDEBAR_WIDTHS },
                        { label: 'Card Radius', key: 'card_radius', options: CARD_RADIUS },
                        { label: 'Table Density', key: 'table_density', options: TABLE_DENSITY },
                    ].map(g => (
                        <div key={g.key}>
                            <label className="block text-[11px] text-slate-500 mb-2 uppercase font-bold">{g.label}</label>
                            <div className="flex gap-2">
                                {g.options.map(o => (
                                    <button key={o} onClick={() => set(g.key as any, o)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${(settings as any)[g.key] === o ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                                        {o}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Dark Mode (Platform)</label>
                        <button onClick={() => set('dark_mode', settings.dark_mode === 'true' ? 'false' : 'true')}
                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.dark_mode === 'true' ? 'bg-indigo-500' : 'bg-white/10'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.dark_mode === 'true' ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
}
