'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold tracking-tighter text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
          404
        </h1>
        <h2 className="text-3xl font-semibold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Page Not Found
        </h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
        </p>
      </div>
      
      <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        <Link href="/">
          <Button variant="default" size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="relative w-full max-w-sm h-64 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V9M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19"
            className="stroke-muted-foreground"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="2s"
              values="1;0"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>
  )
}