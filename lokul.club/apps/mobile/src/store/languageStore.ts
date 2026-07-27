import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n from '@/i18n';
import { DEFAULT_LANGUAGE, RTL_LANGUAGES, SUPPORTED_LANGUAGES } from '@/i18n/languageConfig';

type LanguageState = {
  language: string;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setLanguage: (code: string) => Promise<void>;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setLanguage: async (code) => {
        const supported = SUPPORTED_LANGUAGES.some((l) => l.code === code);
        const next = supported ? code : DEFAULT_LANGUAGE;
        const shouldRTL = RTL_LANGUAGES.has(next);

        if (I18nManager.isRTL !== shouldRTL) {
          I18nManager.allowRTL(shouldRTL);
          I18nManager.forceRTL(shouldRTL);
        }

        await i18n.changeLanguage(next);
        set({ language: next });
      },
    }),
    {
      name: 'lokul.language.v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
