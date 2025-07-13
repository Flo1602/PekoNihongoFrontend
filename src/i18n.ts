import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';
//import translationJA from './locales/ja/translation.json';

const resources = {
    en: { translation: translationEN },
    de: { translation: translationDE },
    //ja: { translation: translationJA },
};

i18n
    .use(LanguageDetector) // auto-detect browser language
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en', // default language
        interpolation: {
            escapeValue: false, // React already escapes values
        },
    });

export default i18n;
