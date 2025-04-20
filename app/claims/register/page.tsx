"use client"
export const dynamic = "force-dynamic";
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, User, Calendar, ImageIcon, CheckCircle2, ArrowRight } from "lucide-react"
import { generateClaimId, saveClaimToStorage, getClaimById } from "@/lib/utils"
import { claimFormSchema, type ClaimFormData } from "@/lib/validations/claim"

export default function RegisterPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("customer")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const form = useForm<ClaimFormData>({    
    mode: "onChange",
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
    customerName: "",
    email: "",
    phone: "",
    policyNumber: "",
    incidentDate: "",
    incidentType: undefined,
    description: "",
    vehicleBrand: "",
    vehicleType: undefined,
  }})

  const { register, handleSubmit: handleFormSubmit, formState: { errors }, setValue, watch } = form

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const previewUrl = URL.createObjectURL(file)
      setUploadedImage(previewUrl)
    }
  }

  const onSubmit = async (data: ClaimFormData) => {
    if (activeTab !== "review") {
      nextTab();
      return;
    }
    if (!isTabComplete("customer") || !isTabComplete("incident")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const claimId = generateClaimId();

      let imageUrl = null
      let damageAssessment = null;
      if (selectedFile) {
        try {
          const formData = new FormData()
          formData.append('file', selectedFile)
          formData.append('customerName', data.customerName)
          formData.append('email', data.email)
          formData.append('phone', data.phone)
          formData.append('policyNumber', data.policyNumber)
          formData.append('incidentDate', data.incidentDate)
          formData.append('incidentType', data.incidentType)
          formData.append('description', data.description)
          formData.append('vehicleBrand', data.vehicleBrand)
          formData.append('vehicleType', data.vehicleType)

          const response = await fetch(`/api/claims/${claimId}/images`, {
            method: 'POST',
            body: formData,
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || 'Failed to upload image')
          }

          if (!result.url) {
            throw new Error('Invalid response from server')
          }

          imageUrl = result.url

          const detectionResponse = await fetch(`/api/claims/${claimId}/detect-damage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl }),
          });

          if (!detectionResponse.ok) {
            throw new Error('Failed to get damage assessment');
          }

          damageAssessment = await detectionResponse.json();
        } catch (error) {
          console.error('Image upload or assessment error:', error);
          alert(error instanceof Error ? error.message : 'Failed to process image');
          setIsSubmitting(false)
          return
        }
      }

      const claimData = {
        id: claimId,
        ...data,
        image: imageUrl,
        status: "New",
        createdAt: new Date().toISOString(),
        damageAssessment,
      };

      saveClaimToStorage(claimData);

      const savedClaim = getClaimById(claimId);
      if (!savedClaim) {
        throw new Error("Failed to save claim data");
      }
      router.push(`/claims/${claimId}`);
    } catch (error) {
      console.error("Error submitting claim:", error);
      setIsSubmitting(false);
    }
  };

  const nextTab = () => {
    if (activeTab === "customer") setActiveTab("incident")
    else if (activeTab === "incident") setActiveTab("evidence")
    else if (activeTab === "evidence") setActiveTab("review")
    else if (activeTab === "review") setActiveTab("review")
  }

  const prevTab = () => {
    if (activeTab === "incident") setActiveTab("customer")
    else if (activeTab === "evidence") setActiveTab("incident")
    else if (activeTab === "review") setActiveTab("evidence")
  }

  const isTabComplete = (tab: string) => {
    const formValues = watch();
    const hasErrors = Object.keys(errors).length > 0;

    switch (tab) {
      case "customer":
        return !hasErrors && formValues.customerName && formValues.email && formValues.phone && formValues.policyNumber
      case "incident":
        return !hasErrors && formValues.incidentDate && formValues.incidentType && formValues.description && formValues.vehicleBrand && formValues.vehicleType
      case "evidence":
        return true
      default:
        return false
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Register New Insurance Claim</CardTitle>
          <CardDescription>Complete all required information to submit a new claim</CardDescription>
        </CardHeader>
        <form onSubmit={handleFormSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={(value) => {
            if (value === "incident" && !isTabComplete("customer")) return
            if (value === "evidence" && !isTabComplete("incident")) return
            if (value === "review" && !isTabComplete("evidence")) return
            setActiveTab(value)
          }} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Customer</span>
                </TabsTrigger>
                <TabsTrigger value="incident" className={`flex items-center gap-2 ${!isTabComplete("customer") ? "cursor-not-allowed" : ""}`}>
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Incident</span>
                </TabsTrigger>
                <TabsTrigger value="evidence" className={`flex items-center gap-2 ${!isTabComplete("incident") ? "cursor-not-allowed" : ""}`}>
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Evidence</span>
                </TabsTrigger>
                <TabsTrigger value="review" className={`flex items-center gap-2 ${!isTabComplete("evidence") ? "cursor-not-allowed" : ""}`}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Review</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6">
              <TabsContent value="customer" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Customer Information</h3>
                  <p className="text-sm text-muted-foreground">Enter the policyholder's personal details</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      placeholder="John Doe"
                      {...register("customerName")}
                      className={errors.customerName ? "border-red-500" : ""}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500">{errors.customerName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      placeholder="POL-12345678"
                      {...register("policyNumber")}
                      className={errors.policyNumber ? "border-red-500" : ""}
                    />
                    {errors.policyNumber && (
                      <p className="text-sm text-red-500">{errors.policyNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="1234567890"
                      {...register("phone")}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="incident" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Incident Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide information about when and how the incident occurred
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="incidentDate">Incident Date</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      {...register("incidentDate")}
                      className={errors.incidentDate ? "border-red-500" : ""}
                    />
                    {errors.incidentDate && (
                      <p className="text-sm text-red-500">{errors.incidentDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Select onValueChange={(value: "collision" | "theft" | "vandalism" | "fire" | "natural" | "mechanical") => setValue("incidentType", value)} value={watch("incidentType")}>
                      <SelectTrigger id="incidentType">
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collision">Collision/Accident</SelectItem>
                        <SelectItem value="theft">Vehicle Theft</SelectItem>
                        <SelectItem value="vandalism">Vandalism</SelectItem>
                        <SelectItem value="fire">Vehicle Fire</SelectItem>
                        <SelectItem value="natural">Natural Disaster Damage</SelectItem>
                        <SelectItem value="mechanical">Mechanical Failure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select 
                      onValueChange={(value: "2-wheeler" | "3-wheeler" | "4-wheeler") => setValue("vehicleType", value)}
                      value={watch("vehicleType")}
                    >
                      <SelectTrigger id="vehicleType" className={errors.vehicleType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2-wheeler">2 Wheeler</SelectItem>
                        <SelectItem value="3-wheeler">3 Wheeler</SelectItem>
                        <SelectItem value="4-wheeler">4 Wheeler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
                    <Input
                      id="vehicleBrand"
                      placeholder="e.g. Toyota, Honda, BMW"
                      {...register("vehicleBrand")}
                      className={errors.vehicleBrand ? "border-red-500" : ""}
                    />
                    {errors.vehicleBrand && (
                      <p className="text-sm text-red-500">{errors.vehicleBrand.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Incident Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide details about the incident..."
                    rows={4}
                    {...register("description")}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Damage Evidence</h3>
                  <p className="text-sm text-muted-foreground">Upload photos of the damage for AI assessment</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="damagePhoto">Upload Photo of Damage</Label>
                  <div className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center">
                    {uploadedImage ? (
                      <div className="space-y-4 w-full">
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded damage"
                          className="max-h-64 mx-auto object-contain rounded-md"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setUploadedImage(null)}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Drag and drop an image, or click to browse
                        </p>
                        <Input
                          id="damagePhoto"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("damagePhoto")?.click()}
                        >
                          Select Image
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Our AI will analyze the image to assess damage and estimate repair costs.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-6 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Review Claim Information</h3>
                  <p className="text-sm text-muted-foreground">Verify all details before submitting your claim</p>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {watch("customerName") || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Policy Number:</span> {watch("policyNumber") || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {watch("email") || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {watch("phone") || "Not provided"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Incident Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <span className="font-medium">Date:</span> {watch("incidentDate") || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {watch("incidentType")
                          ? watch("incidentType").charAt(0).toUpperCase() + watch("incidentType").slice(1)
                          : "Not provided"}
                      </div>
                      {(
                        <>
                          <div>
                            <span className="font-medium">Vehicle Brand:</span> {watch("vehicleBrand") || "Not provided"}
                          </div>
                          <div>
                            <span className="font-medium">Vehicle Type:</span> {watch("vehicleType") || "Not provided"}
                          </div>
                        </>
                      )}
                      <div className="md:col-span-2">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1">{watch("description") || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Evidence</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      {uploadedImage ? (
                        <div className="flex items-center">
                          <img
                            src={uploadedImage || "/placeholder.svg"}
                            alt="Damage evidence"
                            className="h-16 w-16 object-cover rounded-md mr-4"
                          />
                          <span>Image uploaded successfully</span>
                        </div>
                      ) : (
                        <span>No image uploaded</span>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </CardContent>


            <CardFooter className="flex justify-between px-6 pb-6">
              {activeTab !== "customer" ? (
                <Button type="button" variant="outline" onClick={prevTab}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              )}

              {activeTab === "review" ? (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={nextTab} disabled={!isTabComplete(activeTab)}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Tabs>
        </form>
      </Card>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[300px]">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Processing Claim</p>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your claim details...
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
