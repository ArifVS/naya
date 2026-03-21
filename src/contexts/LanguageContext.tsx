import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'or' | 'pa' | 'ur';

interface LanguageContextType {
  language: Language | null;
  setLanguage: (lang: Language) => void;
  isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language | null>(() => {
    const saved = localStorage.getItem('nyaymitra_language');
    return saved as Language | null;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nyaymitra_language', lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageSelected: !!language }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
