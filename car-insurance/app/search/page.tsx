"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, FileSearch } from "lucide-react"
import { getClaimById } from "@/lib/utils"

export default function SearchPage() {
  const router = useRouter()
  const [claimId, setClaimId] = useState("")
  const [error, setError] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!claimId.trim()) {
      setError("Please enter a claim ID")
      return
    }

    const claim = getClaimById(claimId.trim())

    if (claim) {
      router.push(`/claims/${claimId}`)
    } else {
      setError("No claim found with this ID")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Search Claims</h1>
        <p className="text-muted-foreground">Find specific claims by ID or customer information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Search by Claim ID</CardTitle>
            <CardDescription>Enter a 12-digit claim ID to find specific claim details</CardDescription>
          </CardHeader>
          <form onSubmit={handleSearch}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claimId">Claim ID</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="claimId"
                      placeholder="Enter 12-digit claim ID"
                      className="pl-8"
                      value={claimId}
                      onChange={(e) => {
                        setClaimId(e.target.value)
                        setError("")
                      }}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Search
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="flex items-center justify-center">
          <div className="text-center p-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileSearch className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Find Claims Quickly</h3>
            <p className="text-muted-foreground max-w-md">
              Enter the 12-digit claim ID to instantly access detailed information about a specific insurance claim.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
