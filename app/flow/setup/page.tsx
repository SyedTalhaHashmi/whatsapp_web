'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { 
  Copy, 
  Check, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  MessageCircle,
  Calendar,
  Building2,
  Globe
} from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Schema for platform configuration
const platformConfigSchema = z.object({
  config: z.object({
    access_token: z.string().min(1, 'Access token is required'),
    phone_number: z.string().min(1, 'Phone number is required'),
    phone_number_id: z.string().min(1, 'Phone number ID is required'),
    verify_token: z.string().min(1, 'Verify token is required'),
    waba_id: z.string().min(1, 'WABA ID is required'),
    webhook_url: z.string().min(1, 'Webhook URL is required'),
  }),
  end_date: z.string().min(1, 'End date is required'),
  is_active: z.boolean(),
  platform: z.string().min(1, 'Platform is required'),
  start_date: z.string().min(1, 'Start date is required'),
})

type PlatformConfig = z.infer<typeof platformConfigSchema>

interface PlatformConfigResponse {
  id: number
  platform: string
  tenant_id: number
  department_id: number
  is_active: boolean
  start_date: string
  end_date: string
  config: Record<string, any>
  created_at: string
  updated_at: string
}

interface ListResponse {
  platforms: PlatformConfigResponse[]
  total: number
}

export default function SetupPage() {
  const [configs, setConfigs] = useState<PlatformConfigResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [editingConfig, setEditingConfig] = useState<PlatformConfigResponse | null>(null)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState(process.env.NEXT_PUBLIC_API_BASE_URL_WEBHOOK || '')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [platformToDelete, setPlatformToDelete] = useState<string>('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const router = useRouter()    
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlatformConfig>({
    resolver: zodResolver(platformConfigSchema),
    defaultValues: {
      config: {
        access_token: '',
        phone_number: '',
        phone_number_id: '',
        verify_token: '',
        waba_id: '',
        webhook_url: process.env.NEXT_PUBLIC_API_BASE_URL_WEBHOOK || '',
      },
      end_date: '2025-12-31T23:59:59Z',
      is_active: true,
      platform: 'whatsapp',
      start_date: '2025-08-01T00:00:00Z',
    },
  })

  const isActive = watch('is_active')

  // Fetch platform configurations
  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await axios.get<ListResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/platform-config`, {
        params: { tenant_id: sessionStorage.getItem('tenantId') },
        headers: {
         'ngrok-skip-browser-warning': '69420'  
        }   
      })
      setConfigs(response.data.platforms || [])
    } catch (error) {
      console.error('Error fetching configs:', error)
      toast.error('Failed to fetch platform configurations')
      setConfigs([]) // Ensure configs is always an array
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  // Create or update platform configuration

  const onSubmitCreate = async (data: PlatformConfig) => {
    try {
      const payload = {
        ...data,
        department_id: sessionStorage.getItem('departmentId'),
        tenant_id: sessionStorage.getItem('tenantId'),
      }
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/platform-config`, payload)
      toast.success('Platform configuration created successfully')
      resetToDefaults()
      fetchConfigs() // Refresh the configuration list
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save platform configuration')
      }
  }
  
  

  const onSubmit = async (data: PlatformConfig) => {
    try {
      // Add system-managed fields
      const payload = {
        ...data,
        department_id: sessionStorage.getItem('departmentId'),
        tenant_id: sessionStorage.getItem('tenantId'),
      }
      
      if (editingConfig) {
        // For PUT, we need to include the id
        const updatePayload = {
          ...payload,
          id: editingConfig.id
        }
        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/platform-config`, updatePayload)
        toast.success('Platform configuration updated successfully')
        setEditModalOpen(false)
        setEditingConfig(null)
        resetToDefaults()
        fetchConfigs() // Refresh the configuration list
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/platform-config`, payload)
        toast.success('Platform configuration created successfully')
        resetToDefaults()
        fetchConfigs() // Refresh the configuration list
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save platform configuration')
    }
  }

  // Delete platform configuration
  const handleDelete = async (platform: string) => {
    setPlatformToDelete(platform)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/platform-config/${platformToDelete}`, {
        params: { tenant_id: sessionStorage.getItem('tenantId'), department_id: sessionStorage.getItem('departmentId') }
      })
      toast.success('Platform configuration deleted successfully')
      fetchConfigs()
      setDeleteConfirmOpen(false)
      setPlatformToDelete('')
    } catch (error) {
      console.error('Error deleting config:', error)
      toast.error('Failed to delete platform configuration')
    }
  }

  // Edit configuration
  const handleEdit = (config: PlatformConfigResponse) => {
    setEditingConfig(config)
    setValue('config.access_token', config.config.access_token || '')
    setValue('config.phone_number', config.config.phone_number || '')
    setValue('config.phone_number_id', config.config.phone_number_id || '')
    setValue('config.verify_token', config.config.verify_token || '')
    setValue('config.waba_id', config.config.waba_id || '')
    setValue('config.webhook_url', config.config.webhook_url || '')
    setValue('end_date', config.end_date)
    setValue('is_active', config.is_active)
    setValue('platform', config.platform)
    setValue('start_date', config.start_date)
    setEditModalOpen(true)
  }

  // Cancel edit modal
  const handleCancelEdit = () => {
    setEditModalOpen(false)
    setEditingConfig(null)
    resetToDefaults()
  }

  // Reset form to default values
  const resetToDefaults = () => {
    reset({
      config: {
        access_token: '',
        phone_number: '',
        phone_number_id: '',
        verify_token: '',
        waba_id: '',
        webhook_url: process.env.NEXT_PUBLIC_API_BASE_URL_WEBHOOK ,
      },
      end_date: '2025-12-31T23:59:59Z',
      is_active: true,
      platform: 'whatsapp',
      start_date: '2025-08-01T00:00:00Z',
    })
  }

  // Copy webhook URL
  const copyWebhookUrl = async () => {
    if (!webhookUrl) {
      toast.error('Webhook URL is not available')
      return
    }
    
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopiedWebhook(true)
      toast.success('Webhook URL copied to clipboard')
      setTimeout(() => setCopiedWebhook(false), 2000)
    } catch (error) {
      toast.error('Failed to copy webhook URL')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure and manage your messaging platform integrations
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <Settings className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Webhook URL Section */}
      <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Globe className="w-5 h-5" />
            Webhook URL
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Use this URL to configure your platform webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono text-sm bg-white dark:bg-gray-800"
              readOnly
            />
            <Button
              onClick={copyWebhookUrl}
              variant="outline"
              size="sm"
              className="min-w-[100px]"
            >
              {copiedWebhook ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            Create Configuration
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Settings className="w-4 h-4 mr-2" />
            Manage Configurations
          </TabsTrigger>
        </TabsList>

        {/* Create/Edit Configuration Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Create New Platform Configuration
              </CardTitle>
              <CardDescription>
                Configure your messaging platform with the required parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-6">
                {/* Platform and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                  <div className='bg-blue-50  p-2 rounded-md'>
                  Whatsapp
                  </div>
                  </div>
                </div>

                {/* Configuration Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Platform Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="access_token">Access Token *</Label>
                      <Input
                        id="access_token"
                        {...register('config.access_token')}
                        placeholder="Enter your access token"
                      />
                      {errors.config?.access_token && (
                        <p className="text-sm text-red-600">{errors.config.access_token.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        {...register('config.phone_number')}
                        placeholder="+1234567890"
                      />
                      {errors.config?.phone_number && (
                        <p className="text-sm text-red-600">{errors.config.phone_number.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number_id">Phone Number ID *</Label>
                      <Input
                        id="phone_number_id"
                        {...register('config.phone_number_id')}
                        placeholder="Enter phone number ID"
                      />
                      {errors.config?.phone_number_id && (
                        <p className="text-sm text-red-600">{errors.config.phone_number_id.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verify_token">Verify Token *</Label>
                      <Input
                        id="verify_token"
                        {...register('config.verify_token')}
                        placeholder="Enter verify token"
                      />
                      {errors.config?.verify_token && (
                        <p className="text-sm text-red-600">{errors.config.verify_token.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waba_id">WABA ID *</Label>
                      <Input
                        id="waba_id"
                        {...register('config.waba_id')}
                        placeholder="Enter WABA ID"
                      />
                      {errors.config?.waba_id && (
                        <p className="text-sm text-red-600">{errors.config.waba_id.message}</p>
                      )}
                    </div>

                    
                  </div>
                </div>

                {/* Date and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      {...register('start_date')}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-600">{errors.start_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      {...register('end_date')}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-600">{errors.end_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="is_active">Active Status</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="is_active"
                        checked={isActive}
                        onCheckedChange={(checked) => setValue('is_active', checked)}
                      />
                      <Label htmlFor="is_active">
                        {isActive ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Configuration'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Configurations Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Configurations
              </CardTitle>
              <CardDescription>
                View and manage your existing platform configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading configurations...</p>
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No platform configurations found</p>
                  <p className="text-sm text-gray-500 mt-1">Create your first configuration in the Create tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <Card key={config.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant={config.is_active ? 'default' : 'secondary'}>
                                {config.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline">{config.platform}</Badge>
                             
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                                <span className="ml-2 font-mono">{config.config.phone_number || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Phone Number ID:</span>
                                <span className="ml-2 font-mono">{config.config.phone_number_id || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">WABA ID:</span>
                                <span className="ml-2 font-mono">{config.config.waba_id || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Verify Token:</span>
                                <span className="ml-2 font-mono">{config.config.verify_token || 'N/A'}</span>
                              </div>
                             
                              
                              
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Start: {new Date(config.start_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>End: {new Date(config.end_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(config)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(config.platform)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this platform configuration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Platform Configuration
            </DialogTitle>
            <DialogDescription>
              Update your messaging platform configuration parameters
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Platform and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <div className='bg-blue-50 p-2 rounded-md'>
                  Whatsapp
                </div>
              </div>
            </div>

            {/* Configuration Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Platform Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_access_token">Access Token *</Label>
                  <Input
                    id="edit_access_token"
                    {...register('config.access_token')}
                    placeholder="Enter your access token"
                  />
                  {errors.config?.access_token && (
                    <p className="text-sm text-red-600">{errors.config.access_token.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_phone_number">Phone Number *</Label>
                  <Input
                    id="edit_phone_number"
                    {...register('config.phone_number')}
                    placeholder="+1234567890"
                  />
                  {errors.config?.phone_number && (
                    <p className="text-sm text-red-600">{errors.config.phone_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_phone_number_id">Phone Number ID *</Label>
                  <Input
                    id="edit_phone_number_id"
                    {...register('config.phone_number_id')}
                    placeholder="Enter phone number ID"
                  />
                  {errors.config?.phone_number_id && (
                    <p className="text-sm text-red-600">{errors.config.phone_number_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_verify_token">Verify Token *</Label>
                  <Input
                    id="edit_verify_token"
                    {...register('config.verify_token')}
                    placeholder="Enter verify token"
                  />
                  {errors.config?.verify_token && (
                    <p className="text-sm text-red-600">{errors.config.verify_token.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_waba_id">WABA ID *</Label>
                  <Input
                    id="edit_waba_id"
                    {...register('config.waba_id')}
                    placeholder="Enter WABA ID"
                  />
                  {errors.config?.waba_id && (
                    <p className="text-sm text-red-600">{errors.config.waba_id.message}</p>
                  )}
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="edit_webhook_url">Webhook URL *</Label>
                  <Input
                    id="edit_webhook_url"
                    {...register('config.webhook_url')}
                    placeholder="Enter webhook URL"
                  />
                  {errors.config?.webhook_url && (
                    <p className="text-sm text-red-600">{errors.config.webhook_url.message}</p>
                  )}
                </div> */}
              </div>
            </div>

            {/* Date and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Start Date</Label>
                <Input
                  id="edit_start_date"
                  type="datetime-local"
                  {...register('start_date')}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_end_date">End Date</Label>
                <Input
                  id="edit_end_date"
                  type="datetime-local"
                  {...register('end_date')}
                />
                {errors.end_date && (
                  <p className="text-sm text-red-600">{errors.end_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_is_active">Active Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="edit_is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                  />
                  <Label htmlFor="edit_is_active">
                    {isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <DialogFooter className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Configuration'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
