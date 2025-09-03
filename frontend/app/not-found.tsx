import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Home, LogIn, Mail } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Logo and Branding */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-slate-900">FHG AI</h1>
              <p className="text-sm text-slate-600">Email Bot</p>
            </div>
          </div>

          {/* 404 Content */}
          <div className="mb-8">
            <h2 className="text-6xl font-bold text-slate-900 mb-4">404</h2>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Page Not Found</h3>
            <p className="text-slate-600 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. Let's get you back to managing your email
              campaigns.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="flex items-center justify-center gap-2 bg-transparent">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>

              <Button asChild variant="outline" className="flex items-center justify-center gap-2 bg-transparent">
                <Link href="/dashboard">
                  <Mail className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-xs text-slate-500 mt-6">
            Need help? Contact our support team for assistance with your email automation platform.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
