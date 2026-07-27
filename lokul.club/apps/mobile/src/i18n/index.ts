import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languageConfig';

import enCommon from '@/locales/en/common.json';
import enOnboarding from '@/locales/en/onboarding.json';
import enFeed from '@/locales/en/feed.json';
import enSafety from '@/locales/en/safety.json';
import enSettings from '@/locales/en/settings.json';

import hiCommon from '@/locales/hi/common.json';
import hiOnboarding from '@/locales/hi/onboarding.json';
import hiFeed from '@/locales/hi/feed.json';
import hiSafety from '@/locales/hi/safety.json';
import hiSettings from '@/locales/hi/settings.json';

import mrCommon from '@/locales/mr/common.json';
import mrOnboarding from '@/locales/mr/onboarding.json';
import mrFeed from '@/locales/mr/feed.json';
import mrSafety from '@/locales/mr/safety.json';
import mrSettings from '@/locales/mr/settings.json';

import teCommon from '@/locales/te/common.json';
import teOnboarding from '@/locales/te/onboarding.json';
import teFeed from '@/locales/te/feed.json';
import teSafety from '@/locales/te/safety.json';
import teSettings from '@/locales/te/settings.json';

import knCommon from '@/locales/kn/common.json';
import knOnboarding from '@/locales/kn/onboarding.json';
import knFeed from '@/locales/kn/feed.json';
import knSafety from '@/locales/kn/safety.json';
import knSettings from '@/locales/kn/settings.json';

const baseNamespaces = {
  common: enCommon,
  onboarding: enOnboarding,
  feed: enFeed,
  safety: enSafety,
  settings: enSettings,
};

// Non-English locales are merged onto the English namespace so any key not
// yet translated falls back to English instead of going missing at runtime.
const hindiNamespaces = {
  common: { ...enCommon, ...hiCommon },
  onboarding: { ...enOnboarding, ...hiOnboarding },
  feed: { ...enFeed, ...hiFeed },
  safety: { ...enSafety, ...hiSafety },
  settings: { ...enSettings, ...hiSettings },
};

const marathiNamespaces = {
  common: { ...enCommon, ...mrCommon },
  onboarding: { ...enOnboarding, ...mrOnboarding },
  feed: { ...enFeed, ...mrFeed },
  safety: { ...enSafety, ...mrSafety },
  settings: { ...enSettings, ...mrSettings },
};

const teluguNamespaces = {
  common: { ...enCommon, ...teCommon },
  onboarding: { ...enOnboarding, ...teOnboarding },
  feed: { ...enFeed, ...teFeed },
  safety: { ...enSafety, ...teSafety },
  settings: { ...enSettings, ...teSettings },
};

const kannadaNamespaces = {
  common: { ...enCommon, ...knCommon },
  onboarding: { ...enOnboarding, ...knOnboarding },
  feed: { ...enFeed, ...knFeed },
  safety: { ...enSafety, ...knSafety },
  settings: { ...enSettings, ...knSettings },
};

const languageNamespaces: Record<string, typeof baseNamespaces> = {
  en: baseNamespaces,
  hi: hindiNamespaces,
  mr: marathiNamespaces,
  te: teluguNamespaces,
  kn: kannadaNamespaces,
};

const resources = SUPPORTED_LANGUAGES.reduce<Record<string, typeof baseNamespaces>>((acc, lang) => {
  acc[lang.code] = languageNamespaces[lang.code] ?? baseNamespaces;
  return acc;
}, {});

export type AppNamespaces = keyof (typeof resources)['en'];

const deviceLang = Localization.getLocales?.()?.[0]?.languageCode?.toLowerCase?.() ?? DEFAULT_LANGUAGE;
const isSupported = SUPPORTED_LANGUAGES.some((l) => l.code === deviceLang);

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: isSupported ? deviceLang : DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns: ['common', 'onboarding', 'feed', 'safety', 'settings'],
    returnNull: false,
  });
}

export default i18n;
