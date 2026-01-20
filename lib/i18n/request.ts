import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // Use es-MX for number formatting when locale is es
    const activeLocale = locale === 'es' ? 'es-MX' : locale;

    return {
        locale: activeLocale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
