"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("fhg_auth_token")
    const userData = localStorage.getItem("fhg_user")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("fhg_auth_token")
    localStorage.removeItem("fhg_user")
    setUser(null)
    router.push("/")
  }

  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/reset-password"
  const isDashboard = pathname === "/dashboard"

  if (isAuthPage) {
    return null
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">FHG AI Email Bot</span>
            <div className="text-xs text-muted-foreground font-medium">Intelligent Email Marketing</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {!isDashboard && (
            <>
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Features
              </a>
              <a href="#automation" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Automation
              </a>
              <a href="#analytics" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Analytics
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Pricing
              </a>
            </>
          )}

          {user ? (
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/5 bg-transparent"
                asChild
              >
                <Link href="/dashboard">Email Dashboard</Link>
              </Button>
              <span className="text-sm text-muted-foreground">Welcome, {user.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/5 bg-transparent"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-lg" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {!isDashboard && (
              <>
                <a
                  href="#features"
                  className="block text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#automation"
                  className="block text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Automation
                </a>
                <a
                  href="#analytics"
                  className="block text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Analytics
                </a>
                <a
                  href="#pricing"
                  className="block text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
              </>
            )}

            {user ? (
              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Welcome, {user.username}</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent border-primary/20" asChild>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    Email Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="w-full bg-transparent border-primary/20" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    Start Free Trial
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
