import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import rw from './rw.json';

const LANGUAGE_KEY = '@dg_app_language';

const resources = {
  en: { translation: en },
  rw: { translation: rw },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const loadStoredLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLang && (savedLang === 'en' || savedLang === 'rw')) {
      await i18n.changeLanguage(savedLang);
    }
  } catch (e) {
    console.error('Failed to load stored language:', e);
  }
};

export const changeAppLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
  } catch (e) {
    console.error('Failed to set application language:', e);
  }
};

loadStoredLanguage();

export default i18n;
