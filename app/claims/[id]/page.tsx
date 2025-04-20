"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  AlertTriangle,
  DollarSign,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { getClaimById, updateClaimStatus } from "@/lib/utils"
import type { ClaimData } from "@/lib/types"

import { ClaimSummary } from "@/components/claim-summary"

export default function ClaimDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [claim, setClaim] = useState<ClaimData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClaim = () => {
      const claimData = getClaimById(id)
      if (claimData) {
        setClaim(claimData)
      } else {
        router.push("/history")
      }
      setLoading(false)
    }

    fetchClaim()
  }, [id, router])

  const handleStatusChange = (newStatus: string) => {
    if (claim) {
      const updatedClaim = updateClaimStatus(claim.id, newStatus)
      setClaim(updatedClaim)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading claim details...</p>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Claim Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The claim you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/history">
              <Button>Return to Claims History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case "in progress":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-orange-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
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

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/history">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claims History
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            Claim #{claim.id}
            <span
              className={`ml-4 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(claim.status)}`}
            >
              {claim.status}
            </span>
          </h1>
          <p className="text-muted-foreground">Created on {formatDate(claim.createdAt)}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Link href={`/claims/${claim.id}/payment`}>
            <Button>
              <DollarSign className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-5">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="evidence" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Evidence
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                AI Assessment
              </TabsTrigger>
            </TabsList>

            <Card>
              <CardContent className="p-6">
                <TabsContent value="details" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-medium">Customer Information</h3>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 bg-muted/30 p-6 rounded-lg">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="font-medium">{claim.customerName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                        <p className="font-medium">{claim.policyNumber}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{claim.email}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{claim.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-medium">Incident Details</h3>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 bg-muted/30 p-6 rounded-lg">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Incident Date</p>
                        <p className="font-medium">{claim.incidentDate}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Incident Type</p>
                        <p className="font-medium capitalize">{claim.incidentType}</p>
                      </div>
                      {claim.incidentType === "vehicle" && claim.vehicleBrand && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Vehicle Brand</p>
                          <p className="font-medium">{claim.vehicleBrand}</p>
                        </div>
                      )}
                      <div className="md:col-span-2 space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="mt-1">{claim.description}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="evidence" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-medium">Damage Evidence</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-4">Original Image</h4>
                        {claim.image ? (
                          <div className="border rounded-md p-6 bg-muted/30">
                            <img
                              src={claim.image || "/placeholder.svg"}
                              alt="Original damage evidence"
                              className="max-h-[400px] w-full object-contain rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="text-center py-16 border rounded-md bg-muted/30">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No images uploaded for this claim</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-4">Model-Processed Result</h4>
                        {claim.damageAssessment ? (
                          <div className="border rounded-md p-6 bg-muted/30">
                            <img
                              src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/claims/${id}/result.jpg`}
                              alt="Model-processed damage assessment"
                              className="max-h-[400px] w-full object-contain rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="text-center py-16 border rounded-md bg-muted/30">
                            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">AI assessment not yet available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assessment" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <DollarSign className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-medium">AI Damage Assessment</h3>
                    </div>

                    {claim.damageAssessment ? (
                      <>
                        <div className="grid gap-6 md:grid-cols-3">
                          <Card className="bg-muted/30 border-none">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Damage Severity
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">{claim.damageAssessment.severity}</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/30 border-none">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Estimated Cost
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                ${claim.damageAssessment.estimatedCost.toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/30 border-none">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">Repair Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">{claim.damageAssessment.repairTime}</p>
                            </CardContent>
                          </Card>
                        </div>

                        {claim.damageAssessment?.notes && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Assessment Notes</h4>
                            <p>{claim.damageAssessment.notes}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-16 border rounded-md bg-muted/30">
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No AI assessment available for this claim</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Claim Status</CardTitle>
              <CardDescription>Update claim status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                {getStatusIcon(claim.status)}
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-muted-foreground">{claim.status}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Change Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={claim.status === "In Progress" ? "default" : "outline"}
                    onClick={() => handleStatusChange("In Progress")}
                    className="w-full"
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={claim.status === "Approved" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Approved")}
                    className="w-full"
                  >
                    Approve
                  </Button>
                  <Button
                    variant={claim.status === "Rejected" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Rejected")}
                    className="w-full"
                  >
                    Reject
                  </Button>
                  <Button
                    variant={claim.status === "Pending" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Pending")}
                    className="w-full"
                  >
                    Pending
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <ClaimSummary claim={claim} buttonVariant="outline" className="w-full justify-start" />
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Claim
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
