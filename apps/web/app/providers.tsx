'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LanguageProvider } from './lib/i18n';
import { AuthProvider } from './lib/AuthContext';

if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_exceptions: true,
        loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.debug()
        }
    })
}

function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && (window as any).posthog) {
            let url = window.origin + pathname;
            if (searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', {
                $current_url: url,
            });
        }
    }, [pathname, searchParams]);

    return null;
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <PostHogProvider client={posthog}>
                    <Suspense fallback={null}>
                        <PostHogPageView />
                    </Suspense>
                    {children}
                </PostHogProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}

