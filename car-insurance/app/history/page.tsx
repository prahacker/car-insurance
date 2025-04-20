"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ArrowLeft, ArrowRight } from "lucide-react"
import { getClaimsFromStorage } from "@/lib/utils"
import type { ClaimData } from "@/lib/types"
import { ClaimSummary } from "@/components/claim-summary"

function ClaimsTable({
  claims,
  getStatusColor,
  formatDate,
}: {
  claims: ClaimData[]
  getStatusColor: (status: string) => string
  formatDate: (date: string) => string
}) {
  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-sm sm:text-base">Claim ID</th>
            <th className="text-left py-3 px-4 font-medium text-sm sm:text-base">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-sm sm:text-base">Date</th>
            <th className="text-left py-3 px-4 font-medium text-sm sm:text-base">Type</th>
            <th className="text-left py-3 px-4 font-medium text-sm sm:text-base">Status</th>
            <th className="text-left py-3 px-4 font-medium text-sm sm:text-base">Est. Cost</th>
            <th className="text-right py-3 px-32 font-medium text-sm sm:text-base">Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-mono text-xs sm:text-sm">{claim.id}</td>
              <td className="py-3 px-4 text-sm sm:text-base">{claim.customerName}</td>
              <td className="py-3 px-4 text-sm sm:text-base">{formatDate(claim.createdAt)}</td>
              <td className="py-3 px-4 capitalize text-sm sm:text-base">{claim.incidentType}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    claim.status
                  )}`}
                >
                  {claim.status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm sm:text-base">
                ${claim.damageAssessment?.estimatedCost.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end space-x-2">
                  <ClaimSummary claim={claim} buttonVariant="ghost" buttonSize="sm" />
                    <Link href={`/claims/${claim.id}/summary`} />
                    <Button variant="outline" size="sm">
                    <Link href={`/claims/${claim.id}`}>View Details</Link>

                    </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function HistoryPage() {
  const [claims, setClaims] = useState<ClaimData[]>([])
  const [filteredClaims, setFilteredClaims] = useState<ClaimData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  const itemsPerPage = 10

  useEffect(() => {
    const storedClaims = getClaimsFromStorage()
    setClaims(storedClaims)
    setFilteredClaims(storedClaims)
  }, [])

  useEffect(() => {
    let filtered = claims

    if (activeTab !== "all") {
      filtered = filtered.filter((claim) => claim.status.toLowerCase() === activeTab.toLowerCase())
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (claim) =>
          claim.id.toLowerCase().includes(query) ||
          claim.customerName.toLowerCase().includes(query) ||
          claim.policyNumber.toLowerCase().includes(query)
      )
    }

    setFilteredClaims(filtered)
    setCurrentPage(1)
  }, [searchQuery, claims, activeTab])

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClaims = filteredClaims.slice(startIndex, startIndex + itemsPerPage)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No claims found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Claims History</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage all registered insurance claims</p>
      </div>

      <div className="mt-6 sm:mt-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl">Claims</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-3 sm:px-6">
              <div className="overflow-x-auto pb-2">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="all"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                  >
                    All Claims
                  </TabsTrigger>
                  <TabsTrigger
                    value="new"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                  >
                    New
                  </TabsTrigger>
                  <TabsTrigger
                    value="in progress"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                  >
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                  >
                    Approved
                  </TabsTrigger>
                  <TabsTrigger
                    value="rejected"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2 bg-transparent"
                  >
                    Rejected
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <CardContent className="p-3 sm:p-6">
              <TabsContent value="all" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="new" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="in progress" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <ClaimsTable claims={paginatedClaims} getStatusColor={getStatusColor} formatDate={formatDate} />
              </TabsContent>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
                  <p className="text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredClaims.length)} of{" "}
                    {filteredClaims.length} claims
                  </p>
                  <div className="flex items-center justify-center space-x-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
