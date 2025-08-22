import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'or', name: 'Oromo', nativeName: 'Afaan Oromoo' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className={`relative group ${className}`}>
      <button className="flex items-center space-x-2 px-3 py-2 rounded-md bg-background border border-border text-foreground hover:bg-muted transition-colors">
        <Globe className="h-4 w-4" />
        <span className="text-sm">{currentLanguage.nativeName}</span>
      </button>
      
      <div className="absolute top-full right-0 mt-1 py-1 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
              i18n.language === language.code 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-foreground'
            }`}
          >
            {language.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};

// Keep backward compatibility
const LanguageToggle = LanguageSwitcher;

export default LanguageSwitcher;
export { LanguageToggle };
