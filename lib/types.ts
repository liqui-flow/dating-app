// Matrimony types
export type Gender = "Male" | "Female" | "Other"
export type CreatedBy = "Self" | "Parent" | "Sibling" | "Other"

export interface MatrimonyProfile {
  name: string
  age: number
  gender: Gender
  createdBy: CreatedBy
  photoUrl?: string
  personal?: {
    heightCm?: number
    complexion?: string
    bodyType?: string
    diet?: string
    smoker?: boolean
    drinker?: boolean
    maritalStatus?: string
  }
  career?: {
    highestEducation?: string
    college?: string
    jobTitle?: string
    company?: string
    annualIncome?: string
    workLocation?: { city?: string; state?: string; country?: string }
  }
  family?: {
    familyType?: string
    familyValues?: string
    fatherOccupation?: string
    fatherCompany?: string
    motherOccupation?: string
    motherCompany?: string
    brothers?: number
    sisters?: number
    siblingsMarried?: string
    showOnProfile?: boolean
  }
  cultural?: {
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
  bio?: string
}

export interface MatrimonyPreferences {
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

export interface VerificationPayload {
  selfieUrl?: string
  idDocUrl?: string
}


