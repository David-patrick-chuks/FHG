import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Home, LogIn, Mail } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
      

        {/* 404 Content */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    </div>
  )
}
