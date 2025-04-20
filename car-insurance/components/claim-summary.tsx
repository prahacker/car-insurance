"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, Printer, Share2 } from "lucide-react"
import type { ClaimData } from "@/lib/types"

interface ClaimSummaryProps {
  claim: ClaimData
  buttonVariant?: "outline" | "default" | "ghost"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ClaimSummary({ claim, buttonVariant = "outline", buttonSize = "sm", className }: ClaimSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-500"
      case "in progress":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }
  const handleDownload = () => {
    alert("In a production app, this would download a PDF summary of the claim.")
  }

  const handleShare = () => {
    alert("In a production app, this would allow sharing the claim summary.")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <FileText className="h-4 w-4 mr-2" />
          Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Claim Summary</DialogTitle>
          <DialogDescription>A comprehensive overview of claim #{claim.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Claim #{claim.id}</h3>
              <p className="text-muted-foreground">Created on {formatDate(claim.createdAt)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(claim.status)}`}>{claim.status}</div>
          </div>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Customer Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span> {claim.customerName}
                </div>
                <div>
                  <span className="text-muted-foreground">Policy Number:</span> {claim.policyNumber}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {claim.email}
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span> {claim.phone}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Incident Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span className="text-muted-foreground">Date:</span> {claim.incidentDate}
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {claim.incidentType.charAt(0).toUpperCase() + claim.incidentType.slice(1)}
                </div>
                {claim.incidentType === "vehicle" && claim.vehicleBrand && (
                  <div>
                    <span className="text-muted-foreground">Vehicle Brand:</span> {claim.vehicleBrand}
                  </div>
                )}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1">{claim.description}</p>
              </div>
            </CardContent>
          </Card>

          {claim.damageAssessment && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">AI Assessment</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Severity:</span> {claim.damageAssessment.severity}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Cost:</span> $
                    {claim.damageAssessment.estimatedCost.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Repair Time:</span> {claim.damageAssessment.repairTime}
                  </div>
                </div>
                {claim.damageAssessment.notes && (
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1">{claim.damageAssessment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
