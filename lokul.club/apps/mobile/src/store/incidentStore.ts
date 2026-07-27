/**
 * incidentStore — community safety alerts local state
 */
import { create } from 'zustand';

export type AlertCategory = 'theft' | 'harassment' | 'vehicle' | 'fire' | 'flood' | 'medical' | 'other';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'pending' | 'verified' | 'rejected';

export interface CommunityAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  body: string;
  pinCode: string;
  lat: number | null;
  lng: number | null;
  photoUrl: string | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  verifiedAt: string | null;
  distance?: number;  // metres, computed client-side
}

interface IncidentState {
  alerts: CommunityAlert[];
  lastFetchedAt: string | null;
  setAlerts: (a: CommunityAlert[]) => void;
  upsertAlert: (a: CommunityAlert) => void;
  setLastFetched: () => void;
}

export const useIncidentStore = create<IncidentState>()((set) => ({
  alerts: [],
  lastFetchedAt: null,
  setAlerts: (alerts) => set({ alerts }),
  upsertAlert: (a) =>
    set((s) => {
      const idx = s.alerts.findIndex((x) => x.id === a.id);
      if (idx >= 0) {
        const copy = [...s.alerts];
        copy[idx] = a;
        return { alerts: copy };
      }
      return { alerts: [a, ...s.alerts] };
    }),
  setLastFetched: () => set({ lastFetchedAt: new Date().toISOString() }),
}));
