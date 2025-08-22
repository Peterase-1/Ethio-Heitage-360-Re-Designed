import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  // Define RTL languages (if needed in the future)
  const rtlLanguages = ['ar', 'he']; // Arabic, Hebrew
  
  // Define language information
  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr' 
    },
    { 
      code: 'am', 
      name: 'Amharic', 
      nativeName: 'አማርኛ',
      flag: '🇪🇹',
      direction: 'ltr'
    },
    { 
      code: 'or', 
      name: 'Oromo', 
      nativeName: 'Afaan Oromoo',
      flag: '🇪🇹',
      direction: 'ltr'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    // Update document direction based on language
    setIsRTL(rtlLanguages.includes(i18n.language));
    document.documentElement.dir = rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (languageCode) => {
    return i18n.changeLanguage(languageCode);
  };

  const formatDate = (date, options = {}) => {
    const locale = i18n.language === 'am' ? 'am-ET' : 
                   i18n.language === 'or' ? 'om-ET' : 
                   'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(new Date(date));
  };

  const formatNumber = (number, options = {}) => {
    const locale = i18n.language === 'am' ? 'am-ET' : 
                   i18n.language === 'or' ? 'om-ET' : 
                   'en-US';
    
    return new Intl.NumberFormat(locale, options).format(number);
  };

  const getCurrencySymbol = () => {
    // Ethiopian Birr for local languages, USD for English
    return i18n.language === 'en' ? '$' : 'ብር';
  };

  const getTimeFormat = () => {
    // 12-hour format for English, 24-hour for others
    return i18n.language === 'en' ? '12' : '24';
  };

  return {
    currentLanguage,
    languages,
    isRTL,
    changeLanguage,
    formatDate,
    formatNumber,
    getCurrencySymbol,
    getTimeFormat,
    t,
    i18n
  };
};

export default useLanguage;
