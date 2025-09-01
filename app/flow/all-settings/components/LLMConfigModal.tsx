"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type AiModel = {
  id: number
  name: string
  provider_name: string
  model_type: string
  is_active: boolean
  created_at?: string
}

interface LLMConfigModalProps {
  isOpen: boolean
  onClose: () => void
  model: AiModel | null
  onSuccess: () => void
}

export default function LLMConfigModal({ isOpen, onClose, model, onSuccess }: LLMConfigModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    api_key: '',
    temperature: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!model) return
    
    setLoading(true)
    
    try {
      const tenantID = sessionStorage.getItem('tenantId')
      
      if (!tenantID) {
        throw new Error('Tenant ID not found. Please ensure you are properly authenticated.')
      }
      
      // At this point, TypeScript should know tenantID is not null
      const tenantIdString: string = tenantID
      
      // Step 1: Create or Update API Key
      let apiKeyResponse
      try {
        // Try to create new API key first
        apiKeyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/api-keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          body: JSON.stringify({
            model_id: model.id,
            api_key: formData.api_key,
            tenant_id: parseInt(tenantIdString)
          })
        })

        if (apiKeyResponse.ok) {
          const apiKeyData = await apiKeyResponse.json()
          console.log('API Key created successfully:', apiKeyData)
          toast.success('API Key created successfully!')
        } else {
          // Check if API key already exists
          const errorData = await apiKeyResponse.json()
          if (errorData.detail && errorData.detail.includes('already exists')) {
            // API key exists, try to update it
            const existingApiKeysResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/api-keys/${tenantIdString}`, {
              method: 'GET',
              headers: {
                'accept': 'application/json',
                'ngrok-skip-browser-warning': '69420'
              },
            })

            if (existingApiKeysResponse.ok) {
              const existingApiKeys = await existingApiKeysResponse.json()
              const existingApiKey = existingApiKeys.find((key: any) => key.model_id === model.id)
              
              if (existingApiKey) {
                // Update existing API key
                const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/api-keys/${existingApiKey.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': '69420'
                  },
                  body: JSON.stringify({
                    api_key: formData.api_key,
                    is_active: true
                  })
                })

                if (updateResponse.ok) {
                  console.log('API Key updated successfully')
                  toast.success('API Key updated successfully!')
                } else {
                  throw new Error(`API Key update failed: ${updateResponse.status}`)
                }
              } else {
                throw new Error('Existing API key not found for this model')
              }
            } else {
              throw new Error('Failed to fetch existing API keys')
            }
          } else {
            throw new Error(`API Key creation failed: ${apiKeyResponse.status}`)
          }
        }
      } catch (error: any) {
        throw new Error(`API Key operation failed: ${error.message}`)
      }

      // Step 2: Create LLM Configuration (only if API key was successful)
      const llmConfigResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({
          model_id: model.id,
          temperature: parseFloat(formData.temperature),
          tenant_id: parseInt(tenantIdString)
        })
      })

      if (!llmConfigResponse.ok) {
        throw new Error(`LLM Configuration creation failed: ${llmConfigResponse.status}`)
      }

      const llmConfigData = await llmConfigResponse.json()
      console.log('LLM Configuration created successfully:', llmConfigData)
      toast.success('Temperature configuration saved successfully!')

      // Close modal and reset form on complete success
      onClose()
      setFormData({ api_key: '', temperature: '' })
      onSuccess()
      
    } catch (error: any) {
      console.error('Failed to save LLM configuration:', error)
      toast.error(`Failed to save LLM configuration: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure LLM: {model?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={formData.api_key}
              onChange={(e) => handleInputChange('api_key', e.target.value)}
              placeholder="Enter API key for this model"
              required
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              placeholder="0.0 - 2.0"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 