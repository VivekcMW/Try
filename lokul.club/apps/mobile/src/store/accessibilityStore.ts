/**
 * Accessibility store — drives font scale, high contrast, senior mode, and
 * reduce-motion across the entire app.
 *
 * Persisted to AsyncStorage under 'lokul.accessibility.v1'.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FontScaleLevel = 'normal' | 'large' | 'xlarge';

interface AccessibilityState {
  /** Senior Simplified Mode — oversized tap targets, simplified home screen */
  seniorMode: boolean;
  /** App-wide font scale level */
  fontScale: FontScaleLevel;
  /** WCAG AA-compliant high-contrast color overrides */
  highContrast: boolean;
  /** Boost all font weights to semibold/bold */
  boldText: boolean;
  /** Disable or reduce UI animations */
  reduceMotion: boolean;
  /** Add extra accessibilityLabel / accessibilityHint to interactive elements */
  screenReaderHints: boolean;

  setSeniorMode:        (v: boolean) => void;
  setFontScale:         (v: FontScaleLevel) => void;
  setHighContrast:      (v: boolean) => void;
  setBoldText:          (v: boolean) => void;
  setReduceMotion:      (v: boolean) => void;
  setScreenReaderHints: (v: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  seniorMode:        false,
  fontScale:         'normal' as FontScaleLevel,
  highContrast:      false,
  boldText:          false,
  reduceMotion:      false,
  screenReaderHints: true,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setSeniorMode:        (v) => set({ seniorMode: v }),
      setFontScale:         (v) => set({ fontScale: v }),
      setHighContrast:      (v) => set({ highContrast: v }),
      setBoldText:          (v) => set({ boldText: v }),
      setReduceMotion:      (v) => set({ reduceMotion: v }),
      setScreenReaderHints: (v) => set({ screenReaderHints: v }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'lokul.accessibility.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
