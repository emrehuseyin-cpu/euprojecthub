'use client';

import { Search, Bell, Globe, LogOut, User, Building2, Users, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../lib/AuthContext';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { isAtLeast } from '../lib/permissions';

export function Header() {
    const { locale, setLocale, t, languages } = useLanguage();
    const { displayName, initials, orgName, role } = useAuth();
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const currentLang = languages.find(l => l.code === locale) || languages[0];
    const router = useRouter();

    const handleSignOut = async () => {
        setShowUserMenu(false);
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                        type="text"
                        placeholder={t('header_search')}
                        className="pl-10 pr-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-72 text-sm text-gray-700 placeholder-gray-400 transition-all"
                    />
                </div>
                {orgName && (
                    <span className="hidden lg:block text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                        {orgName}
                    </span>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
                {/* Language Selector */}
                <div className="relative">
                    <button onClick={() => { setShowLangMenu(!showLangMenu); setShowUserMenu(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
                        <Globe size={14} className="text-gray-400" />
                        <span>{currentLang.label}</span>
                    </button>
                    {showLangMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                                {languages.map(l => (
                                    <button key={l.code} onClick={() => { setLocale(l.code); setShowLangMenu(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${locale === l.code ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        <span className="font-bold text-xs w-5">{l.label}</span>
                                        <span>{l.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                    <button onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false); }}
                        className="flex items-center gap-2.5 pl-3 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-indigo-100"
                            style={{ background: 'linear-gradient(135deg, #4F6EF7, #818CF8)' }}>
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-bold text-gray-900 leading-none">{displayName}</p>
                            <p className="text-xs text-gray-400 mt-0.5 capitalize">{role}</p>
                        </div>
                        <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                    </button>

                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            <div className="absolute right-0 top-14 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-xs font-bold text-gray-900">{displayName}</p>
                                    <p className="text-[11px] text-gray-400">{orgName}</p>
                                </div>
                                <Link href="/profile" onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <User size={14} className="text-gray-400" /> My Profile
                                </Link>
                                {isAtLeast(role, 'org_admin') && (
                                    <Link href="/users" onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <Users size={14} className="text-gray-400" /> Team Members
                                    </Link>
                                )}
                                {isAtLeast(role, 'org_admin') && (
                                    <Link href="/settings" onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <Building2 size={14} className="text-gray-400" /> Org Settings
                                    </Link>
                                )}
                                <div className="mt-1 pt-1 border-t border-gray-50">
                                    <a href="/api/auth/signout"
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                                        <LogOut size={14} /> Sign Out
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
