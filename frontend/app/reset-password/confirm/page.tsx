"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

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
  const verificationInProgress = useRef(false)

  // Password validation
  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push("Must be at least 8 characters long")
    if (!/[A-Z]/.test(password)) errors.push("Must contain at least one uppercase letter")
    if (!/[0-9]/.test(password)) errors.push("Must contain at least one number")
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Must contain at least one special character")
    return errors
  }

  const passwordErrors = newPassword ? validatePassword(newPassword) : []
  const isPasswordValid = passwordErrors.length === 0

  const verifyToken = useCallback(async () => {
    if (!token || verificationInProgress.current) return;
    
    verificationInProgress.current = true;
    
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
    } finally {
      verificationInProgress.current = false;
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    // Verify the token
    verifyToken()
  }, [token, verifyToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!isPasswordValid) {
      setError('Password does not meet the requirements')
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
              Invalid Reset Link
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              This password reset link is invalid
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
            <div className="text-center">
              <Link href="/reset-password">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
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
              Reset Link Expired
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              This password reset link has expired or is invalid
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
            <div className="text-center">
              <Link href="/reset-password">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
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
              Password Reset Successfully!
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Your password has been updated
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
            <div className="space-y-6">
              <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                  ✅ Your password has been successfully updated!
                </p>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-center">
                You can now sign in with your new password.
              </p>
              
              <Link href="/login">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isValidToken === null) {
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
              Verifying Reset Link
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Please wait while we verify your reset link...
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            Create New Password
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {userEmail && `for ${userEmail}`}
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-4 backdrop-blur-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
                    {error.includes('expired') && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p>• Reset links expire after 1 hour for security</p>
                        <p>• <Link href="/reset-password" className="underline hover:no-underline">Request a new reset link</Link></p>
                      </div>
                    )}
                    {error.includes('invalid') && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p>• This link may have been used already</p>
                        <p>• <Link href="/reset-password" className="underline hover:no-underline">Request a new reset link</Link></p>
                      </div>
                    )}
                    {error.includes('Password validation') && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p>• Password must be at least 8 characters long</p>
                        <p>• Use a mix of letters, numbers, and symbols</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-12 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm transition-all duration-200 pr-12 ${newPassword && !isPasswordValid ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl backdrop-blur-sm">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3">Password Requirements:</p>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-3 text-xs ${newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      At least 8 characters long
                    </div>
                    <div className={`flex items-center gap-3 text-xs ${/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-3 text-xs ${/[0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      One number
                    </div>
                    <div className={`flex items-center gap-3 text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      One special character
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
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
                    className="h-12 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm transition-all duration-200 pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
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
                  <p>• Choose a strong password you haven't used before</p>
                  <p>• Your new password will be active immediately</p>
                  <p>• You can change it again from your account settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
