"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { getSessionStorageItem } from "@/lib/utils"

interface Document {
  id: number
  document_name: string
  original_filename: string
  document_type: string
  is_enabled: boolean
  tenant_id: number
  file_size: number
  content_length: number
  chunk_count: number
  vector_ids: string[]
  embedding_config_id: number
  embedding_model_id: number
  embedding_provider_name: string
  created_at: string
  updated_at: string
}

interface KnowledgeBaseStats {
  total_documents: number
  total_chunks: number
  providers: {
    provider_name: string
    document_count: number
    total_chunks: number
    enabled_documents: number
  }[]
  enabled_documents: number
}

interface DocumentsResponse {
  documents: Document[]
  total: number
  page: number
  page_size: number
}

interface EmbeddingConfig {
  id: number
  tenant_id: number
  model_id: number
  is_enabled: boolean
  created_at: string
  updated_at: string
  model: {
    id: number
    name: string
    provider_name: string
    model_type: string
  }
  has_api_key: boolean
  api_key_status: string
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedProvider, setSelectedProvider] = useState<string>("all")
  const [showEnabledOnly, setShowEnabledOnly] = useState(true)
  const [embeddingConfigs, setEmbeddingConfigs] = useState<EmbeddingConfig[]>([])
  const [embeddingConfigsLoading, setEmbeddingConfigsLoading] = useState(false)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    document_name: "",
    tenant_id: parseInt(getSessionStorageItem("tenantId") || "1"), // Default tenant ID - you might want to get this from context
    embedding_config_id: 1 // Default embedding config ID
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    document_name: "",
    is_enabled: true
  })

  // Mock tenant ID - replace with actual tenant ID from your auth context
  // const tenantId = 1

  // Fetch embedding configs
  const fetchEmbeddingConfigs = async () => {
    try {
      setEmbeddingConfigsLoading(true)
      const tenantId = getSessionStorageItem("tenantId") || "1"
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/tenant/${tenantId}/embedding-configs`, {
        headers: { 'ngrok-skip-browser-warning': '69420' }
      })
      if (!response.ok) return
      const data = await response.json()
      setEmbeddingConfigs(data)
      
      // Set default embedding config to the first enabled one, or first one if none enabled
      const enabledConfig = data.find((config: EmbeddingConfig) => config.is_enabled)
      if (enabledConfig) {
        setUploadForm(prev => ({ ...prev, embedding_config_id: enabledConfig.id }))
      } else if (data.length > 0) {
        setUploadForm(prev => ({ ...prev, embedding_config_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching embedding configs:', error)
    } finally {
      setEmbeddingConfigsLoading(false)
    }
  }

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        tenant_id: getSessionStorageItem("tenantId") || "1",
        // page: currentPage.toString(),
        // page_size: pageSize.toString(),
        // enabled_only: showEnabledOnly.toString()
      })
      
      if (selectedProvider && selectedProvider !== "all") {
        params.append('provider_name', selectedProvider)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/knowledge-base/?${params}`, {
        headers: { 'ngrok-skip-browser-warning': '69420' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data: DocumentsResponse = await response.json()
      setDocuments(data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams({
        tenant_id: getSessionStorageItem("tenantId") || "1"
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/knowledge-base/stats?${params}`, {
        headers: { 'ngrok-skip-browser-warning': '69420' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const data: KnowledgeBaseStats = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to fetch stats')
    }
  }

  // Prefill embedding_config_id from tenant embedding credentials
  const prefillEmbeddingConfigId = async () => {
    try {
      const tenantId = getSessionStorageItem("tenantId") || "1"
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/tenant/${tenantId}/embedding-configs`, {
        headers: { 'ngrok-skip-browser-warning': '69420' }
      })
      if (!response.ok) return
      const data = await response.json()
      if (data?.config_id) {
        setUploadForm((prev) => ({ ...prev, embedding_config_id: data.config_id }))
      }
    } catch (_) {
      // silently ignore; user can still input manually
    }
  }

  // Upload document
  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('tenant_id', uploadForm.tenant_id.toString())
      formData.append('embedding_config_id', uploadForm.embedding_config_id.toString())
      
      if (uploadForm.document_name) {
        formData.append('document_name', uploadForm.document_name)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/knowledge-base/upload`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': '69420' },
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload document')
      
      const result = await response.json()
      toast.success(`Document uploaded successfully! ${result.chunk_count} chunks created.`)
      
      setShowUploadModal(false)
      setUploadForm({ file: null, document_name: "", tenant_id: 1, embedding_config_id: 1 })
      fetchDocuments()
      fetchStats()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  // Update document
  const handleUpdateDocument = async () => {
    if (!selectedDocument) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/knowledge-base/tenant/${getSessionStorageItem("tenantId")}/document/ ${selectedDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) throw new Error('Failed to update document')
      
      toast.success('Document updated successfully!')
      setShowEditModal(false)
      setSelectedDocument(null)
      fetchDocuments()
      fetchStats()
    } catch (error) {
      console.error('Error updating document:', error)
      toast.error('Failed to update document')
    }
  }

  // Delete document
  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/knowledge-base/${documentId}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': '69420' }
      })

      if (!response.ok) throw new Error('Failed to delete document')
      
      toast.success('Document deleted successfully!')
      fetchDocuments()
      fetchStats()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  // Toggle document enable/disable
  const toggleDocumentEnable = async (documentId: number, enabled: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/knowledge-base/${documentId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ is_enabled: enabled })
      })

      if (!response.ok) throw new Error('Failed to toggle document')
      
      toast.success(`Document ${enabled ? 'enabled' : 'disabled'} successfully!`)
      fetchDocuments()
      fetchStats()
    } catch (error) {
      console.error('Error toggling document:', error)
      toast.error('Failed to toggle document')
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter documents based on selected provider and enabled status
  const filteredDocuments = documents.filter(doc => {
    if (selectedProvider !== "all" && doc.embedding_provider_name !== selectedProvider) {
      return false
    }
    if (showEnabledOnly && !doc.is_enabled) {
      return false
    }
    return true
  })

  // Get unique providers for filter
  const uniqueProviders = Array.from(new Set(documents.map(doc => doc.embedding_provider_name)))

  useEffect(() => {
    fetchDocuments()
    fetchStats()
    fetchEmbeddingConfigs()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [selectedProvider, showEnabledOnly])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl mb-2">Knowledge Base</h2>
        <p className="text-gray-600">Manage your knowledge base documents and monitor usage statistics.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_documents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Chunks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_chunks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Enabled Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enabled_documents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.providers.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider Stats */}
      {stats && stats.providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.providers.map((provider, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{provider.provider_name}</h4>
                    <p className="text-sm text-gray-600">
                      {provider.document_count} documents, {provider.total_chunks} chunks
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={provider.enabled_documents > 0 ? "default" : "secondary"}>
                      {provider.enabled_documents} enabled
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {uniqueProviders.map(provider => (
                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled-only"
              checked={showEnabledOnly}
              onCheckedChange={setShowEnabledOnly}
            />
            <Label htmlFor="enabled-only">Show enabled only</Label>
          </div>
        </div>

        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogTrigger asChild>
            <Button className="bg-green-800 hover:bg-green-900">
              + Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="document-name">Document Name (Optional)</Label>
                <Input
                  id="document-name"
                  value={uploadForm.document_name}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_name: e.target.value })}
                  placeholder="Enter document name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              {/* <div className="grid gap-2">
                <Label htmlFor="tenant-id">Tenant ID</Label>
                <Input
                  id="tenant-id"
                  type="number"
                  value={uploadForm.tenant_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, tenant_id: parseInt(e.target.value) })}
                />
              </div> */}
              <div className="grid gap-2">
                <Label htmlFor="embedding-config">Embedding Model</Label>
                <Select
                  value={uploadForm.embedding_config_id.toString()}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, embedding_config_id: parseInt(value) })}
                  disabled={embeddingConfigsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={embeddingConfigsLoading ? "Loading models..." : "Select embedding model"} />
                  </SelectTrigger>
                  <SelectContent>
                    {embeddingConfigs.map((config) => (
                      <SelectItem 
                        key={config.id} 
                        value={config.id.toString()}
                        className={config.is_enabled ? "bg-green-50 border-green-200" : ""}
                      >
                        <div className="flex items-center gap-2">
                          <span>{config.model.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {config.model.provider_name}
                          </Badge>
                          {config.is_enabled && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              Active
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploading || !uploadForm.file}
                className="bg-green-800 hover:bg-green-900"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents found. Upload your first document to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{doc.document_name || doc.original_filename}</h3>
                        <Badge variant={doc.is_enabled ? "default" : "secondary"}>
                          {doc.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Badge variant="outline">{doc.embedding_provider_name}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">File:</span> {doc.original_filename}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {formatFileSize(doc.file_size)}
                        </div>
                        <div>
                          <span className="font-medium">Chunks:</span> {doc.chunk_count}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(doc.created_at)}
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <span className="font-medium">Embedding Config ID:</span> {doc.embedding_config_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(doc)
                          setEditForm({
                            document_name: doc.document_name,
                            is_enabled: doc.is_enabled
                          })
                          setShowEditModal(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDocumentEnable(doc.id, !doc.is_enabled)}
                      >
                        {doc.is_enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Document Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-document-name">Document Name</Label>
              <Input
                id="edit-document-name"
                value={editForm.document_name}
                onChange={(e) => setEditForm({ ...editForm, document_name: e.target.value })}
                placeholder="Enter document name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-enabled"
                checked={editForm.is_enabled}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_enabled: checked })}
              />
              <Label htmlFor="edit-enabled">Enable document</Label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateDocument}
              className="bg-green-800 hover:bg-green-900"
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
