import type { ClaimData } from "./types"

export function generateClaimId(): string {
  const digits = "0123456789"
  let id = ""

  for (let i = 0; i < 12; i++) {
    id += digits.charAt(Math.floor(Math.random() * digits.length))
  }

  return id
}

export function saveClaimToStorage(claim: ClaimData): void {
  const claims = getClaimsFromStorage()
  claims.push(claim)
  localStorage.setItem("insuranceClaims", JSON.stringify(claims))
}

export function getClaimsFromStorage(): ClaimData[] {
  if (typeof window === "undefined") return []

  const storedClaims = localStorage.getItem("insuranceClaims")
  return storedClaims ? JSON.parse(storedClaims) : []
}

export function getClaimById(id: string): ClaimData | null {
  const claims = getClaimsFromStorage()
  return claims.find((claim) => claim.id === id) || null
}

export function updateClaimStatus(id: string, newStatus: string): ClaimData | null {
  const claims = getClaimsFromStorage()
  const claimIndex = claims.findIndex((claim) => claim.id === id)

  if (claimIndex === -1) return null

  claims[claimIndex].status = newStatus
  localStorage.setItem("insuranceClaims", JSON.stringify(claims))

  return claims[claimIndex]
}

export function deleteClaim(id: string): boolean {
  const claims = getClaimsFromStorage()
  const filteredClaims = claims.filter((claim) => claim.id !== id)

  if (filteredClaims.length === claims.length) return false

  localStorage.setItem("insuranceClaims", JSON.stringify(filteredClaims))
  return true
}

export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(" ")
}
