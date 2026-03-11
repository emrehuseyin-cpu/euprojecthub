import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    try {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.capture(eventName, properties);
        }
    } catch (e) {
        console.error("Failed to track event:", e);
    }
};

export const trackError = (error: Error | unknown, context?: Record<string, any>) => {
    try {
        console.error("Tracking Error:", error);
        Sentry.captureException(error, {
            extra: context
        });
    } catch (e) {
        console.error("Failed to track error to Sentry:", e);
    }
};
