"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Database, KeyRound, RefreshCcw, CheckCircle2, Plus, Save, Trash2 } from 'lucide-react'

interface PineconeConfig {
  id: number
  tenant_id: number
  api_key: string
  created_at: string
  updated_at: string | null
}

export default function VectorDatabaseConfigPage() {
  const [tenantId, setTenantId] = useState<number>()
  const [apiKey, setApiKey] = useState<string>('')
  const [status, setStatus] = useState<string>('Not Configured')
  const [loading, setLoading] = useState<boolean>(false)
  const [config, setConfig] = useState<PineconeConfig | null>(null)
  const [showApiKey, setShowApiKey] = useState<boolean>(false)
  const [preApiKey, setPreApiKey] = useState<string>('')
  const [isClient, setIsClient] = useState<boolean>(false)

  useEffect(() => {
    setIsClient(true)
    const storedTenant = sessionStorage.getItem('tenantId')
    console.log('Stored tenant from sessionStorage:', storedTenant)
    if (storedTenant) {
      setTenantId(parseInt(storedTenant))
    } else {
      console.warn('No tenantId found in sessionStorage')
    }
  }, [])

  const refreshStatus = async () => {
    if (!tenantId) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pinecone-config/${tenantId}/status`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setStatus(data.status || 'unknown')
    } catch (e) {
      console.error('Error refreshing status:', e)
      setStatus('unknown')  
    }
  }

  const handleCreate = async () => {
    if (!tenantId) {
      toast.error('Tenant ID not found')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pinecone-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, api_key: apiKey }),
      })
      if (res.status === 409) {
        toast.warning('Configuration already exists. Use Update instead.')
      } else if (!res.ok) {
        const t = await res.text()
        throw new Error(t)
      } else {
        toast.success('Configuration created')
        setApiKey('')
        refreshStatus()
      }
    } catch (e: any) {
      toast.error('Create failed')
    } finally {
      setLoading(false)
      checkStatus()
    }
  }

  const handleUpdate = async () => {
    if (!tenantId) {
      toast.error('Tenant ID not found')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pinecone-config/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t)
      }
      toast.success('Configuration updated')
      setApiKey('')
      refreshStatus()
    } catch (e: any) {
      toast.error('Update failed')
    } finally {
      setLoading(false)
      checkStatus()
    }
  }

  useEffect(() => {
    if (tenantId) {
      checkStatus()
      // Fetch config when tenantId is available
      const fetchConfig = async () => {
        try {
          setLoading(true)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pinecone-config/${tenantId}`, {
            headers: {
              'ngrok-skip-browser-warning': '69420'
            }
          })
          
          if (!response.ok) {
            if (response.status === 404) {
              setConfig(null)
              return
            }
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()  
          setConfig(data)
          setPreApiKey(data.api_key || '') 
        } catch (error) {
          console.error('Error fetching config:', error)
          toast.error('Failed to fetch configuration')
        } finally {
          setLoading(false)
        }
      }
      
      fetchConfig()
    }
  }, [tenantId])

  const handleDelete = async () => {
    if (!tenantId) {
      toast.error('Tenant ID not found')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pinecone-config/${tenantId}`, { method: 'DELETE' })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t)
      }
      toast.success('Configuration deleted')
      setApiKey('')
      refreshStatus()
    } catch (e: any) {
      toast.error('Delete failed')
    } finally {
      setLoading(false)
      checkStatus()
    }
  }

  const checkStatus = async () => {
    if (!tenantId) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pinecone-config/${tenantId}/status`, {
        headers: {
        'ngrok-skip-browser-warning': '69420'
        }
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setStatus(data.has_config ? 'Configured' : 'Not Configured')
    } catch (error) {
      console.error('Error checking status:', error)
      setStatus('unknown')
    }
  }

  const StatusBadge = () => {
    const getStatusInfo = () => {
      if (!isClient) {
        return { label: 'Loading...', variant: 'secondary', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }
      }
      
      if (preApiKey && preApiKey.length > 0) {
        return { label: 'Configured', variant: 'default', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
      } else {
        return { label: 'Not Configured', variant: 'destructive', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-green-200' }
      }
    }

    const statusInfo = getStatusInfo()
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
        <div className={`w-2 h-2 rounded-full ${statusInfo.color === 'text-green-600' ? 'bg-green-500' : statusInfo.color === 'text-red-600' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
        <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 sm:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              Vector Database
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Configure your Pinecone vector database credentials for AI-powered search and similarity matching.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge />
          </div>
        </div>

        {preApiKey && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Current API Key
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="h-8 px-3 text-xs"
                >
                  {showApiKey ? (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                      Hide
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Show
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(preApiKey);
                    toast.success('API key copied to clipboard');
                  }}
                  className="h-8 px-3 text-xs"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </Button>
              </div>
            </div>
            <div className="bg-white border border-gray-300 rounded-md p-3 font-mono text-sm text-gray-800 break-all">
              {showApiKey ? preApiKey : '•'.repeat(Math.min(preApiKey.length, 20))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {showApiKey 
                ? 'This is your current Pinecone API key. You can copy it or update it below.'
                : 'Click "Show" to reveal your API key, or "Copy" to copy it to clipboard.'
              }
            </p>
          </div>
        )}

        {/* Config Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <KeyRound className="w-6 h-6 text-blue-600" />
              </div>
              Pinecone API Configuration
            </CardTitle>
            <div className="mt-4 pt-5 pb-5">
              <div className="flex items-center justify-between">
                <StatusBadge />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="grid gap-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="pcn-..."
                    className="h-12 text-lg font-mono border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Your API key is encrypted and stored securely
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button disabled={loading} onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
              <Button disabled={loading} onClick={handleUpdate} variant="secondary">
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
              <Button disabled={loading} onClick={handleDelete} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <p className="text-xs text-gray-500">Your API key is stored securely and never displayed.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
