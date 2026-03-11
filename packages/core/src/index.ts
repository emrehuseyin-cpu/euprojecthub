import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Core] Supabase URL or Anon Key is missing from environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Role = 'member' | 'org_admin' | 'super_admin';

export function isAtLeast(current: Role | undefined, target: Role): boolean {
    const roles: Role[] = ['member', 'org_admin', 'super_admin'];
    return roles.indexOf(current || 'member') >= roles.indexOf(target);
}

export * from './types';
