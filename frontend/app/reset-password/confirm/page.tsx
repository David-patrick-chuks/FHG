"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, Brain, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { Suspense, useEffect, useState } from "react"

function ResetPasswordConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    // Verify the token
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await apiClient.get(`/auth/reset-password/verify/${token}`)
      
      // Type assertion to handle the response data structure
      const data = response.data as { valid?: boolean; email?: string }
      
      if (response.success && data?.valid) {
        setIsValidToken(true)
        setUserEmail(data.email || '')
      } else {
        setIsValidToken(false)
        setError('This reset link is invalid or has expired. Please request a new one.')
      }
    } catch (err) {
      setIsValidToken(false)
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify reset link. Please try again.'
      
      if (errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
        setError('This reset link has expired. Please request a new one.')
      } else if (errorMessage.includes('User not found')) {
        setError('This reset link is invalid. Please request a new one.')
      } else {
        setError(errorMessage)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.post('/auth/reset-password/confirm', { 
        token, 
        newPassword 
      })
      
      if (response.success) {
        setIsSuccess(true)
      } else {
        setError(response.message || 'Failed to reset password')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. Please try again.'
      
      if (errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
        setError('This reset link has expired. Please request a new one.')
      } else if (errorMessage.includes('Password validation failed')) {
        setError('Please ensure your password meets the requirements.')
      } else if (errorMessage.includes('User not found')) {
        setError('This reset link is invalid. Please request a new one.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Invalid Reset Link</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                This password reset link is invalid
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/reset-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Reset Link Expired</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                This password reset link has expired or is invalid
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/reset-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isSuccess) {
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
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Password Reset Successfully!</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Your password has been updated
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You can now sign in with your new password.
              </p>
              <Link href="/login">
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Verifying Reset Link</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your reset link...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
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
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create New Password</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {userEmail && `for ${userEmail}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{error}</p>
                      {error.includes('expired') && (
                        <div className="text-sm">
                          <p>• Reset links expire after 1 hour for security</p>
                          <p>• <Link href="/reset-password" className="underline hover:no-underline">Request a new reset link</Link></p>
                        </div>
                      )}
                      {error.includes('invalid') && (
                        <div className="text-sm">
                          <p>• This link may have been used already</p>
                          <p>• <Link href="/reset-password" className="underline hover:no-underline">Request a new reset link</Link></p>
                        </div>
                      )}
                      {error.includes('Password validation') && (
                        <div className="text-sm">
                          <p>• Password must be at least 8 characters long</p>
                          <p>• Use a mix of letters, numbers, and symbols</p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
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
                <p>• Choose a strong password you haven't used before</p>
                <p>• Your new password will be active immediately</p>
                <p>• You can change it again from your account settings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordConfirmPage() {
  return (
    <AuthGuard requireAuth={false}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }>
        <ResetPasswordConfirmContent />
      </Suspense>
    </AuthGuard>
  )
}
