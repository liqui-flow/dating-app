import type { MatrimonyProfile, MatrimonyPreferences, VerificationPayload } from "@/lib/types"

type Draft = {
  profile?: Partial<MatrimonyProfile>
  preferences?: Partial<MatrimonyPreferences>
  verification?: Partial<VerificationPayload>
}

const DRAFT_KEY = "matrimony_draft_v1"

export async function saveDraft(draft: Draft) {
  if (typeof window === "undefined") return
  const existing = (JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Draft) || {}
  const merged = { ...existing, ...draft }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(merged))
}

export async function loadDraft(): Promise<Draft | null> {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(DRAFT_KEY)
  return raw ? (JSON.parse(raw) as Draft) : null
}

export async function clearDraft() {
  if (typeof window === "undefined") return
  localStorage.removeItem(DRAFT_KEY)
}

export async function uploadAsset(file: File): Promise<string> {
  // Mock: return object URL
  return URL.createObjectURL(file)
}

export async function submitProfile(payload: {
  profile: MatrimonyProfile
  preferences: MatrimonyPreferences
  verification?: VerificationPayload
}) {
  // Mock submit; replace with API later
  console.log("Submitting matrimony profile:", payload)
  await clearDraft()
  return { ok: true }
}


