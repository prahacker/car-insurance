import * as z from "zod"

export const claimFormSchema = z.object({
  customerName: z.string({
    required_error: "Name is required",
  }).min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
  
  policyNumber: z.string({
    required_error: "Policy number is required",
  }).regex(/^POL-\d{8}$/, "Policy number must be in format POL-XXXXXXXX where X is a number"),
  
  email: z.string({
    required_error: "Email is required",
  }).email("Please enter a valid email address"),
  
  phone: z.string({
    required_error: "Phone number is required",
  }).regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
  
  incidentDate: z.string({
    required_error: "Incident date is required",
  }).refine(
    (date) => {
      if (!date) return false
      const selectedDate = new Date(date)
      const today = new Date()
      return selectedDate <= today
    },
    { message: "Incident date cannot be in the future" }
  ),
  
  incidentType: z.enum(["collision", "theft", "vandalism", "fire", "natural", "mechanical"], {
    required_error: "Please select an incident type",
    invalid_type_error: "Please select a valid incident type",
  }),
  
  description: z.string({
    required_error: "Description is required",
  }).min(30, "Please provide at least 30 characters describing the incident").max(500, "Description must not exceed 500 characters"),
  
  vehicleBrand: z.string({
    required_error: "Vehicle brand is required",
  }).min(1, "Please enter the vehicle brand").max(50, "Vehicle brand must not exceed 50 characters"),
  
  vehicleType: z.enum(["2-wheeler", "3-wheeler", "4-wheeler"], {
    required_error: "Please select a vehicle type",
    invalid_type_error: "Please select a valid vehicle type",
  }),
  
  damagePhoto: z.instanceof(File, { message: "Please upload a valid file" })
    .refine(
      (file) => file?.type === "image/jpeg",
      "Only JPG/JPEG files are allowed"
    )
    .optional(),
});

export type ClaimFormData = z.infer<typeof claimFormSchema>;