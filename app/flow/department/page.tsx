"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Building2, Search, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface Department {
  id: number
  name: string
  department_number: string
  tenant_id: number
}

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    department_number: ''
  })
  const [retryCount, setRetryCount] = useState(0)
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true)

  // Get tenant ID from session storage
  const [tenantID, setTenantID] = useState<string | null>(null)

  useEffect(() => {
    // Get tenant ID from session storage on client side
    const getTenantID = () => {
      const storedTenantID = sessionStorage.getItem('tenantID') || sessionStorage.getItem('tenantId')
      if (storedTenantID) {
        setTenantID(storedTenantID)
        return true
      }
      return false
    }

    // Try to get tenant ID immediately
    if (!getTenantID()) {
      // If not found, try again after a short delay (in case session storage is still loading)
      const timer = setTimeout(() => {
        if (!getTenantID()) {
          setLoading(false)
          setError('No tenant ID found. Please sign in again.')
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (tenantID) {
      fetchDepartments()
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(() => {
        fetchDepartments()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [tenantID])

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if environment variable is set, otherwise use fallback
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!apiBaseUrl) {
        throw new Error('API base URL is not configured. Please check your environment variables.')
      }
      
      console.log('Fetching departments with tenantID:', tenantID)
      console.log('API URL:', `${apiBaseUrl}/department`)
      
      const response = await axios.get(`${apiBaseUrl}/department`, {
        params: {
          tenant_id: sessionStorage.getItem('tenantId'),
          skip: 0,
          limit: 100
        },
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      })
      
      console.log('API Response:', response.data)
      console.log('Response data type:', typeof response.data)
      console.log('Is response.data an array?', Array.isArray(response.data))
      console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No data')
      
      // Handle different response structures
      let departmentsData = []
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log('Response is direct array')
          departmentsData = response.data
        } else if (response.data.departments && Array.isArray(response.data.departments)) {
          console.log('Response has departments array')
          departmentsData = response.data.departments
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Response has data array')
          departmentsData = response.data.data
        } else if (response.data.items && Array.isArray(response.data.items)) {
          console.log('Response has items array')
          departmentsData = response.data.items
        } else if (response.data.results && Array.isArray(response.data.results)) {
          console.log('Response has results array')
          departmentsData = response.data.results
        } else {
          console.log('Unexpected response structure:', response.data)
          console.log('Response data structure:', JSON.stringify(response.data, null, 2))
          departmentsData = []
        }
      }
      
      console.log('Processed departments data:', departmentsData)
      setDepartments(departmentsData)
      setRetryCount(0) // Reset retry count on success
      setAutoRetryEnabled(true) // Re-enable auto-retry on success
    } catch (error: any) {
      console.error('Error fetching departments:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      let errorMessage = 'Failed to fetch departments'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status) {
        errorMessage = `HTTP ${error.response.status}: ${errorMessage}`
      }
      
      // Auto-retry logic for network errors (only if auto-retry is enabled)
      if (autoRetryEnabled && retryCount < 3 && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || !error.response)) {
        setRetryCount(prev => prev + 1)
        setError(`Connection failed. Auto-retrying... (${retryCount + 1}/3)`)
        
        // Auto-retry after 2 seconds
        setTimeout(() => {
          fetchDepartments()
        }, 2000)
        return
      }
      
      // If we've exhausted retries or auto-retry is disabled, show final error
      if (retryCount >= 3) {
        setError(`${errorMessage} - Auto-retry exhausted. Please try again manually.`)
        setAutoRetryEnabled(false) // Disable auto-retry after max attempts
      } else {
        setError(errorMessage)
      }
      
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }, [tenantID, autoRetryEnabled, retryCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
      if (!apiBaseUrl) {
        throw new Error('API base URL is not configured')
      }
      
      if (editingDepartment) {
        // Update existing department
        await axios.put(
          `${apiBaseUrl}/department/${editingDepartment.id}`,
          {
            name: formData.name,
            department_number: formData.department_number,
            tenant_id: sessionStorage.getItem('tenantId')
          }
        )
      } else {
        // Create new department
        await axios.post(`${apiBaseUrl}/department`, {
          name: formData.name,
          department_number: formData.department_number,
          tenant_id: sessionStorage.getItem('tenantId')
        })
      }
      
      // Reset form and close dialog
      setFormData({ name: '', department_number: '' })
      setEditingDepartment(null)
      setIsDialogOpen(false)
      
      // Refresh departments list
      fetchDepartments()
    } catch (error: any) {
      let errorMessage = 'Operation failed'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      alert(errorMessage)
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      department_number: department.department_number
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (departmentId: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
        if (!apiBaseUrl) {
          throw new Error('API base URL is not configured')
        }
        
        await axios.delete(`${apiBaseUrl}/department/${departmentId}`)
        fetchDepartments()
      } catch (error: any) {
        let errorMessage = 'Delete failed'
        if (error.message) {
          errorMessage = error.message
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        alert(errorMessage)
      }
    }
  }

  const openCreateDialog = () => {
    setEditingDepartment(null)
    setFormData({ name: '', department_number: '' })
    setIsDialogOpen(true)
  }

  const reEnableAutoRetry = () => {
    setAutoRetryEnabled(true)
    setRetryCount(0)
    setError(null)
    fetchDepartments()
  }

  const filteredDepartments = Array.isArray(departments) ? departments.filter(dept =>
    (dept.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (dept.department_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : []

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Departments</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {error.includes('No tenant ID found') && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  This usually means you need to sign in again. The page will automatically retry when you&apos;re signed in.
                </p>
              </div>
            )}
            
            {error.includes('Auto-retry exhausted') && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800">
                  Auto-retry has been disabled after 3 failed attempts. You can re-enable it manually.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              {!autoRetryEnabled && (
                <Button onClick={reEnableAutoRetry} className="w-full bg-orange-600 hover:bg-orange-700">
                  Re-enable Auto-retry
                </Button>
              )}
              <Button onClick={fetchDepartments} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
              {error.includes('No tenant ID found') && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/auth/sign-in'} 
                  className="w-full text-blue-600 hover:text-blue-700"
                >
                  Go to Sign In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Departments
            </h1>
            <p className="text-gray-600 mt-2">Manage your organization&apos;s departments</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDepartment ? 'Edit Department' : 'Create New Department'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter department name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="department_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Department Number
                  </label>
                  <Input
                    id="department_number"
                    type="text"
                    placeholder="Enter department number"
                    value={formData.department_number}
                    onChange={(e) => setFormData({ ...formData, department_number: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingDepartment ? 'Update' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Departments Table */}
        {filteredDepartments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No departments found' : 'No departments yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Get started by creating your first department'
                }
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department ID
                      </th>
                     
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDepartments.map((department, index) => (
                      <tr key={department.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {department.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="text-xs">
                            #{department.department_number}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {department.id}
                        </td>
                       
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(department)}
                              className="h-8 px-3"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(department.id)}
                              className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
