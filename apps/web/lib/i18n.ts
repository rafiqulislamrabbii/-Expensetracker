import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import bn from '@/locales/bn/common.json';
import en from '@/locales/en/common.json';

type Language = 'bn' | 'en';
type Translations = typeof bn;

const I18nContext = createContext<{
  lang: Language;
  t: (key: keyof Translations) => string;
  setLang: (lang: Language) => void;
} | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const changeLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('app_lang', l);
  };

  const t = (key: keyof Translations) => {
    const dict = lang === 'bn' ? bn : en;
    return dict[key] || key;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { lang, t, setLang: changeLang } },
    children
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
};