"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Eye, EyeOff, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock authentication - store user data in localStorage
    const userData = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("fhg_user", JSON.stringify(userData))
    localStorage.setItem("fhg_auth_token", "intelligence_token_" + Date.now())

    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">FHG AI Scouting</span>
              <div className="text-sm text-muted-foreground font-medium">Elite Sports Intelligence</div>
            </div>
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-primary mr-2" />
              <CardTitle className="text-2xl font-bold">Elite Platform Access</CardTitle>
            </div>
            <CardDescription className="text-base">
              Join leading sports organizations using advanced AI intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Professional Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your professional username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Organization Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your organization email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Secure Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Activating Platform Access..." : "Start Intelligence Trial"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">Already have platform access? </span>
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Access your account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
