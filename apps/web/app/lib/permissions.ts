// Role-based permission matrix
export type UserRole = 'super_admin' | 'org_admin' | 'member' | 'participant';

export type Module =
    | 'dashboard' | 'projects' | 'activities' | 'participants'
    | 'budget' | 'contracts' | 'partners' | 'webgate'
    | 'lms' | 'reports' | 'workflows' | 'ai_assistant'
    | 'users' | 'organizations' | 'settings';

const permissions: Record<UserRole, Module[]> = {
    super_admin: [
        'dashboard', 'projects', 'activities', 'participants',
        'budget', 'contracts', 'partners', 'webgate',
        'lms', 'reports', 'workflows', 'ai_assistant',
        'users', 'organizations', 'settings',
    ],
    org_admin: [
        'dashboard', 'projects', 'activities', 'participants',
        'budget', 'contracts', 'partners', 'webgate',
        'lms', 'reports', 'workflows', 'ai_assistant',
        'users', 'settings',
    ],
    member: [
        'dashboard', 'projects', 'activities', 'participants',
        'budget', 'contracts', 'partners', 'webgate',
        'lms', 'reports', 'workflows', 'ai_assistant',
    ],
    participant: ['dashboard', 'lms'],
};

export function canAccess(role: UserRole | string | null | undefined, module: Module): boolean {
    if (!role) return false;
    return (permissions[role as UserRole] ?? []).includes(module);
}

export function isAtLeast(role: UserRole | string | null | undefined, minRole: UserRole): boolean {
    const hierarchy: UserRole[] = ['participant', 'member', 'org_admin', 'super_admin'];
    const userLevel = hierarchy.indexOf((role ?? 'participant') as UserRole);
    const minLevel = hierarchy.indexOf(minRole);
    return userLevel >= minLevel;
}

export const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Org Admin',
    member: 'Member',
    participant: 'Participant',
};

export const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700 border-red-200',
    org_admin: 'bg-purple-100 text-purple-700 border-purple-200',
    member: 'bg-blue-100 text-blue-700 border-blue-200',
    participant: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};
