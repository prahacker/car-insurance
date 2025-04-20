"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Lock } from "lucide-react"
import { getClaimById, updateClaimStatus } from "@/lib/utils"

export default function PaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const claim = getClaimById(params.id)

  if (!claim) {
    router.push("/claims")
    return null
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      updateClaimStatus(claim.id, "Processed")
      
      router.push(`/claims/${claim.id}?payment=success`)
    } catch (error) {
      console.error("Payment error:", error)
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href={`/claims/${claim.id}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claim Details
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Account Details
            </CardTitle>
            <CardDescription>Enter your bank account information to receive the insurance payout</CardDescription>
          </CardHeader>
          <form onSubmit={handlePayment}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name</Label>
                <Input
                  id="accountName"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter your account number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="Enter your routing number"
                  required
                  pattern="[0-9]{9}"
                  maxLength={9}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Enter your bank name"
                  required
                />
                </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    Processing...
                    <Lock className="ml-2 h-4 w-4 animate-pulse" />
                  </>
                ) : (
                  <>
                    Receive Payout ${claim.damageAssessment?.estimatedCost?.toLocaleString() ?? '0'}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Summary</CardTitle>
            <CardDescription>Review your claim details and payout amount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Claim Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Claim ID:</div>
                <div>{claim.id}</div>
                <div className="text-muted-foreground">Customer:</div>
                <div>{claim.customerName}</div>
                <div className="text-muted-foreground">Vehicle:</div>
                <div>{claim.vehicleBrand}</div>
                <div className="text-muted-foreground">Incident Type:</div>
                <div className="capitalize">{claim.incidentType}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Damage Assessment</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Severity:</div>
                <div>{claim.damageAssessment?.severity ?? 'N/A'}</div>
                <div className="text-muted-foreground">Repair Time:</div>
                <div>{claim.damageAssessment?.repairTime ?? 0}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Payout Amount:</span>
                <span>${claim.damageAssessment?.estimatedCost?.toLocaleString() ?? '0'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This amount includes all repair costs and service charges as estimated by our AI assessment system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}