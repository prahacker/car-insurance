import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from '@hugeicons/react'
import { Scooter01Icon , Scooter04Icon, VanIcon} from '@hugeicons/core-free-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Car,
  Home,
  Flame,
  Droplets,
} from "lucide-react"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 sm:py-10 space-y-6 sm:space-y-8">
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome to your insurance claims management dashboard.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <DashboardCard
          title="Total Claims"
          value="128"
          description="+12% from last month"
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          trend="up"
        />
        <DashboardCard
          title="Pending Review"
          value="28"
          description="5 require immediate action"
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          trend="neutral"
        />
        <DashboardCard
          title="Approved"
          value="86"
          description="+24% from last month"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          trend="up"
        />
        <DashboardCard
          title="Rejected"
          value="14"
          description="-8% from last month"
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          trend="down"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Claims</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

          <TabsContent value="overview" className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
              <Card className="col-span-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Claims by Incident Type</h3>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <ClaimTypeBar type="Fire Damage" icon={<Flame className="h-5 w-5" />} percentage={30} color="bg-red-500" />
                    <ClaimTypeBar type="Water Damage" icon={<Droplets className="h-5 w-5" />} percentage={25} color="bg-blue-500" />
                    <ClaimTypeBar type="Vehicle Accident" icon={<Car className="h-5 w-5" />} percentage={35} color="bg-purple-500" />
                    <ClaimTypeBar type="Property Damage" icon={<Home className="h-5 w-5" />} percentage={10} color="bg-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Quick Actions</h3>
                  </div>
                  <div className="grid gap-3">
                    <Link href="/claims/register">
                      <Button className="w-full justify-start" size="lg">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Register New Claim
                      </Button>
                    </Link>
                    <Link href="/history">
                      <Button variant="outline" className="w-full justify-start" size="lg">
                        <FileText className="mr-2 h-4 w-4" />
                        View All Claims
                      </Button>
                    </Link>
                    <Link href="/search">
                      <Button variant="outline" className="w-full justify-start" size="lg">
                        <Clock className="mr-2 h-4 w-4" />
                        Pending Reviews
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Performance Metrics</h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Avg. Processing Time"
                    value="3.2 days"
                    change="-0.8 days"
                    trend="down"
                    icon={<Clock className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Customer Satisfaction"
                    value="94%"
                    change="+2%"
                    trend="up"
                    icon={<ShieldCheck className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Claim Approval Rate"
                    value="86%"
                    change="+4%"
                    trend="up"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Avg. Claim Value"
                    value="$4,280"
                    change="+$340"
                    trend="up"
                    icon={<TrendingUp className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Recent Claims</h3>
                  <Link href="/history">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="overflow-x-auto pb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Claim ID</th>
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Est. Cost</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <RecentClaimRow
                        id="123456789012"
                        customer="John Smith"
                        date="Mar 1, 2025"
                        type="Vehicle"
                        status="New"
                        cost="$2,450"
                      />
                      <RecentClaimRow
                        id="234567890123"
                        customer="Sarah Johnson"
                        date="Feb 28, 2025"
                        type="Property"
                        status="In Progress"
                        cost="$5,800"
                      />
                      <RecentClaimRow
                        id="345678901234"
                        customer="Michael Brown"
                        date="Feb 27, 2025"
                        type="Fire"
                        status="Approved"
                        cost="$12,350"
                      />
                      <RecentClaimRow
                        id="456789012345"
                        customer="Emily Davis"
                        date="Feb 26, 2025"
                        type="Water"
                        status="Rejected"
                        cost="$3,200"
                      />
                      <RecentClaimRow
                        id="567890123456"
                        customer="Robert Wilson"
                        date="Feb 25, 2025"
                        type="Vehicle"
                        status="Approved"
                        cost="$4,100"
                      />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Claims Analytics</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">This Month</Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">This Quarter</Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">This Year</Button>
                  </div>
                </div>
                <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20 p-4">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Analytics charts would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend: "up" | "down" | "neutral"
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-full p-2 bg-muted">{icon}</div>
          <span
            className={`text-xs font-medium ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-yellow-600"
            }`}
          >
            {description}
          </span>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ClaimTypeBar({
  type,
  icon,
  percentage,
  color,
}: {
  type: string
  icon: React.ReactNode
  percentage: number
  color: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 text-muted-foreground">{icon}</div>
          <span>{type}</span>
        </div>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-muted-foreground">
          {icon}
          <span className="ml-1 text-xs">{title}</span>
        </div>
        <span className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>{change}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function RecentClaimRow({
  id,
  customer,
  date,
  type,
  status,
  cost,
}: {
  id: string
  customer: string
  date: string
  type: string
  status: string
  cost: string
}) {
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
      default:
        return "bg-gray-500"
    }
  }

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-3 px-4 font-mono text-sm">{id}</td>
      <td className="py-3 px-4">{customer}</td>
      <td className="py-3 px-4">{date}</td>
      <td className="py-3 px-4 capitalize">{type}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-3 px-4">{cost}</td>
      <td className="py-3 px-4 text-right">
        <Link href={`/claims/${id}`}>
          <Button variant="outline" size="sm">
            View
          </Button>
        </Link>
      </td>
    </tr>
  )
}
