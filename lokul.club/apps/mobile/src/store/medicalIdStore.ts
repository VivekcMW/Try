/**
 * medicalIdStore — blood group, conditions, emergency contacts
 * Shown on lock screen via Medical ID screen
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

export interface MedicalIdState {
  bloodGroup: BloodGroup;
  allergies: string;       // comma-separated
  conditions: string;      // comma-separated
  medications: string;
  organDonor: boolean;
  doctorName: string;
  doctorPhone: string;
  emergencyNote: string;

  setBloodGroup: (v: BloodGroup) => void;
  setAllergies: (v: string) => void;
  setConditions: (v: string) => void;
  setMedications: (v: string) => void;
  setOrganDonor: (v: boolean) => void;
  setDoctorName: (v: string) => void;
  setDoctorPhone: (v: string) => void;
  setEmergencyNote: (v: string) => void;
}

export const useMedicalIdStore = create<MedicalIdState>()(
  persist(
    (set) => ({
      bloodGroup: 'Unknown',
      allergies: '',
      conditions: '',
      medications: '',
      organDonor: false,
      doctorName: '',
      doctorPhone: '',
      emergencyNote: '',

      setBloodGroup:   (bloodGroup)   => set({ bloodGroup }),
      setAllergies:    (allergies)    => set({ allergies }),
      setConditions:   (conditions)   => set({ conditions }),
      setMedications:  (medications)  => set({ medications }),
      setOrganDonor:   (organDonor)   => set({ organDonor }),
      setDoctorName:   (doctorName)   => set({ doctorName }),
      setDoctorPhone:  (doctorPhone)  => set({ doctorPhone }),
      setEmergencyNote:(emergencyNote)=> set({ emergencyNote }),
    }),
    { name: 'lokul.medicalid.v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);
