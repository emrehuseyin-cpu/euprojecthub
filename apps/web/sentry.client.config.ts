import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://3f8a05d77dcd0fcbaf1102e604fad1c9@o4511011625500672.ingest.de.sentry.io/4511011632054352",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
});
