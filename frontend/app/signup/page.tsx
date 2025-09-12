'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be no more than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { register: registerUser } = useAuth();

  // Password validation
  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push("Must be at least 8 characters long")
    if (!/[A-Z]/.test(password)) errors.push("Must contain at least one uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("Must contain at least one lowercase letter")
    if (!/[0-9]/.test(password)) errors.push("Must contain at least one number")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Must contain at least one special character")
    return errors
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Watch the password field to sync with state
  const watchedPassword = watch('password');

  const passwordErrors = watchedPassword ? validatePassword(watchedPassword) : []
  const isPasswordValid = passwordErrors.length === 0

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      
      setError(null);
      
      await registerUser(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <h2 className="text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Create your account
        </h2>
          <p className="mt-4 text-center text-lg text-gray-600 dark:text-gray-300">
            Get started with MailQuill
          </p>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8">
            <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                  <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
              )}

              <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700 dark:text-gray-100" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Choose a username"
                      className="pl-12 h-12 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    {...register('username')}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.username.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  3-20 characters, letters, numbers, underscores, and hyphens only
                </p>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email address
                  </Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700 dark:text-gray-100" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                      className="pl-12 h-12 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    {...register('email')}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700 dark:text-gray-100" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                      className={`pl-12 pr-12 h-12 bg-white/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm transition-all duration-200 ${watchedPassword && !isPasswordValid ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                      {...register('password')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
                
                  {/* Password Requirements */}
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3">Password Requirements:</p>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-3 text-xs ${watchedPassword && watchedPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${watchedPassword && watchedPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        At least 8 characters long
                      </div>
                      <div className={`flex items-center gap-3 text-xs ${watchedPassword && /[A-Z]/.test(watchedPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${watchedPassword && /[A-Z]/.test(watchedPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-3 text-xs ${watchedPassword && /[a-z]/.test(watchedPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${watchedPassword && /[a-z]/.test(watchedPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-3 text-xs ${watchedPassword && /[0-9]/.test(watchedPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${watchedPassword && /[0-9]/.test(watchedPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        One number
                      </div>
                      <div className={`flex items-center gap-3 text-xs ${watchedPassword && /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${watchedPassword && /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        One special character
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading || !isPasswordValid}
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Create account
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </AuthGuard>
  );
}
