'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Model {
  id: number;
  name: string;
  provider_name: string;
  model_type: string;
  is_active: boolean;
  created_at: string;
}

interface LLMConfig {
  id: number;
  tenant_id: number;
  model_id: number;
  is_enabled: boolean;
  temperature: number;
  created_at: string;
  updated_at: string | null;
  model: Model;
  has_api_key: boolean;
  api_key_status: string;
}

interface EmbeddingConfig {
  id: number;
  tenant_id: number;
  model_id: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string | null;
  model: Model;
  has_api_key: boolean;
  api_key_status: string;
}

export default function ConfiguredModels() {
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [embeddingConfigs, setEmbeddingConfigs] = useState<EmbeddingConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeConfigType, setActiveConfigType] = useState<'llm' | 'embedding'>('llm');

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/tenant/${sessionStorage.getItem('tenantId')}/llm-configs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LLM configurations');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmbeddingConfigs = async () => {
    setEmbeddingLoading(true);
    setEmbeddingError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/tenant/${sessionStorage.getItem('tenantId')}/embedding-configs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmbeddingConfigs(data);
    } catch (err) {
      setEmbeddingError(err instanceof Error ? err.message : 'Failed to fetch embedding configurations');
    } finally {
      setEmbeddingLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchEmbeddingConfigs();
  }, []);

  const handleToggleModel = async (configId: number, newStatus: boolean) => {
    try {
      // Update local state immediately for better UX
      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, is_enabled: newStatus } : config
      ));

      // Make API call to update the backend
      const endpoint = newStatus ? 'enable' : 'disable';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/llm/${configId}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} LLM configuration`);
      }

      const updatedConfig = await response.json();
      
      // Update local state with the response from API
      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updatedConfig } : config
      ));

      // Show success toast
      toast.success(`LLM configuration ${endpoint}d successfully`);
      
      // Refetch data to ensure consistency
      await fetchConfigs();
      
    } catch (err) {
      // Revert local state on error
      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, is_enabled: !newStatus } : config
      ));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update LLM configuration';
      console.error('Failed to update LLM configuration:', err);
      toast.error(errorMessage);
    }
  };

  const handleToggleEmbedding = async (configId: number, newStatus: boolean) => {
    try {
      // Update local state immediately for better UX
      setEmbeddingConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, is_enabled: newStatus } : config
      ));

      // Make API call to update the backend
      const endpoint = newStatus ? 'enable' : 'disable';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai-config/embedding/${configId}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} embedding configuration`);
      }

      const updatedConfig = await response.json();
      
      // Update local state with the response from API
      setEmbeddingConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updatedConfig } : config
      ));

      // Show success toast
      toast.success(`Embedding configuration ${endpoint}d successfully`);
      
      // Refetch data to ensure consistency
      await fetchEmbeddingConfigs();
      
    } catch (err) {
      // Revert local state on error
      setEmbeddingConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, is_enabled: !newStatus } : config
      ));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update embedding configuration';
      console.error('Failed to update embedding configuration:', err);
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredConfigs = configs.filter(config => {
    if (activeTab === 'all') return true;
    if (activeTab === 'enabled') return config.is_enabled;
    if (activeTab === 'disabled') return !config.is_enabled;
    return true;
  });

  const filteredEmbeddingConfigs = embeddingConfigs.filter(config => {
    if (activeTab === 'all') return true;
    if (activeTab === 'enabled') return config.is_enabled;
    if (activeTab === 'disabled') return !config.is_enabled;
    return true;
  });

  const currentConfigs = activeConfigType === 'llm' ? filteredConfigs : filteredEmbeddingConfigs;
  const currentLoading = activeConfigType === 'llm' ? loading : embeddingLoading;
  const currentError = activeConfigType === 'llm' ? error : embeddingError;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configured Models</h2>
          <p className="text-muted-foreground">
            Manage your LLM and Embedding configurations and API keys
          </p>
        </div>
        <Button onClick={activeConfigType === 'llm' ? fetchConfigs : fetchEmbeddingConfigs} disabled={currentLoading}>
          {currentLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Configuration Type Toggle */}
      <div className="flex space-x-2">
        <Button
          variant={activeConfigType === 'llm' ? 'default' : 'outline'}
          onClick={() => setActiveConfigType('llm')}
          className="flex-1"
        >
          LLM Configurations
        </Button>
        <Button
          variant={activeConfigType === 'embedding' ? 'default' : 'outline'}
          onClick={() => setActiveConfigType('embedding')}
          className="flex-1"
        >
          Embedding Configurations
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All {activeConfigType === 'llm' ? 'Models' : 'Embeddings'}</TabsTrigger>
          <TabsTrigger value="enabled">Enabled</TabsTrigger>
          <TabsTrigger value="disabled">Disabled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">{activeConfigType === 'llm' ? 'Model' : 'Embedding'}</th>
                      <th className="text-left p-4 font-medium">Provider</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      {activeConfigType === 'llm' && (
                        <th className="text-left p-4 font-medium">Temperature</th>
                      )}
                      <th className="text-left p-4 font-medium">API Key Status</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentConfigs.map((config, index) => (
                      <tr key={config.id} className={`border-b ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                        <td className="p-4 font-medium">{config.model.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{config.model.provider_name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{config.model.model_type}</td>
                        {activeConfigType === 'llm' && (
                          <td className="p-4 text-sm">{(config as LLMConfig).temperature}</td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(config.api_key_status)}
                            <Badge className={getStatusColor(config.api_key_status)}>
                              {config.api_key_status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={config.is_enabled ? "default" : "secondary"}>
                            {config.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.is_enabled}
                              onCheckedChange={(checked) => 
                                activeConfigType === 'llm' 
                                  ? handleToggleModel(config.id, checked)
                                  : handleToggleEmbedding(config.id, checked)
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {config.is_enabled ? 'On' : 'Off'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enabled" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-green-50">
                      <th className="text-left p-4 font-medium">{activeConfigType === 'llm' ? 'Model' : 'Embedding'}</th>
                      <th className="text-left p-4 font-medium">Provider</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      {activeConfigType === 'llm' && (
                        <th className="text-left p-4 font-medium">Temperature</th>
                      )}
                      <th className="text-left p-4 font-medium">API Key Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentConfigs.map((config, index) => (
                      <tr key={config.id} className={`border-b ${index % 2 === 0 ? 'bg-green-50/30' : 'bg-green-50/60'}`}>
                        <td className="p-4 font-medium">{config.model.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{config.model.provider_name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{config.model.model_type}</td>
                        {activeConfigType === 'llm' && (
                          <td className="p-4 text-sm">{(config as LLMConfig).temperature}</td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(config.api_key_status)}
                            <Badge className={getStatusColor(config.api_key_status)}>
                              {config.api_key_status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.is_enabled}
                              onCheckedChange={(checked) => 
                                activeConfigType === 'llm' 
                                  ? handleToggleModel(config.id, checked)
                                  : handleToggleEmbedding(config.id, checked)
                              }
                            />
                            <span className="text-sm text-muted-foreground">On</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disabled" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 font-medium">{activeConfigType === 'llm' ? 'Model' : 'Embedding'}</th>
                      <th className="text-left p-4 font-medium">Provider</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      {activeConfigType === 'llm' && (
                        <th className="text-left p-4 font-medium">Temperature</th>
                      )}
                      <th className="text-left p-4 font-medium">API Key Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentConfigs.map((config, index) => (
                      <tr key={config.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-gray-50/60'}`}>
                        <td className="p-4 font-medium">{config.model.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{config.model.provider_name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{config.model.model_type}</td>
                        {activeConfigType === 'llm' && (
                          <td className="p-4 text-sm">{(config as LLMConfig).temperature}</td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(config.api_key_status)}
                            <Badge className={getStatusColor(config.api_key_status)}>
                              {config.api_key_status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.is_enabled}
                              onCheckedChange={(checked) => 
                                activeConfigType === 'llm' 
                                  ? handleToggleModel(config.id, checked)
                                  : handleToggleEmbedding(config.id, checked)
                              }
                            />
                            <span className="text-sm text-muted-foreground">Off</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {currentLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading {activeConfigType === 'llm' ? 'LLM' : 'embedding'} configurations...</span>
        </div>
      )}

      {currentError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>Error: {currentError}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={activeConfigType === 'llm' ? fetchConfigs : fetchEmbeddingConfigs}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!currentLoading && !currentError && currentConfigs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No {activeConfigType === 'llm' ? 'LLM' : 'embedding'} configurations found.</p>
              <p className="text-sm">Configure your first {activeConfigType === 'llm' ? 'model' : 'embedding'} to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
