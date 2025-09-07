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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Check Your Email
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              We've sent a password reset link to {email}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
            <div className="space-y-6">
              <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                    ✅ Password reset email sent successfully!
                  </p>
                </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-center">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl backdrop-blur-sm">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• The reset link will expire in 1 hour</p>
                  <p>• You can request a new link if needed</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full h-12 border-2 border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-xl backdrop-blur-sm transition-all duration-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                  onClick={() => {
                    setIsSubmitted(false)
                    setError(null)
                  }}
                >
                  Send Another Reset Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Enter your email to receive a password reset link
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-4 backdrop-blur-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
                    {error.includes('No account found') && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p>• Check if you typed the email correctly</p>
                        <p>• Try using the email you used when signing up</p>
                        <p>• If you don't have an account, <Link href="/signup" className="underline hover:no-underline">create one here</Link></p>
                      </div>
                    )}
                    {error.includes('Valid email') && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p>• Make sure you've entered a complete email address</p>
                        <p>• Include the @ symbol and domain (e.g., example@domain.com)</p>
                      </div>
                    )}
                    {error.includes('timeout') && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p>• Check your internet connection</p>
                        <p>• Try again in a few moments</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </Link>
              </div>
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• Enter the email address associated with your account</p>
                  <p>• We'll send you a secure link to reset your password</p>
                  <p>• Can't remember your email? <Link href="/login" className="underline hover:no-underline">Try signing in</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AuthGuard>
  )
}
