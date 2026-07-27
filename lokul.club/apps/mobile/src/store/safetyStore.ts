/**
 * safetyStore — master safety state
 * Persisted: trusted contacts, medical ID, journey state, SOS triggers config
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SosTrigger = 'shake' | 'volume_triple' | 'voice';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notifyBySms: boolean;
}

export type JourneyStatus = 'idle' | 'active' | 'arrived' | 'overdue';

export interface ActiveJourney {
  id: string;
  destination: string;
  startedAt: string;           // ISO
  expectedArrival: string;     // ISO
  checkInIntervalMin: number;  // 15 | 30 | 60
  nextCheckIn: string;         // ISO
  watcherIds: string[];        // contact ids
  status: JourneyStatus;
}

interface SafetyState {
  // Setup
  setupComplete: boolean;

  // Trusted contacts
  contacts: TrustedContact[];

  // SOS triggers
  triggers: SosTrigger[];

  // Active journey
  journey: ActiveJourney | null;

  // Evidence mode
  evidenceActive: boolean;
  evidenceSessionId: string | null;

  // Volunteer
  isVolunteer: boolean;
  volunteerSkills: string[];

  // Actions
  completeSetup: () => void;
  resetSetup: () => void;

  addContact: (c: TrustedContact) => void;
  updateContact: (id: string, patch: Partial<TrustedContact>) => void;
  removeContact: (id: string) => void;

  setTriggers: (t: SosTrigger[]) => void;

  startJourney: (j: ActiveJourney) => void;
  updateJourneyStatus: (status: JourneyStatus) => void;
  bumpNextCheckIn: () => void;
  endJourney: () => void;

  setEvidenceActive: (v: boolean, sessionId?: string) => void;

  setVolunteer: (v: boolean, skills?: string[]) => void;
}

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set, get) => ({
      setupComplete: false,
      contacts: [],
      triggers: ['shake'],
      journey: null,
      evidenceActive: false,
      evidenceSessionId: null,
      isVolunteer: false,
      volunteerSkills: [],

      completeSetup: () => set({ setupComplete: true }),
      resetSetup: () => set({ setupComplete: false }),

      addContact: (c) => set((s) => ({ contacts: [...s.contacts, c] })),
      updateContact: (id, patch) =>
        set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      setTriggers: (triggers) => set({ triggers }),

      startJourney: (j) => set({ journey: j }),
      updateJourneyStatus: (status) =>
        set((s) => (s.journey ? { journey: { ...s.journey, status } } : {})),
      bumpNextCheckIn: () =>
        set((s) => {
          if (!s.journey) return {};
          const nextMs = Date.now() + s.journey.checkInIntervalMin * 60 * 1000;
          return { journey: { ...s.journey, nextCheckIn: new Date(nextMs).toISOString() } };
        }),
      endJourney: () => set({ journey: null }),

      setEvidenceActive: (v, sessionId) =>
        set({ evidenceActive: v, evidenceSessionId: sessionId ?? null }),

      setVolunteer: (v, skills) =>
        set({ isVolunteer: v, volunteerSkills: skills ?? get().volunteerSkills }),
    }),
    { name: 'lokul.safety.v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);
