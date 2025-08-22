import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import amCommon from '../locales/am/common.json';
import orCommon from '../locales/or/common.json';

// Load external translation resources
const resources = {
  en: {
    common: {
      ...enCommon,
      // Add any additional basic translations here
      welcome: "Welcome",
      login: "Login",
      logout: "Logout",
      home: "Home"
    }
  },
  am: {
    common: {
      ...amCommon,
      welcome: "እንኳን ደህና መጡ",
      login: "ግባ",
      logout: "ወጣ", 
      home: "ቤት"
    }
  },
  or: {
    common: {
      ...orCommon,
      welcome: "Baga nagaan dhuftan",
      login: "Seeni",
      logout: "Ba'i",
      home: "Mana"
    }
  }
};

i18n
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass the i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // use English if detected language is not available
    debug: import.meta.env.MODE === 'development',
    
    // Default namespace
    defaultNS: 'common',
    ns: ['common'],

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // react already escapes values
    },

    react: {
      useSuspense: false, // disable suspense for now
    }
  });

export default i18n;
