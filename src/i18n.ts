import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'select_language': 'Select Language',
      'welcome': 'Welcome to NyayMitra',
      'tagline': 'Your Voice-First Legal Companion',
      'continue': 'Continue',
    }
  },
  hi: {
    translation: {
      'select_language': 'भाषा चुनें',
      'welcome': 'न्यायमित्र में आपका स्वागत है',
      'tagline': 'आपका वॉयस-फर्स्ट कानूनी साथी',
      'continue': 'आगे बढ़ें',
    }
  },
  ta: {
    translation: {
      'select_language': 'மொழியைத் தேர்ந்தெடுக்கவும்',
      'welcome': 'நியாயமித்ராவிற்கு வரவேற்கிறோம்',
      'tagline': 'உங்கள் குரல்-முதல் சட்ட துணை',
      'continue': 'தொடரவும்',
    }
  },
  te: {
    translation: {
      'select_language': 'భాషను ఎంచుకోండి',
      'welcome': 'న్యాయమిత్రకు స్వాగతం',
      'tagline': 'మీ వాయిస్-ఫస్ట్ లీగల్ కంపానియన్',
      'continue': 'కొనసాగించండి',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
