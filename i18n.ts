import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'tr', 'de', 'fr', 'es', 'it', 'pl', 'nl', 'pt', 'sv', 'ro', 'cs', 'hu', 'el'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    if (!locale || !locales.includes(locale)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
