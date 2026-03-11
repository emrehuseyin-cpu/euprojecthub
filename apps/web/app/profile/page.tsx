'use client';

import { useAuth } from '../lib/AuthContext';
import { User, Mail, Building2, Shield } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin', org_admin: 'Org Admin',
    member: 'Member', participant: 'Participant',
};
const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-red-500/10 text-red-600 border-red-200',
    org_admin: 'bg-purple-500/10 text-purple-600 border-purple-200',
    member: 'bg-blue-500/10 text-blue-600 border-blue-200',
    participant: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

export default function ProfilePage() {
    const { user, profile, role, orgName, displayName, initials } = useAuth();

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-black text-gray-900 mb-6">My Profile</h1>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Avatar Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-10 flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                        {initials}
                    </div>
                    <div>
                        <p className="text-white text-xl font-black">{displayName}</p>
                        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30 mt-1">
                            {ROLE_LABELS[role] || role}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Mail size={18} className="text-gray-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
                            <p className="text-gray-900 font-semibold text-sm">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Shield size={18} className="text-gray-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Role</p>
                            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[role] || ROLE_COLORS.member}`}>
                                {ROLE_LABELS[role] || role}
                            </span>
                        </div>
                    </div>

                    {orgName && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <Building2 size={18} className="text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Organization</p>
                                <p className="text-gray-900 font-semibold text-sm">{orgName}</p>
                            </div>
                        </div>
                    )}

                    {profile?.first_name && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <User size={18} className="text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Full Name</p>
                                <p className="text-gray-900 font-semibold text-sm">{profile.first_name} {profile.last_name}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
