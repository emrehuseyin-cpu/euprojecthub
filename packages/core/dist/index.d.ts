export declare const SUPABASE_URL: string;
export declare const SUPABASE_ANON_KEY: string;
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export type Role = 'member' | 'org_admin' | 'super_admin';
export declare function isAtLeast(current: Role | undefined, target: Role): boolean;
export * from './types';
export * from './erasmus/rules';
export * from './erasmus/validator';
export * from './eutenders/api';
