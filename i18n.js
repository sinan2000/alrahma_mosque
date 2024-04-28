import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './translations/en.json';
import nl from './translations/nl.json';

const locales = Localization.getLocales();
const preferredLocale = locales[0].languageCode;

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            nl: { translation: nl },
        },
        lng: preferredLocale,	
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;