import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Standard client for non-auth operations (backwards compat)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SSR-aware browser client with cookie-based sessions
export function createSupabaseBrowserClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Auth helper functions
export async function getCurrentUser() {
    const client = createSupabaseBrowserClient();
    const { data: { user } } = await client.auth.getUser();
    return user;
}

export async function getCurrentProfile() {
    const client = createSupabaseBrowserClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    const { data } = await client
        .from('profiles')
        .select('*, organization:organizations(*)')
        .eq('id', user.id)
        .single();
    return data;
}

export async function signOut() {
    const client = createSupabaseBrowserClient();
    await client.auth.signOut();
}
