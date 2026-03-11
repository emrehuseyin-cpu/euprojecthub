'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Role } from '@euprojecthub/core';

type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: Role;
    avatar_url: string | null;
    pinned_modules: string[] | null;
    organization_id: string | null;
    organization: {
        id: string;
        name: string;
        slug: string;
        country: string | null;
        logo_url: string | null;
    } | null;
};

type AuthCtx = {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    role: Role;
    orgName: string;
    displayName: string;
    initials: string;
    refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
    user: null, profile: null, loading: true, role: 'member' as Role,
    orgName: '', displayName: '', initials: '??', refetch: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid: string, currentUser?: User | null) => {
        const supabase = createSupabaseBrowserClient();
        console.log('[AuthContext] Fetching profile for:', uid);

        // Try RPC first (SECURITY DEFINER, bypasses RLS)
        const { data: rows, error: rpcError } = await supabase.rpc('get_my_profile');

        let profileData: any = null;

        if (!rpcError && rows && rows.length > 0) {
            console.log('[AuthContext] RPC Success:', rows[0].role);
            profileData = rows[0];
        } else {
            console.warn('[AuthContext] RPC Failed/Empty:', rpcError?.message || 'No data');
            // Fallback: direct table query (works if RLS disabled)
            const { data: fallback, error: tableError } = await supabase
                .from('profiles').select('*').eq('id', uid).single();

            if (!tableError && fallback) {
                console.log('[AuthContext] Table Fallback Success:', fallback.role);
                profileData = fallback;
            } else {
                console.error('[AuthContext] Table Fallback Failed:', tableError?.message);
            }
        }

        // Last resort: read role from JWT user_metadata (cached from previous session)
        if (!profileData) {
            const cachedRole = currentUser?.user_metadata?.role;
            if (cachedRole) {
                console.log('[AuthContext] Using cached role from metadata:', cachedRole);
                return {
                    id: uid, role: cachedRole, first_name: null, last_name: null,
                    avatar_url: null, organization_id: null, organization: null,
                    pinned_modules: null,
                } as Profile;
            }
            console.error('[AuthContext] No profile data or cached role found!');
            return null;
        }

        // Sync role to JWT user_metadata for future fallback if it changed
        if (profileData.role && currentUser?.user_metadata?.role !== profileData.role) {
            console.log('[AuthContext] Syncing role to metadata:', profileData.role);
            supabase.auth.updateUser({ data: { role: profileData.role } });
        }

        // Fetch org separately
        let organization = null;
        if (profileData.organization_id) {
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('id, name, slug, country, logo_url')
                .eq('id', profileData.organization_id)
                .single();
            if (!orgError) organization = orgData;
        }

        return { ...profileData, organization } as Profile | null;
    };

    const refetch = async () => {
        const supabase = createSupabaseBrowserClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        setUser(u);
        if (u) {
            const p = await fetchProfile(u.id, u);
            setProfile(p);
        } else {
            setProfile(null);
        }
    };

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        // Initial load
        supabase.auth.getUser().then(async ({ data: { user: u } }) => {
            setUser(u);
            if (u) {
                const p = await fetchProfile(u.id, u);
                setProfile(p);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                const p = await fetchProfile(u.id, u);
                setProfile(p);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Derive role: Prioritize user_metadata (which is instant) over profile (which is async)
    const role = (profile?.role ?? user?.user_metadata?.role ?? 'member') as Role;

    // The rest remains the same
    const orgName = profile?.organization?.name ?? '';
    const firstName = profile?.first_name ?? user?.user_metadata?.first_name ?? '';
    const lastName = profile?.last_name ?? user?.user_metadata?.last_name ?? '';
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : (user?.email ?? 'User');
    const initials = firstName && lastName
        ? `${firstName[0]}${lastName[0]}`.toUpperCase()
        : (user?.email?.[0]?.toUpperCase() ?? '??');

    return (
        <AuthContext.Provider value={{ user, profile, loading, role, orgName, displayName, initials, refetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
