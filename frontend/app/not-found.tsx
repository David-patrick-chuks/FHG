import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Home, LogIn, Mail } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">FHG AI Bot</span>
        </div>

        {/* 404 Content */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login" className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
