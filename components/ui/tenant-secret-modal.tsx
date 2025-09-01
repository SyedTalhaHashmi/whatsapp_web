"use client"

import { useState } from 'react'
import { Button } from './button'
import { Check, Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface TenantSecretModalProps {
  isOpen: boolean
  onClose: () => void
  tenantSecret: string
  tenantName: string
}

export function TenantSecretModal({ isOpen, onClose, tenantSecret, tenantName }: TenantSecretModalProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tenantSecret)
      setCopied(true)
      toast.success('Tenant secret copied to clipboard!')
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleClose = () => {
    onClose()
    // Redirect to sign-in page
    router.push('/auth/sign-in')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Tenant Created Successfully!</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-600">
            Your tenant <span className="font-medium text-gray-900">{tenantName}</span> has been created successfully.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant Secret Code
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-800 break-all">
                {tenantSecret}
              </code>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Save this tenant secret code securely. You&apos;ll need it to access your tenant.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close & Continue to Login
          </Button>
        </div>
      </div>
    </div>
  )
} 