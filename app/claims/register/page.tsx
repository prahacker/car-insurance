"use client";
export const dynamic = "force-dynamic";


import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Import from correct individual files
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Loader2, Upload, User, Calendar, ImageIcon, CheckCircle2, ArrowRight } from "lucide-react";
import { generateClaimId, saveClaimToStorage, getClaimById } from "@/lib/utils";
import { claimFormSchema, type ClaimFormData } from "@/lib/validations/claim";


export default function RegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    },
  });

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
    }
  };

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
      let damageAssessment = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("claim_id", claimId);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DAMAGE_DETECTION_API_URL}/detect`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get damage assessment");
        }

        damageAssessment = await response.json();
      }

      const claimData = {
        id: claimId,
        ...data,
        image: uploadedImage,
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
      console.error("Submission error:", error);
      alert("There was a problem submitting your claim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = () => {
    if (activeTab === "customer") setActiveTab("incident");
    else if (activeTab === "incident") setActiveTab("evidence");
    else if (activeTab === "evidence") setActiveTab("review");
  };

  const prevTab = () => {
    if (activeTab === "incident") setActiveTab("customer");
    else if (activeTab === "evidence") setActiveTab("incident");
    else if (activeTab === "review") setActiveTab("evidence");
  };

  const isTabComplete = (tab: string) => {
    const formValues = watch();
    const hasErrors = Object.keys(errors).length > 0;
    switch (tab) {
      case "customer":
        return (
          !hasErrors &&
          formValues.customerName &&
          formValues.email &&
          formValues.phone &&
          formValues.policyNumber
        );
      case "incident":
        return (
          !hasErrors &&
          formValues.incidentDate &&
          formValues.incidentType &&
          formValues.description &&
          formValues.vehicleBrand &&
          formValues.vehicleType
        );
      case "evidence":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Register New Insurance Claim</CardTitle>
          <CardDescription>
            Complete all required information to submit a new claim
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleFormSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 px-6">
              {["customer", "incident", "evidence", "review"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  disabled={!isTabComplete(tab === "incident" ? "customer" : tab === "evidence" ? "incident" : tab === "review" ? "evidence" : "customer")}
                  className="flex items-center gap-2"
                >
                  {tab === "customer" && <User className="h-4 w-4" />}
                  {tab === "incident" && <Calendar className="h-4 w-4" />}
                  {tab === "evidence" && <ImageIcon className="h-4 w-4" />}
                  {tab === "review" && <CheckCircle2 className="h-4 w-4" />}
                  <span className="capitalize hidden sm:inline">{tab}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <CardContent className="p-6">
              {/* Form sections based on activeTab */}
              {activeTab === "customer" && (
                <>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input id="customerName" {...register("customerName")} />
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...register("phone")} />
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input id="policyNumber" {...register("policyNumber")} />
                </>
              )}

              {activeTab === "incident" && (
                <>
                  <Label htmlFor="incidentDate">Date of Incident</Label>
                  <Input id="incidentDate" type="date" {...register("incidentDate")} />
                  <Label htmlFor="incidentType">Type of Incident</Label>
                  <Select
                    value={watch("incidentType")}
                    onValueChange={(val: any) => setValue("incidentType", val)}
                  >
                    <SelectTrigger id="incidentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["collision", "fire", "theft", "vandalism", "natural", "mechanical"].map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={watch("vehicleType")}
                    onValueChange={(val: any) => setValue("vehicleType", val)}
                  >
                    <SelectTrigger id="vehicleType">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {["2-wheeler", "3-wheeler", "4-wheeler"].map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label htmlFor="vehicleBrand">Brand</Label>
                  <Input id="vehicleBrand" {...register("vehicleBrand")} />
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register("description")} rows={3} />
                </>
              )}

              {activeTab === "evidence" && (
                <>
                  <Label htmlFor="damagePhoto">Upload Damage Photo</Label>
                  <div className="mt-2 border border-dashed rounded-md p-6 text-center">
                    {uploadedImage ? (
                      <>
                        <img src={uploadedImage} alt="Preview" className="max-h-60 mx-auto mb-4" />
                        <Button variant="outline" onClick={() => setUploadedImage(null)}>Remove</Button>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Select or drop a damage photo</p>
                        <Input
                          type="file"
                          id="damagePhoto"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button type="button" variant="outline" className="mt-2" onClick={() => document.getElementById("damagePhoto")?.click()}>
                          Select Image
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}

              {activeTab === "review" && (
                <div className="text-sm">
                  <p><strong>Name:</strong> {watch("customerName")}</p>
                  <p><strong>Email:</strong> {watch("email")}</p>
                  <p><strong>Phone:</strong> {watch("phone")}</p>
                  <p><strong>Policy #:</strong> {watch("policyNumber")}</p>
                  <p><strong>Date:</strong> {watch("incidentDate")}</p>
                  <p><strong>Type:</strong> {watch("incidentType")}</p>
                  <p><strong>Brand:</strong> {watch("vehicleBrand")}</p>
                  <p><strong>Vehicle:</strong> {watch("vehicleType")}</p>
                  <p><strong>Description:</strong> {watch("description")}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevTab}>Back</Button>
              <Button type={activeTab === "review" ? "submit" : "button"} onClick={nextTab}>
                {activeTab === "review" ? "Submit" : "Next Step"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Card>

      {isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
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
  );
}
