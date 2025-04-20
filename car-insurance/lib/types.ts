export interface DamageAssessment {
  severity: string
  estimatedCost: number
  repairTime: number
  notes: string
}

export interface ClaimData {
  id: string
  customerName: string
  email: string
  phone: string
  policyNumber: string
  incidentDate: string
  incidentType: string
  description: string
  vehicleBrand?: string
  image: string | null
  status: string
  createdAt: string
  damageAssessment?: DamageAssessment
}
