import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// SSR-aware server client with cookie support
export const createSupabaseServerClient = cache(async () => {
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                }
            },
        },
    });
});

// Auth helper functions (Server - Cached)
export const getServerProfile = cache(async () => {
    const client = await createSupabaseServerClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    const { data } = await client
        .from('profiles')
        .select('*, organization:organizations(*)')
        .eq('id', user.id)
        .single();
    return data;
});
