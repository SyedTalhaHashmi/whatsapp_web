"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  UserPlus, 
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter
} from 'lucide-react'

interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  is_active: boolean
  created_at: string
  updated_at: string | null
}

interface User {
  id: number
  email: string
  name: string
  tenant_id: number
  role_id: number
  role_name: string
  department_id: number
  is_active: boolean
  is_verified: boolean
  custom_permissions: string[]
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

interface Department {
  id: number
  name: string
  department_number: string
  tenant_id: number
}

export default function DepartmentHeadRolePage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [departmentHead, setDepartmentHead] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [copied, setCopied] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department_id: ''
  })

  // State for tenant ID and secret
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantSecretKey, setTenantSecretKey] = useState<string | null>(null)

  // Get base URL
  const getBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "https://89f920c37057.ngrok-free.app/api"
  }

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/role/`, {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Failed to fetch roles')
    }
  }

  // Fetch Department Head  only
  const fetchDepartmentHead = async () => {
    if (!tenantId) {
      console.error('❌ Cannot fetch department head: No tenant ID available')
      toast.error('No tenant ID found. Please sign in again.')
      return
    }
    
    console.log('✅ Fetching department head with tenant ID:', tenantId)
    setUserLoading(true)
    try {
      const url = `${getBaseUrl()}/user/?tenant_id=${tenantId}&skip=0&limit=100`
      console.log('🌐 Fetching users from URL:', url)
      
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Filter only department head (role_id = 4)
        const departmentHeadData = data.filter((user: User) => user.role_id === 5 )
        setDepartmentHead(departmentHeadData)
        console.log('✅ Department head fetched successfully:', departmentHeadData.length, 'department head')
      } else {
        console.error('❌ Failed to fetch users, status:', response.status)
        toast.error(`Failed to fetch department head: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error fetching department head:', error)
      toast.error('Failed to fetch department head')
    } finally {
      setUserLoading(false)
    }
  }

  // Fetch departments
  const fetchDepartments = async () => {
    if (!tenantId) return
    
    console.log('Fetching departments with tenant ID:', tenantId)
    try {
      const url = `${getBaseUrl()}/department/?tenant_id=${tenantId}`
      console.log('Fetching departments from URL:', url)
      
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
        console.log('Departments fetched successfully:', data.length, 'departments')
      } else {
        console.error('Failed to fetch departments, status:', response.status)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  // Copy tenant secret to clipboard
  const copyTenantSecret = async () => {
    if (!tenantSecretKey) return
    
    try {
      await navigator.clipboard.writeText(tenantSecretKey)
      setCopied(true)
      toast.success('Tenant secret copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Debug function to check session storage
  const debugSessionStorage = () => {
    console.log('=== SESSION STORAGE DEBUG ===')
    console.log('All session storage keys:')
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        console.log(`${key}:`, sessionStorage.getItem(key))
      }
    }
    console.log('=== END DEBUG ===')
    
    // Also try to refresh the values
    const storedTenantId = sessionStorage.getItem('tenantID') || 
                           sessionStorage.getItem('tenantId') || 
                           sessionStorage.getItem('tenant_id')
    const storedTenantSecret = sessionStorage.getItem('tenantSecret') || 
                               sessionStorage.getItem('tenantSecretKey') || 
                               sessionStorage.getItem('tenant_secret')
    
    if (storedTenantId) {
      setTenantId(storedTenantId)
      console.log('✅ Refreshed tenant ID:', storedTenantId)
    }
    if (storedTenantSecret) {
      setTenantSecretKey(storedTenantSecret)
      console.log('✅ Refreshed tenant secret')
    }
  }

  // Handle create user form submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenantId) {
      toast.error('Tenant ID not found. Please sign in again.')
      return
    }
    
    if (!tenantSecretKey) {
      toast.error('Tenant secret not found. Please sign in again.')
      return
    }
    
    console.log('🔍 Create user form submission check:')
    console.log('  - Tenant ID:', tenantId)
    console.log('  - Tenant Secret:', tenantSecretKey ? 'Found' : 'Not found')
    console.log('  - Form Data:', formData)

    try {
      const payload = {
        ...formData,
        tenant_secret_code: tenantSecretKey,
        role_id: 5, //       role ID
        department_id: parseInt(formData.department_id)
      }
      
      console.log('Creating user with payload:', payload)
      console.log('Using tenant ID from state:', tenantId)
      console.log('Using tenant secret from state:', tenantSecretKey ? 'Found' : 'Not found')

      const response = await fetch(`${getBaseUrl()}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(payload)
      })

             if (response.ok) {
         toast.success('Department head created successfully!')
         setIsCreateModalOpen(false)
         resetForm()
            fetchDepartmentHead()
       } else {
         const errorData = await response.json()
            toast.error(errorData.detail || 'Failed to create department head')      
        }
         } catch (error) {
       console.error('Error creating department head:', error)
       toast.error('Failed to create department head')
     }
  }

  // Handle update user form submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) {
      toast.error('No department head selected for editing')
      return
    }
    
    console.log('🔍 Update department head form submission check:')
    console.log('  - Department head ID:', editingUser.id)
    console.log('  - Form Data:', formData)

    try {
      const payload = {
        name: formData.name,
        role_id: 5, // Department   head role ID (cannot be changed)
        department_id: parseInt(formData.department_id),
        is_active: editingUser.is_active,
        custom_permissions: editingUser.custom_permissions,
        settings: editingUser.settings
      }
      
      console.log('Updating department head with payload:', payload)

      const response = await fetch(`${getBaseUrl()}/user/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(payload)
      })

             if (response.ok) {
         toast.success('Department head updated successfully!')
         setIsUpdateModalOpen(false)
         resetForm()
        fetchDepartmentHead()
       } else {
         const errorData = await response.json()
         toast.error(errorData.detail || 'Failed to update department head')
       }
    } catch (error) {
      console.error('Error updating department head:', error)
      toast.error('Failed to update department head')
    }
  }

  // Update manager
  const handleUpdateUser = async (userId: number, updateData: Partial<User>) => {
    try {
      const response = await fetch(`${getBaseUrl()}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(updateData)
      })

             if (response.ok) {
         toast.success('Department head updated successfully!')
        fetchDepartmentHead()
       } else {
         const errorData = await response.json()
         toast.error(errorData.detail || 'Failed to update department head')
       }
    } catch (error) {
      console.error('Error updating department head:', error)
      toast.error('Failed to update department head')
    }
  }

  // Delete man     ager
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this department head?')) return
    
    try {
        const response = await fetch(`${getBaseUrl()}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      })

             if (response.ok) {
                    toast.success('Department head deleted successfully!')
        fetchDepartmentHead()
       } else {
         toast.error('Failed to delete department head')
       }
    } catch (error) {
      console.error('Error deleting department head:', error)
      toast.error('Failed to delete department head')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      department_id: ''
    })
    setEditingUser(null)
  }

  // Open modal for editing
  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '', // Don't show password when editing
      name: user.name,
      department_id: user.department_id.toString()
    })
    setIsUpdateModalOpen(true)
  }

  // Open modal for creating
  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Close create modal
  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    resetForm()
  }

  // Close update modal
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false)
    resetForm()
  }

  // Filtered team
    const filteredDepartmentHead = departmentHead.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === 'all' || user.department_id.toString() === filterDepartment
    
    return matchesSearch && matchesDepartment
  })

  // Get role name by ID
  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId)
    return role?.name || 'Unknown Role'
  }

  // Get department name by ID
  const getDepartmentName = (departmentId: number) => {
    const department = departments.find(d => d.id === departmentId)
    return department?.name || 'No Department'
  }

  // Get session storage values on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try multiple possible keys for tenant ID
      const storedTenantId = sessionStorage.getItem('tenantID') || 
                             sessionStorage.getItem('tenantId') || 
                             sessionStorage.getItem('tenant_id')
      
      // Try multiple possible keys for tenant secret
      const storedTenantSecret = sessionStorage.getItem('tenantSecret') || 
                                 sessionStorage.getItem('tenantSecretKey') || 
                                 sessionStorage.getItem('tenant_secret')
      
      console.log('Available session storage keys:')
      console.log('tenantID:', sessionStorage.getItem('tenantID'))
      console.log('tenantId:', sessionStorage.getItem('tenantId'))
      console.log('tenant_id:', sessionStorage.getItem('tenant_id'))
      console.log('tenantSecret:', sessionStorage.getItem('tenantSecret'))
      console.log('tenantSecretKey:', sessionStorage.getItem('tenantSecretKey'))
      console.log('tenant_secret:', sessionStorage.getItem('tenant_secret'))
      
      if (storedTenantId) {
        setTenantId(storedTenantId)
        console.log('✅ Retrieved tenant ID from session:', storedTenantId)
      } else {
        console.error('❌ No tenant ID found in session storage!')
      }
      
      if (storedTenantSecret) {
        setTenantSecretKey(storedTenantSecret)
        console.log('✅ Retrieved tenant secret from session')
      } else {
        console.error('❌ No tenant secret found in session storage!')
      }
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    if (tenantId) {
      console.log('Fetching data for tenant ID:', tenantId)
      fetchDepartmentHead()
      fetchDepartments()
    }
    setLoading(false)
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Department Head Management</h1>
           <p className="text-gray-600 dark:text-gray-400 mt-2">
             Create, edit, and manage department head within your organization
           </p>
         </div>
        
                 {/* Tenant Information Display */}
      
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Department Head</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{departmentHead.length}</div>
             <p className="text-xs text-muted-foreground">
               Active department head in organization
             </p>
           </CardContent>
         </Card>

                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Active Department Head</CardTitle>
             <UserPlus className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">
               {departmentHead.filter(u => u.is_active).length}
             </div>
             <p className="text-xs text-muted-foreground">
               Currently active department head
             </p>
           </CardContent>
         </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Total departments
            </p>
          </CardContent>
        </Card>
        <Card>
        {tenantSecretKey && (
             <Card className="w-full md:w-auto">
               <CardHeader className="pb-3">
                 <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <Shield className="w-4 h-4" />
                   Tenant Secret Key
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center gap-2">
                   <Input
                     value={tenantSecretKey}
                     readOnly
                     className="font-mono text-sm"
                   />
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={copyTenantSecret}
                     className="min-w-[40px]"
                   >
                     {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </Button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   Use this key for API authentication
                 </p>
               </CardContent>
             </Card>
           )}
        </Card>
       
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         <div>
               <CardTitle className="text-xl">Department Head Management</CardTitle>
               <p className="text-sm text-muted-foreground">
                 Create, edit, and manage department head in your organization
               </p>
             </div>
            {/* Create User Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                                 <Button onClick={openCreateModal} className="flex items-center gap-2">
                   <Plus className="w-4 h-4" />
                   Add Department Head
                 </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                                 <DialogHeader>
                   <DialogTitle>Create New Department Head</DialogTitle>
                 </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="department_id">Department</Label>
                    <Select
                      value={formData.department_id}
                      onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Department</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={closeCreateModal}>
                      Cancel
                    </Button>
                                         <Button type="submit">
                       Create Department Head
                     </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Update User Modal */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
              <DialogContent className="sm:max-w-[500px]">
                                 <DialogHeader>
                        <DialogTitle>Edit Department Head</DialogTitle>
                 </DialogHeader>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="department_id">Department</Label>
                    <Select
                      value={formData.department_id}
                      onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Department</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={closeUpdateModal}>
                      Cancel
                    </Button>
                                         <Button type="submit">
                       Update Department Head
                     </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                 <Input
                   placeholder="Search department head by name or email..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10"
                 />
              </div>
            </div>
                         <div className="flex gap-2">
               <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                 <SelectTrigger className="w-[180px]">
                   <SelectValue placeholder="Filter by department" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Departments</SelectItem>
                   <SelectItem value="0">No Department</SelectItem>
                   {departments.map((dept) => (
                     <SelectItem key={dept.id} value={dept.id.toString()}>
                       {dept.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
          </div>

          {/* Users Table */}
          {userLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                                 <thead>
                   <tr className="border-b">
                     <th className="text-left py-3 px-4 font-medium">Department Head</th>
                     <th className="text-left py-3 px-4 font-medium">Department</th>
                     <th className="text-left py-3 px-4 font-medium">Status</th>
                     <th className="text-left py-3 px-4 font-medium">Created</th>
                     <th className="text-left py-3 px-4 font-medium">Actions</th>
                   </tr>
                 </thead>
                <tbody>
                                     {filteredDepartmentHead.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                                             <td className="py-3 px-4">
                         <span className="text-sm">
                           {getDepartmentName(user.department_id)}
                         </span>
                       </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={user.is_active ? "default" : "destructive"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {user.is_verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
                                    {filteredDepartmentHead.length === 0 && (
                 <div className="text-center py-8 text-gray-500">
                   {searchTerm || filterDepartment !== 'all' 
                     ? 'No department head match your filters' 
                     : 'No department head found'}
                 </div>
               )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles Information */}

    </div>
  )
}
