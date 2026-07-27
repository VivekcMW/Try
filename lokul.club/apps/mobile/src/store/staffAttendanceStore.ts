// PRD §15 — Staff Attendance store
// No backend Staff/Attendance model exists yet (verified: no /api/mobile/staff
// route and no Attendance model in prisma/schema.prisma), so staff records and
// daily attendance marks are persisted locally with Zustand + AsyncStorage,
// following the same pattern as src/store/communityStore.ts.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STAFF_MEMBERS, type StaffMember, type StaffRole } from '@/data/community-seed';

export interface AddStaffInput {
  name: string;
  role: StaffRole;
  phone: string;
  schedule: string;
  salary: number;
}

interface State {
  members: StaffMember[];
  addStaff: (input: AddStaffInput) => void;
  markPresent: (id: string) => void;
  markAbsent: (id: string) => void;
}

export const useStaffAttendanceStore = create<State>()(
  persist(
    (set) => ({
      members: STAFF_MEMBERS,

      addStaff: (input) =>
        set((s) => ({
          members: [
            {
              id: `st_${Date.now()}`,
              name: input.name,
              role: input.role,
              phone: input.phone,
              schedule: input.schedule || 'Not set',
              todayStatus: 'not_yet',
              monthAttendance: 0,
              salary: input.salary,
            },
            ...s.members,
          ],
        })),

      markPresent: (id) =>
        set((s) => ({
          members: s.members.map((m) =>
            m.id === id
              ? { ...m, todayStatus: 'present', checkIn: Date.now(), monthAttendance: m.monthAttendance + 1 }
              : m,
          ),
        })),

      markAbsent: (id) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, todayStatus: 'absent' } : m)),
        })),
    }),
    { name: 'lokul.staffAttendance', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
