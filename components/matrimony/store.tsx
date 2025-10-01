"use client"

import React from "react"

export type Gender = "Male" | "Female" | "Other"
export type CreatedBy = "Self" | "Parent" | "Sibling" | "Other"

export interface WelcomeIdentityState {
  name: string
  age?: number
  gender?: Gender
  createdBy?: CreatedBy
  photoUrl?: string
  photoUrls?: string[]
}

export interface PersonalPhysicalState {
  heightCm?: number
  heightUnit?: "cm" | "ftin"
  complexion?: "Fair" | "Wheatish" | "Dark"
  bodyType?: "Slim" | "Athletic" | "Average" | "Heavy"
  diet?: "Vegetarian" | "Non-vegetarian" | "Eggetarian" | "Vegan" | "Jain"
  smoker?: boolean
  drinker?: boolean
  maritalStatus?: "Never Married" | "Divorced" | "Widowed" | "Annulled"
}

export interface CareerEducationState {
  highestEducation?: string
  college?: string
  jobTitle?: string
  company?: string
  annualIncome?: string
  workLocation?: { city?: string; state?: string; country?: string }
}

export interface FamilyState {
  familyType?: "Joint" | "Nuclear"
  familyValues?: "Traditional" | "Moderate" | "Modern"
  fatherOccupation?: string
  fatherCompany?: string
  motherOccupation?: string
  motherCompany?: string
  brothers?: number
  sisters?: number
  siblingsMarried?: "None" | "Some" | "All"
  showOnProfile?: boolean
}

export interface CulturalAstroState {
  religion?: string
  motherTongue?: string
  community?: string
  subCaste?: string
  dob?: string
  tob?: string
  pob?: string
  star?: string
  gotra?: string
}

export interface BioState { bio?: string }

export interface PartnerPreferencesState {
  ageRange?: [number, number]
  heightRangeCm?: [number, number]
  dietPrefs?: string[]
  lifestylePrefs?: string[]
  educationPrefs?: string[]
  professionPrefs?: string[]
  locations?: string[]
  communities?: string[]
  familyTypePrefs?: string[]
}

export interface VerificationState {
  selfieUrl?: string
  idDocUrl?: string
}

export interface MatrimonySetupState {
  welcome: WelcomeIdentityState
  personal: PersonalPhysicalState
  career: CareerEducationState
  family: FamilyState
  cultural: CulturalAstroState
  bio: BioState
  preferences: PartnerPreferencesState
  verification: VerificationState
  setPartial: (section: keyof Omit<MatrimonySetupState, "setPartial">, data: any) => void
  reset: () => void
}

const initialState: Omit<MatrimonySetupState, "setPartial" | "reset"> = {
  welcome: { name: "" },
  personal: {},
  career: {},
  family: { showOnProfile: false },
  cultural: {},
  bio: {},
  preferences: {},
  verification: {},
}

const MatrimonySetupContext = React.createContext<MatrimonySetupState | null>(null)

export function MatrimonySetupProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<Omit<MatrimonySetupState, "setPartial" | "reset">>({ ...initialState })

  const setPartial: MatrimonySetupState["setPartial"] = (section, data) => {
    setState((prev) => ({ ...prev, [section]: { ...(prev as any)[section], ...data } }))
  }

  const reset = () => setState({ ...initialState })

  const value: MatrimonySetupState = {
    ...state,
    setPartial,
    reset,
  }

  return <MatrimonySetupContext.Provider value={value}>{children}</MatrimonySetupContext.Provider>
}

export function useMatrimonySetupStore() {
  const ctx = React.useContext(MatrimonySetupContext)
  if (!ctx) throw new Error("useMatrimonySetupStore must be used within MatrimonySetupProvider")
  return ctx
}


