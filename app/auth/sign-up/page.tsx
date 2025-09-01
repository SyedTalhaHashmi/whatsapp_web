"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TenantSecretModal } from '@/components/ui/tenant-secret-modal'
import { Eye, EyeOff, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Tenant modal states
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)

  // Password validation states
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    })
  }

  // Check if password is strong
  const isPasswordStrong = () => {
    return Object.values(passwordStrength).every(Boolean)
  }

  // Check if passwords match
  const doPasswordsMatch = () => {
    return password === confirmPassword && password.length > 0
  }

  // Update password and check strength
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    checkPasswordStrength(newPassword)
  }

  // Update confirm password
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  // Handle form submission to create tenant
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all required fields
    if (!fullName) {
      toast.error('Please enter your full name')
      return
    }
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    
    if (!password) {
      toast.error('Please enter your password')
      return
    }

    if (!confirmPassword) {
      toast.error('Please confirm your password')
      return
    }

    if (!doPasswordsMatch()) {
      toast.error('Passwords do not match')
      return
    }

    if (!isPasswordStrong()) {
      toast.error('Password does not meet strength requirements')
      return
    }

    setIsLoading(true)
    try {
      // Create tenant
      const tenantResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/`, {
        name: fullName,
        email: email,
        max_team_member_allowed: 5,
        max_conversations_allowed: 30,
        max_outgoing_messages_per_day: 800
      })
      
      // Store tenant data in session storage
      if (tenantResponse.data && tenantResponse.data.id) {
        sessionStorage.setItem('tenantID', tenantResponse.data.id)
        sessionStorage.setItem('tenantData', JSON.stringify(tenantResponse.data))
        sessionStorage.setItem('tenantSecret', tenantResponse.data.tenant_secret_code)
        
        // Now create user with the tenant secret code
        try {
          const userSignupResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/signup`, {
            email: email,
            password: password,
            name: fullName,
            tenant_secret_code: tenantResponse.data.tenant_secret_code,
            role_id: 0, // Default role ID
            department_id: 0 // Default department ID
          })
          
          toast.success('Account created successfully!')
          
          // Show tenant modal with secret code
          setTenantData(tenantResponse.data)
          if (userSignupResponse.data.id) {
            
            setShowTenantModal(true)
          }
          
        } catch (userError: any) {
          toast.error('User creation failed: ' + (userError.response?.data?.message || userError.message))
          // Still show the tenant modal even if user creation fails
          setTenantData(tenantResponse.data)
          setShowTenantModal(true)
        }
        
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create tenant')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTenantModalClose = () => {
    setShowTenantModal(false)
    setTenantData(null)
    // Clear form data
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    // Redirect to sign-in page
    router.push('/auth/sign-in')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-6 text-white" strokeWidth={2.5}/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to WhatsaApp CRM</h1>
            <p className="text-gray-600 text-sm mt-2">
              Create your account
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <Link
              href="/auth/sign-in"
              className="flex-1 text-center py-2 px-4 rounded-md text-sm font-medium text-gray-900 shadow-sm"
            >
              Log In
            </Link>
            <Link
              href="/auth/sign-up"
              className="flex-1 text-center py-2 px-4 rounded-md text-sm font-medium  bg-white  transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Passwords must match.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character.
              </p>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Login Here
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      {/* Tenant Secret Modal */}
      <TenantSecretModal
        isOpen={showTenantModal}
        onClose={handleTenantModalClose}
        tenantSecret={tenantData?.tenant_secret_code || ''}
        tenantName={tenantData?.name || ''}
      />
    </div>
  )
}
