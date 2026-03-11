import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Protected routes requiring minimum role
const ROLE_GATES: Record<string, string> = {
    '/users': 'org_admin',
    '/organizations': 'super_admin',
};

const ROLE_HIERARCHY = ['participant', 'member', 'org_admin', 'super_admin'];

function hasRole(userRole: string | null | undefined, required: string) {
    if (!userRole) return false;
    return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(required);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const isLoginPage = pathname.startsWith('/login');
    const isAuthCallback = pathname.startsWith('/auth/callback');
    const isInvitePage = pathname.startsWith('/invite');
    const isUnauthorized = pathname.startsWith('/unauthorized');
    const isSignOut = pathname.startsWith('/signout');
    const isPublic = isLoginPage || isAuthCallback || isInvitePage || isUnauthorized || isSignOut;

    // Redirect unauthenticated users to login
    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect authenticated users away from login
    if (user && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Role-based route protection
    if (user) {
        for (const [route, requiredRole] of Object.entries(ROLE_GATES)) {
            if (pathname.startsWith(route)) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (!hasRole(profileData?.role, requiredRole)) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
                break;
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|images|favicon.ico|monitoring|ingest).*)',
    ],
};
