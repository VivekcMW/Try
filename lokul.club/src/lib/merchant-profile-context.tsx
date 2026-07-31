"use client";

import { createContext, useContext } from "react";
import type { WorkflowProfile, ProfileLabels } from "./merchant-profiles";
import { PROFILE_LABELS } from "./merchant-profiles";

const MerchantProfileContext = createContext<WorkflowProfile>("retail");

export const MerchantProfileProvider = MerchantProfileContext.Provider;

export function useMerchantProfile(): WorkflowProfile {
  return useContext(MerchantProfileContext);
}

export function useProfileLabels(): ProfileLabels {
  const profile = useMerchantProfile();
  return PROFILE_LABELS[profile];
}

export function useProfileLabel<K extends keyof ProfileLabels>(key: K): string {
  return useProfileLabels()[key];
}
