"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, X, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantSecretCode, setTenantSecretCode] = useState('')
  const router = useRouter();
  const [showTenantSecretCode, setShowTenantSecretCode] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Debug logging
    console.log('Environment variable NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
    const loginUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/login`
    console.log('Login URL being used:', loginUrl)
    
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      toast.error('API base URL not configured. Please check environment variables.')
      return
    }
    
    try {
      console.log('Sending login request to:', loginUrl)
      const response = await axios.post(loginUrl, {
        email: email,
        password: password,
        tenant_secret_code: tenantSecretCode
      })
      // alert('Login successful!')
      
      // Store complete user login data
      sessionStorage.setItem('userLoginData', JSON.stringify(response.data))
      
      // Store individual important fields for easy access
      sessionStorage.setItem('accessToken', response.data.access_token)
      sessionStorage.setItem('tokenType', response.data.token_type)
      sessionStorage.setItem('userID', response.data.user.id)
      sessionStorage.setItem('userEmail', response.data.user.email)
      sessionStorage.setItem('userName', response.data.user.name)
      sessionStorage.setItem('userRole', response.data.user.role_name)
      sessionStorage.setItem('userRoleId', response.data.user.role_id)
      sessionStorage.setItem('tenantId', response.data.user.tenant_id)
      sessionStorage.setItem('departmentId', response.data.user.department_id)
      sessionStorage.setItem('isActive', response.data.user.is_active)
      sessionStorage.setItem('isVerified', response.data.user.is_verified)
      sessionStorage.setItem('createdAt', response.data.user.created_at)
      sessionStorage.setItem('tenantMappings', JSON.stringify(response.data.tenant_mappings))
      sessionStorage.setItem('customPermissions', JSON.stringify(response.data.user.custom_permissions))
      sessionStorage.setItem('userSettings', JSON.stringify(response.data.user.settings))
      sessionStorage.setItem("tenantSecretKey", tenantSecretCode)
      // Fetch user permissions
      try {
        const userID = sessionStorage.getItem('userID')
        // const permissionsResponse = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/permission/user/${userID}/permissions`
        // )
        
        // const permissionsData = permissionsResponse.data
        
        // Store user permissions
        // sessionStorage.setItem('userPermissions', JSON.stringify(permissionsData.permissions || null))
        
        // Store admin permissions (from user_role if present)
        // const adminPermissions = permissionsData.user_role?.permissions || null
        // sessionStorage.setItem('adminPermissions', JSON.stringify(adminPermissions))
        
        // Store user role data
        
        sessionStorage.setItem("tenantSecretKey", tenantSecretCode)
        
        console.log('Permissions fetched and stored successfully')
      } catch (permissionError: any) {
        console.error('Failed to fetch permissions:', permissionError)
        // Store null values if permissions fetch fails
       
    
      }
      if( sessionStorage.getItem('tenantId') ){
        
        router.push('/flow/setup')
      }
      
      // You can handle storing tokens or redirecting here
    } catch (error: any) {
      console.error('Login error details:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      if (error.response) {
        // Backend returned an error response
        const errorMessage = error.response.data?.message || error.response.data?.detail || 'Server error'
        toast.error(`Login failed: ${errorMessage}`)
      } else if (error.request) {
        // Network error - request was made but no response received
        console.error('Network error - no response from server')
        toast.error('Network error: Cannot reach the server. Check if backend is running.')
      } else {
        // Other error
        toast.error(`Login failed: ${error.message}`)
      }

    } finally {

    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Close button */}
       

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-6 text-white"  strokeWidth={2.5}/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to WhatsaApp CRM</h1>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <Link
            href="/auth/sign-in"
              onClick={() => setActiveTab('login')}
              className={`flex-1 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </Link>
            <Link
            href="/auth/sign-up"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>

            <div>
              <label htmlFor="Tenant Secret Code" className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Secret Code
              </label>
              <Input
                id="Tenant Secret Code"
                type={showTenantSecretCode ? 'text' : 'password'}
                placeholder="Tenant Secret Code"
                value={tenantSecretCode}
                onChange={(e) => setTenantSecretCode(e.target.value)}
                className="w-full"
                required
              />
              <div className="relative">
              
                {/* <button
                  type="button"
                  onClick={() => setShowTenantSecretCode(!showTenantSecretCode)}
                  className="absolute right-3 top-[-1] transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showTenantSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button> */}
                </div>
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 rounded-md transition-all duration-200 transform hover:scale-[1.02]"
         
            >
              Log In
            </Button>

            {/* Forgot Password Link */}
           
          </form>
        </div>
      </div>
    </div>
  )
} 