"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, Brain } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { useState } from "react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.post('/auth/reset-password', { email })
      
      if (response.success) {
        setIsSubmitted(true)
      } else {
        setError(response.message || 'Failed to send reset email')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email. Please try again.'
      
      // Provide more helpful error messages for common cases
      if (errorMessage.includes('User not found')) {
        setError('No account found with this email address. Please check your email or create a new account.')
      } else if (errorMessage.includes('Valid email is required')) {
        setError('Please enter a valid email address.')
      } else if (errorMessage.includes('timeout')) {
        setError('Request timed out. Please check your internet connection and try again.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">FHG AI Email Bot</span>
            </Link>
          </div>

          <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We've sent a password reset link to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    ✅ Password reset email sent successfully!
                  </p>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• The reset link will expire in 1 hour</p>
                  <p>• You can request a new link if needed</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => {
                    setIsSubmitted(false)
                    setError(null)
                  }}
                >
                  Send Another Reset Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FHG AI Email Bot</span>
          </Link>
        </div>

        <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{error}</p>
                      {error.includes('No account found') && (
                        <div className="text-sm">
                          <p>• Check if you typed the email correctly</p>
                          <p>• Try using the email you used when signing up</p>
                          <p>• If you don't have an account, <Link href="/signup" className="underline hover:no-underline">create one here</Link></p>
                        </div>
                      )}
                      {error.includes('Valid email') && (
                        <div className="text-sm">
                          <p>• Make sure you've entered a complete email address</p>
                          <p>• Include the @ symbol and domain (e.g., example@domain.com)</p>
                        </div>
                      )}
                      {error.includes('timeout') && (
                        <div className="text-sm">
                          <p>• Check your internet connection</p>
                          <p>• Try again in a few moments</p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </Link>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                <p>• Enter the email address associated with your account</p>
                <p>• We'll send you a secure link to reset your password</p>
                <p>• Can't remember your email? <Link href="/login" className="underline hover:no-underline">Try signing in</Link></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      </AuthGuard>
  )
}
