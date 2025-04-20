"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { FileText, PlusCircle, Search, LayoutDashboard } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CarParking02Icon } from "@hugeicons/core-free-icons"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      active: pathname === "/",
    },
    {
      href: "/claims/register",
      label: "New Claim",
      icon: <PlusCircle className="h-4 w-4 mr-2" />,
      active: pathname === "/claims/register",
    },
    {
      href: "/history",
      label: "Claims History",
      icon: <FileText className="h-4 w-4 mr-2" />,
      active: pathname === "/history",
    },
    {
      href: "/search",
      label: "Search",
      icon: <Search className="h-4 w-4 mr-2" />,
      active: pathname === "/search",
    },
  ]

  return (
    <div className="border-b bg-background">
      <div className="container flex flex-col md:flex-row h-auto md:h-16 items-center px-4">
        <div className="mx-auto mr-8 flex">
          <Link href="/" className="flex items-center space-x-2">
            <HugeiconsIcon icon={CarParking02Icon} className="pb-1 h-[30] w-[29] text-primary" />
            <span className="font-bold text-xl">InsureClaim</span>
          </Link>
        </div>
        <nav className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 flex-1 ">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                route.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
