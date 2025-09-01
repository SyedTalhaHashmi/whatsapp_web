"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Trash, Edit }  from "lucide-react"
import LLMConfigModal from "./components/LLMConfigModal"
import EmbeddingConfigModal from "./components/EmbeddingConfigModal"
import { Switch } from "@/components/ui/switch"
import ConfiguredModels from "./components/configured-models"


type AiModel = {
  id: number
  name: string
  provider_name: string
  model_type: string
  is_active: boolean
  created_at?: string
}

type AiProvider = {
  provider_name: string
  models: AiModel[]
}

export default function AllSettingsPage() {
  const [providers, setProviders] = useState<AiProvider[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [requestUrl, setRequestUrl] = useState<string>("")
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [modelFormData, setModelFormData] = useState({
    name: '',
    provider_name: '',
    model_type: ''
  })
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [apiKeyFormData, setApiKeyFormData] = useState({
    api_key: '',
    model_id: ''
  })
  const [isLLMConfigModalOpen, setIsLLMConfigModalOpen] = useState(false)
  const [isEmbeddingConfigModalOpen, setIsEmbeddingConfigModalOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null)
  const [isModelDetailsModalOpen, setIsModelDetailsModalOpen] = useState(false)
  const [selectedModelForDetails, setSelectedModelForDetails] = useState<AiModel | null>(null)



  const [embeddingObject, setEmbeddingObject] = useState<any>(null)

  const baseUrlFromEnv = process.env.NEXT_PUBLIC_API_BASE_URL

  const candidateUrls = useMemo(() => {
    const urls: string[] = []
    if (baseUrlFromEnv) {
      urls.push(`${baseUrlFromEnv}/ai-config/models`)
    }
    urls.push(process.env.NEXT_PUBLIC_API_BASE_URL + "/ai-config/models")
    urls.push("http://13.51.166.231/api/ai-config/models")
    return urls 
  }, [baseUrlFromEnv])

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    setError(null)
    setProviders([])
    try {
      for (const url of candidateUrls) {
        try {
          const response = await axios.get(url, {
            headers: { accept: "application/json", "ngrok-skip-browser-warning": "69420" },
            timeout: 10000,
          })
          const data = response?.data
          if (Array.isArray(data)) {
            // Support either providers list or flat models list
            if (data.length > 0 && (data[0] as any)?.models) {
              setProviders(data as AiProvider[])
            } else {
              const models = data as AiModel[]
              const providerNameToModels = new Map<string, AiModel[]>()
              for (const model of models) {
                const name = model.provider_name || "Unknown"
                if (!providerNameToModels.has(name)) providerNameToModels.set(name, [])
                providerNameToModels.get(name)!.push(model)
              }
              const grouped: AiProvider[] = Array.from(providerNameToModels.entries()).map(([provider_name, models]) => ({ provider_name, models }))
              setProviders(grouped)
            }
            setRequestUrl(url)
            return
          }
          if (response.status === 200) {
            toast.success('Models fetched successfully')
          }
        } catch (err: any) {
          // Try next candidate URL
          // Optionally log for debugging
          // console.error('Provider fetch failed for', url, err)
          continue
        }
      }
      setError("Unable to fetch AI models. Check your API base URL or network.")
    } finally {
      setLoading(false)

    }
  }, [candidateUrls])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])


  useEffect(() => {
    const fetchTenantApiKeys = async () => {
      try {
        // Get tenant ID from session storage
        const tenantId = sessionStorage.getItem('tenantId')
        // const tenantID = '28'
        
        if (!tenantId) {
          console.log('No tenant ID found in session')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/api-keys/${sessionStorage.getItem('tenantId')}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Tenant API keys fetched successfully:', data)
          
          // Store the first API key ID in session storage
          if (data && data.length > 0) {
            const apiKeyId = data[0].id
            sessionStorage.setItem('api_key_id', apiKeyId.toString())
            console.log('Stored API key ID:', apiKeyId)
          }
        } else {
          console.error('Failed to fetch tenant API keys:', response.status)
        }
      } catch (error) {
        console.error('Error fetching tenant API keys:', error)
      }
    }

    fetchTenantApiKeys()
  }, [])

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelFormData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Model created successfully:', data)
      toast.success('AI Model created successfully!')
      setIsModelModalOpen(false)
      setModelFormData({ name: '', provider_name: '', model_type: '' })
      // Refresh the providers list after creating a model
      fetchProviders()
    } catch (error: any) {
      console.error('Failed to create model:', error)
      toast.error('Failed to create AI model')
    } finally {
      setLoading(false)
    }
  }

  const handleModelInputChange = (field: string, value: string) => {
    setModelFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const tenantId = sessionStorage.getItem('tenantId')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({
          model_id: parseInt(apiKeyFormData.model_id),
          api_key: apiKeyFormData.api_key,
          tenant_id: sessionStorage.getItem('tenantId')
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API key created successfully:', data)
      toast.success('API Key created successfully!')
      setIsApiKeyModalOpen(false)
      setApiKeyFormData({ api_key: '', model_id: '' })
      
      // Refresh the API keys list
      // fetchTenantApiKeys()
    } catch (error: any) {
      console.error('Failed to create API key:', error)
      toast.error('Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const handleApiKeyInputChange = (value: string) => {
    setApiKeyFormData(prev => ({ ...prev, api_key: value }))
  }

  const openModelConfigModal = (model: AiModel) => {
    setSelectedModel(model)
    if (model.model_type.toLowerCase() === 'llm') {
      setIsLLMConfigModalOpen(true)
    } else if (model.model_type.toLowerCase() === 'embedding') {
      setIsEmbeddingConfigModalOpen(true)
    }
  }

  const openModelDetailsModal = (model: AiModel) => {
    setSelectedModelForDetails(model)
    setIsModelDetailsModalOpen(true)
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<AiModel | null>(null)

  const handleDeleteApiKey = async () => {
    if (!modelToDelete) return
    
    setLoading(true)
    try {
      const tenantId   = sessionStorage.getItem('tenantId')
      
      // First, get the existing API key ID for this model
      const existingApiKeysResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/api-keys/${tenantId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
      })

      if (existingApiKeysResponse.ok) {
        const existingApiKeys = await existingApiKeysResponse.json()
        const existingApiKey = existingApiKeys.find((key: any) => key.model_id === modelToDelete.id)
        
        if (existingApiKey) {
          // Delete the API key
          const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/api-keys/${existingApiKey.id}`, {
            method: 'DELETE',
            headers: {
              'ngrok-skip-browser-warning': '69420'
            },
          })

          if (deleteResponse.ok) {
            console.log('API Key deleted successfully')
            toast.success('API Key deleted successfully!')
            setIsDeleteModalOpen(false)
            setModelToDelete(null)
            // Refresh the providers list
            fetchProviders()
          } else {
            // Parse the error response to get the detail
            const errorData = await deleteResponse.json()
            if (errorData.detail) {
              toast.error(errorData.detail)
            } else {
              toast.error(`API Key deletion failed: ${deleteResponse.status}`)
            }
          }
        } else {
          throw new Error('API Key not found for this model')
        }
      } else {
        throw new Error('Failed to fetch existing API keys')
      }
    } catch (error: any) {
      console.error('Failed to delete API key:', error)
      toast.error(`Failed to delete API key: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (model: AiModel) => {
    setModelToDelete(model)
    setIsDeleteModalOpen(true)
  }

  const toggleModelActive = (providerName: string, modelId: number, value: boolean) => {
    setProviders((prev) =>
      (prev || []).map((p) =>
        p.provider_name === providerName
          ? { ...p, models: (p.models || []).map((m) => (m.id === modelId ? { ...m, is_active: value } : m)) }
          : p
      )
    )
  }

  const handleConfigSuccess = () => {
    fetchProviders()
    setSelectedModel(null)
  }

  const normalizedType = (t?: string) => String(t || "").trim().toLowerCase()

  const providersForType = (type: "llm" | "embedding"): AiProvider[] => {
    const wanted = normalizedType(type)
    return (providers || [])
      .map((p) => ({
        provider_name: p.provider_name,
        models: (p.models || []).filter((m) => normalizedType(m.model_type) === wanted),
      }))
      .filter((p) => p.models.length > 0)
  }

  const totalByType = (type: "llm" | "embedding") =>
    providersForType(type).reduce((acc, p) => acc + p.models.length, 0)

  const renderProviders = (items: AiProvider[]) => {
    if (error) return <div className="text-sm text-red-600">{error}</div>
    if (loading) return <div className="text-sm text-muted-foreground">Fetching models…</div>
    if (!items.length) return <div className="text-sm text-muted-foreground">No models found.</div>

    return (
      <>
      <div className="flex flex-col gap-6">
        {items.map((provider) => (
          <div key={provider.provider_name} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">{provider.provider_name}</div>
              <Badge variant="outline" className="uppercase tracking-wide">{provider.models?.length ?? 0} models</Badge>
            </div>
            <Separator className="my-3" />
            <div className="grid gap-3">
              {(provider.models || []).map((model) => (
                <div key={model.id} className="flex flex-col rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div 
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => openModelDetailsModal(model)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium break-all">{model.name}</span>
                        <Badge variant="secondary" className="capitalize">{model.model_type}</Badge>
                        <Badge variant={model.is_active ? "default" : "destructive"}>{model.is_active ? "Active" : "Inactive"}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {/* id: {model.id} */}
                        {model.created_at ? (
                          <span className="">Added {new Date(model.created_at).toLocaleString()}</span>
                        ) : null}
                        <div className="text-xs text-muted-foreground mt-1">
                      {/* <div className="text-xs text-muted-foreground sm:text-right"> */}
                    {model.provider_name}
              
                      </div>
                      </div>
                    </div>
                  </div>
                 
                  {/* <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Switch
                        checked={model.is_active}
                        onCheckedChange={(checked) => toggleModelActive(provider.provider_name, model.id, checked)}
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div> */}
                  <div className="text-xs text-muted-foreground sm:text-right">
                    <p>To Edit or Delete APIs use these Actions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      onClick={() => openModelConfigModal(model)}
                    >
                      <Edit className="h-4 w-4" />   
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      onClick={() => openDeleteModal(model)}
                    >
                      <Trash className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ConfiguredModels />    
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-10">
    
      
      
      
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Configuration</h1>
          <p className="text-sm text-muted-foreground">Available providers and their models</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <Button onClick={fetchProviders} variant="default" size="sm" disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
          {/* <Button variant="default" size="sm" onClick={() => setIsModelModalOpen(true)}>
           {loading ? "Loading…" : "Add Model"}
          </Button>
          {/* <Button variant="default" size="sm" onClick={() => setIsApiKeyModalOpen(true)}>
            {loading ? "Loading…" : "Add API Key"}
          </Button>




          
        </div> */}
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">GET models</CardTitle>
          <CardDescription>
            Endpoint: <span className="font-mono text-xs">{requestUrl || candidateUrls[0]}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="llm">
            <TabsList>
              <TabsTrigger value="llm">LLMs ({totalByType("llm")})</TabsTrigger>
              <TabsTrigger value="embedding">Embeddings ({totalByType("embedding")})</TabsTrigger>
            </TabsList>
            <TabsContent value="llm">
              {renderProviders(providersForType("llm"))}
            </TabsContent>
            <TabsContent value="embedding">
              {renderProviders(providersForType("embedding"))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Model Creation Modal */}
      <Dialog open={isModelModalOpen} onOpenChange={setIsModelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create AI Model</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModelSubmit} className="space-y-4">
            <div>
              <Label htmlFor="modelName">Model Name</Label>
              <Input
                id="modelName"
                value={modelFormData.name}
                onChange={(e) => handleModelInputChange('name', e.target.value)}
                placeholder="Enter model name"
                required
              />
            </div>
            <div>
            <Label htmlFor="providerName">Provider Name</Label>
              <Select value={modelFormData.provider_name} onValueChange={(value) => handleModelInputChange('provider_name', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="modelType">Model Type</Label>
              <Select value={modelFormData.model_type} onValueChange={(value) => handleModelInputChange('model_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llm">LLM</SelectItem>
                  <SelectItem value="embedding">Embedding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModelModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Model
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Key Creation Modal */}
      <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={apiKeyFormData.api_key}
                onChange={(e) => handleApiKeyInputChange(e.target.value)}
                placeholder="Enter API key"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsApiKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create API Key"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the API key for <strong>{modelToDelete?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteApiKey}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete API Key"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LLM Configuration Modal */}
      <LLMConfigModal
        isOpen={isLLMConfigModalOpen}
        onClose={() => setIsLLMConfigModalOpen(false)}
        model={selectedModel}
        onSuccess={handleConfigSuccess}
      />

      {/* Embedding Configuration Modal */}
      <EmbeddingConfigModal
        isOpen={isEmbeddingConfigModalOpen}
        onClose={() => setIsEmbeddingConfigModalOpen(false)}
        model={selectedModel}
        onSuccess={handleConfigSuccess}
      />

      {/* Model Details Modal */}
      <Dialog open={isModelDetailsModalOpen} onOpenChange={setIsModelDetailsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Model Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedModelForDetails && (
              <div>
                <p><strong>Name:</strong> {selectedModelForDetails.name}</p>
                <p><strong>Provider:</strong> {selectedModelForDetails.provider_name}</p>
                <p><strong>Type:</strong> {selectedModelForDetails.model_type}</p>
                <p><strong>Status:</strong> {selectedModelForDetails.is_active ? "Active" : "Inactive"}</p>
                {/* <p><strong>ID:</strong> {selectedModelForDetails.id}</p>
                {selectedModelForDetails.created_at && (
                  <p><strong>Created:</strong> {new Date(selectedModelForDetails.created_at).toLocaleString()}</p>
                )} */}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModelDetailsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => setIsModelDetailsModalOpen(false)}>
                Save
              </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


