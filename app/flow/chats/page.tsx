"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Loader2, MessageSquare, AlertCircle, UserPlus, UserMinus, Bot, User, BadgeCheck } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import axios from "axios"
import { toast } from "sonner"
import { getSessionStorageItem, setSessionStorageItem } from "@/lib/utils"

const mockChats = [
  {
    id: 1,
    name: "System",
    avatar: "F",
    status: "Un Active",
    messages: [
      { id: 1, text: "No messages yet", time: "12:23 PM", fromMe: false },
      
    ],
  },

 
  // Add more chats if needed
]

export default function ChatsPage() {
  const [selectedChatKey, setSelectedChatKey] = useState<string | number | null>(null)
  const [input, setInput] = useState("")
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationLoadingId, setConversationLoadingId] = useState<string | number | null>(null)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [conversationsById, setConversationsById] = useState<Record<string | number, any>>({})
  const [sending, setSending] = useState<boolean>(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Assignment controls
  const [agentIdInput, setAgentIdInput] = useState<string>("")
  const [aiEnabled, setAiEnabled] = useState<boolean>(false)

  // Filter states
  const [aiFilter, setAiFilter] = useState<string>("all") // "all", "enabled", "disabled"
  const [departmentFilter, setDepartmentFilter] = useState<string>("all") // "all" or department ID
  const [userRole, setUserRole] = useState<string>("")
  const [departments, setDepartments] = useState<any[]>([])
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchType, setSearchType] = useState<string>("all") // "all", "name", "number", "message"
  
  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [attachmentCaption, setAttachmentCaption] = useState<string>("")
  const [uploadingAttachment, setUploadingAttachment] = useState<boolean>(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

  // WS health and polling fallback
  const [wsOpenCount, setWsOpenCount] = useState<number>(0)
  const inboxWsUp = wsOpenCount > 0
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const messageIdsByConvRef = useRef<Record<string | number, Set<any>>>({})
  const [agentJoned, setAgentJoned] = useState<boolean>(false)
  const [currentJoinedConversationId, setCurrentJoinedConversationId] = useState<string | number | null>(null)
  
  // Connection state management
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true)
  const [isPageFocused, setIsPageFocused] = useState<boolean>(true)
  const [hasInitialized, setHasInitialized] = useState<boolean>(false)
  const wsConnectionsRef = useRef<{ dept: (() => void) | null; tenant: (() => void) | null; chat: (() => void) | null }>({
    dept: null,
    tenant: null,
    chat: null
  })
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxRetryDelay = 30000 // 30 seconds max retry delay
  
  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Page visibility and focus detection - only for this chats page
  useEffect(() => {
    const checkIfOnChatsPage = () => {
      return window.location.pathname.includes('/chats')
    }

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      const isOnChatsPage = checkIfOnChatsPage()
      
      setIsPageVisible(isVisible && isOnChatsPage)
      
      if (isVisible && isOnChatsPage) {
        // Page became visible and we're on chats page, restart connections if needed
        console.log('Chats page became visible, checking connections...')
        setHasInitialized(true)
      } else {
        // Page became hidden or user navigated away, cleanup connections
        console.log('Chats page became hidden or user navigated away, cleaning up connections...')
        cleanupWebSocketConnections()
      }
    }

    const handleFocus = () => {
      const isOnChatsPage = checkIfOnChatsPage()
      console.log('Page gained focus, on chats page:', isOnChatsPage)
      setIsPageFocused(document.hasFocus() && isOnChatsPage)
      if (isOnChatsPage) {
        setHasInitialized(true)
      }
    }

    const handleBlur = () => {
      console.log('Page lost focus')
      setIsPageFocused(false)
    }

    // Handle route changes (for SPA navigation)
    const handleRouteChange = () => {
      const isOnChatsPage = checkIfOnChatsPage()
      // console.log('Route changed, on chats page:', isOnChatsPage)
      
      if (!isOnChatsPage) {
        // User navigated away from chats page, cleanup connections
        // console.log('User navigated away away from chats page, cleaning up connections...')
        cleanupWebSocketConnections()
        setIsPageVisible(false)
        setIsPageFocused(false)
        setHasInitialized(false)
      } else {
        // User navigated to chats page, initialize if visible and focused
        const isVisible = !document.hidden
        const isFocused = document.hasFocus()
        setIsPageVisible(isVisible)
        setIsPageFocused(isFocused)
        setHasInitialized(isVisible && isFocused)
      }
    }

    // Check if we're on the chats page initially
    const isOnChatsPage = checkIfOnChatsPage()
    setIsPageVisible(!document.hidden && isOnChatsPage)
    setIsPageFocused(document.hasFocus() && isOnChatsPage)
    setHasInitialized(isOnChatsPage)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    
    // Listen for route changes (popstate for back/forward, and custom events for SPA navigation)
    window.addEventListener('popstate', handleRouteChange)
    
    // For Next.js router events (if using Next.js router)
    if (typeof window !== 'undefined' && window.history) {
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState
      
      window.history.pushState = function(...args) {
        originalPushState.apply(this, args)
        setTimeout(handleRouteChange, 0)
      }
      
      window.history.replaceState = function(...args) {
        originalReplaceState.apply(this, args)
        setTimeout(handleRouteChange, 0)
      }
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    // Only fetch data when page is focused, visible, and has been initialized
    if (!isPageFocused || !isPageVisible || !hasInitialized) return

    // Get user role and department info
    const role = getSessionStorageItem('userRole') || ''
    const deptId = getSessionStorageItem('departmentId') || ''
    setUserRole(role)
    
    // Set department filter based on user role
    if (role === 'admin' || role === 'manager') {
      setDepartmentFilter('all') // Admin/manager can see all departments
    } else {
      setDepartmentFilter(deptId) // Regular users only see their department
    }

    const fetchInbox = async () => {
      try {
        setLoading(true)
        setError(null)

        const tenantID = getSessionStorageItem('tenantID')
        const departmentID = getSessionStorageItem('departmentID')

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        if (!baseUrl) {
          throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
        }

        // console.log('Fetching inbox data...')
        const response = await axios.get(`${baseUrl}/inbox`, {
          params: {
            tenant_id: getSessionStorageItem('tenantId'),
            // department_id: getSessionStorageItem('departmentId'),
            limit: 50,
            offset: 0,
          },
        })

        const data = response?.data
        let items: any[] = []
        if (Array.isArray(data)) items = data
        else if (Array.isArray(data?.items)) items = data.items
        else if (Array.isArray(data?.data)) items = data.data
        else if (Array.isArray(data?.results)) items = data.results
        else items = []

        setChats(items)
        
        // Extract unique departments for filter dropdown
        const uniqueDepartments = Array.from(new Set(items.map(item => item.department?.id))).filter(Boolean)
        const deptData = uniqueDepartments.map(deptId => {
          const item = items.find(item => item.department?.id === deptId)
          return {
            id: deptId,
            name: item?.department?.name || 'Unknown',
            department_number: item?.department?.department_number || ''
          }
        })
        setDepartments(deptData)
        // console.log('Inbox data fetched successfully')
      } catch (err: any) {
        // console.error('Failed to fetch inbox:', err)
        setError(err?.message || 'Failed to fetch inbox')
      } finally {
        setLoading(false)
      }
    }

    fetchInbox()
  }, [isPageFocused, isPageVisible, hasInitialized])

  const uiChats = useMemo(() => {
    const source = chats.length ? chats : mockChats
    
    // Apply filters
    let filteredChats = source
    
    // Filter by AI enabled/disabled
    if (aiFilter !== 'all') {
      filteredChats = filteredChats.filter((chat: any) => {
        if (aiFilter === 'enabled') return chat.is_ai_enabled === true
        if (aiFilter === 'disabled') return chat.is_ai_enabled === false
        return true
      })
    }
    
    // Filter by department (only for admin/manager)
    if (departmentFilter !== 'all' && (userRole === 'admin' || userRole === 'manager')) {
      filteredChats = filteredChats.filter((chat: any) => 
        chat.department?.id?.toString() === departmentFilter.toString()
      )
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filteredChats = filteredChats.filter((chat: any) => {
        const name = (chat?.user_name ?? chat?.name ?? chat?.customer_name ?? chat?.sender ?? '').toLowerCase()
        const phone = (chat?.patient_whatsapp_number ?? chat?.phone_number ?? '').toLowerCase()
        const message = (chat?.message ?? '').toLowerCase()
        
        switch (searchType) {
          case 'name':
            return name.includes(query)
          case 'number':
            return phone.includes(query)
          case 'message':
            return message.includes(query)
          case 'all':
          default:
            return name.includes(query) || phone.includes(query) || message.includes(query)
        }
      })
    }
    
    return filteredChats.map((chat: any, idx: number) => {
      const id = chat?.conversation_id ?? chat?.id ?? `idx-${idx}`
      const name = chat?.user_name ?? chat?.name ?? chat?.customer_name ?? chat?.sender ?? chat?.patient_whatsapp_number ?? `Chat ${idx + 1}`
      const avatar = (String(name)?.[0] || 'C').toUpperCase()
      const status = chat?.patient_whatsapp_number || "Live Session"
      const unreadCount = chat?.unread_count ?? 0
      const lastMessage = chat?.message ?? '' 
      const timestamp = chat?.timestamp ?? chat?.updated_at ?? chat?.created_at
      const phone = chat?.patient_whatsapp_number ?? chat?.phone_number ?? ''
      const departmentName = chat?.department?.name ?? ''
      const isAiEnabled = chat?.is_ai_enabled ?? false
      return { key: id, id, name, avatar, status, unreadCount, lastMessage, timestamp, phone, departmentName, isAiEnabled, _raw: chat }
    })
  }, [chats, aiFilter, departmentFilter, userRole, searchQuery, searchType])

  useEffect(() => {
    if (selectedChatKey == null && uiChats.length) {
      setSelectedChatKey(uiChats[0].key)
    }
  }, [uiChats, selectedChatKey])

  const selectedChat = useMemo(() => uiChats.find((c) => c.key === selectedChatKey), [uiChats, selectedChatKey])
  const selectedChatId = useMemo(() => selectedChat?.id, [selectedChat])
  const selectedConversation = useMemo(() => {
    if (!selectedChat) return null
    return conversationsById[selectedChat.id] ?? null
  }, [conversationsById, selectedChat])

  // Auto-scroll to bottom when conversation changes or new messages arrive
  useEffect(() => {
    if (selectedConversation?.messages) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [selectedConversation?.messages, selectedChatKey])

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="Search contacts..."]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const formatTime = (ts?: string) => {
    if (!ts) return ''
    try {
      const d = new Date(ts)
      return d.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return ''
    }
  }

  const truncate = (text: string, length = 36) => {
    if (!text) return ''
    return text.length > length ? `${text.slice(0, length)}…` : text
  }

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim() || !text) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  // File handling utilities
  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('spreadsheet')) return 'document'
    return 'document'
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      case 'document': return '📄'
      default: return '📎'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    const maxSize = 16 * 1024 * 1024 // 16MB
    if (file.size > maxSize) {
      return 'File size must be less than 16MB'
    }
    
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'video/mp4', 'video/avi', 'video/mov',
      'video/quicktime',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv', 'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload images, documents, videos, or audio files.'
    }
    
    return null
  }

  const reorder = (list: any[]) => {
    return [...list].sort((a, b) => {
      const at = a?.timestamp ? new Date(a.timestamp).getTime() : 0
      const bt = b?.timestamp ? new Date(b.timestamp).getTime() : 0
      return bt - at
    })
  }

  // Cleanup function for WebSocket connections
  const cleanupWebSocketConnections = () => {
    if (wsConnectionsRef.current.dept) {
      wsConnectionsRef.current.dept()
      wsConnectionsRef.current.dept = null
    }
    if (wsConnectionsRef.current.tenant) {
      wsConnectionsRef.current.tenant()
      wsConnectionsRef.current.tenant = null
    }
    if (wsConnectionsRef.current.chat) {
      wsConnectionsRef.current.chat()
      wsConnectionsRef.current.chat = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    setWsOpenCount(0)
  }

  const openWS = (
    url: string,
    { onMessage, onOpen, onClose }: { onMessage?: (evt: MessageEvent) => void; onOpen?: () => void; onClose?: () => void } = {}
  ) => {
    let ws: WebSocket
    let heartbeat: ReturnType<typeof setInterval> | undefined
    let retryMs = 1000
    let isConnecting = false
    
    const connect = () => {
      // Don't connect if page is not visible, focused, already connecting, or not on chats page
      const isOnChatsPage = window.location.pathname.includes('/chats')
      if (!isPageVisible || !isPageFocused || isConnecting || !isOnChatsPage) {
        // console.log('WebSocket connection skipped:', { isPageVisible, isPageFocused, isConnecting, isOnChatsPage })
        return
      }
      
      isConnecting = true
      // console.log('Attempting WebSocket connection to:', url)
      
      try {
        ws = new WebSocket(url)
        
        ws.onopen = () => {
          // console.log('WebSocket connected to:', url)
          isConnecting = false
          heartbeat = setInterval(() => {
            try { 
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' })) 
              }
            } catch (e) {
              console.warn('Failed to send ping:', e)
            }
          }, 20000)
          retryMs = 1000
          onOpen && onOpen()
        }
        
        ws.onmessage = (evt) => onMessage && onMessage(evt)
        
        ws.onclose = () => {
          // console.log('WebSocket closed:', url)
          isConnecting = false
          if (heartbeat) clearInterval(heartbeat)
          onClose && onClose()
          
          // Only retry if page is visible, focused, not manually closed, and still on chats page
          const isOnChatsPage = window.location.pathname.includes('/chats')
          if (isPageVisible && isPageFocused && isOnChatsPage && retryMs < maxRetryDelay) {
            retryTimeoutRef.current = setTimeout(() => {
              const stillOnChatsPage = window.location.pathname.includes('/chats')
              if (isPageVisible && isPageFocused && stillOnChatsPage) {
                connect()
              }
            }, retryMs)
            retryMs = Math.min(retryMs * 2, maxRetryDelay)
          }
        }
        
        ws.onerror = (error) => {
          // console.error('WebSocket error:', url, error)
          isConnecting = false
          try { ws.close() } catch {}
        }
      } catch (error) {
        // console.error('Failed to create WebSocket:', error)
        isConnecting = false
      }
    }
    
    connect()
    
    return () => { 
      try { 
        if (heartbeat) clearInterval(heartbeat)
        if (ws) ws.close()
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }
      } catch (e) {
        // console.warn('Error closing WebSocket:', e)
      }
    }
  }

  const parseSessionNumber = (key: string): number | null => {
    const raw = getSessionStorageItem(key)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      const num = Number(parsed)
      return Number.isFinite(num) ? num : null
    } catch {
      const num = Number(raw)
      return Number.isFinite(num) ? num : null
    }
  }

  const fetchConversation = useCallback(async (conversationId: string | number) => {
    // Only fetch if page is focused, visible, and on chats page
    const isOnChatsPage = window.location.pathname.includes('/chats')
    if (!isPageFocused || !isPageVisible || !isOnChatsPage) return
    
    try {
      setConversationError(null)
      setConversationLoadingId(conversationId)
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
      
      // console.log('Fetching conversation data for ID:', conversationId)
      const response = await axios.get(`${baseUrl}/conversations/${conversationId}`, {
        
      })
              const data = response?.data
        console.log('data', data)
        
        // Store AI status per conversation
        if (data?.conversation?.is_ai_enabled !== undefined) {
          const key = `aiEnabled:${conversationId}`
          setSessionStorageItem(key, JSON.stringify(data.conversation.is_ai_enabled))
          
          // Update local state if this is the currently selected conversation
          if (selectedChatId === conversationId) {
            setAiEnabled(data.conversation.is_ai_enabled)
          }
        }
        
        const messagesSource = Array.isArray(data) ? data : (Array.isArray(data?.messages) ? data.messages : [])

      const normalizedMessages = messagesSource.map((m: any, idx: number) => {
        const text = m?.content ?? m?.text ?? m?.message ?? m?.body ?? ''
        const time = m?.created_at ?? m?.timestamp ?? m?.time ?? m?.updated_at
        const type = m?.message_type ?? m?.type
        const senderTypeRaw = m?.sender_type ?? (m?.sender === 'agent' ? 'agent' : 'patient')
        const role = senderTypeRaw === 'bot' ? 'bot' : (senderTypeRaw === 'agent' || senderTypeRaw === 'admin' ? 'agent' : 'patient')
        const isOutbound = role === 'agent' || role === 'bot'
        return {
          id: m?.id ?? idx,
          text,
          time: formatTime(time),
          fromMe: Boolean(isOutbound),
          role,
          type,
          attachments: Array.isArray(m?.attachments) ? m.attachments : [],
        }
      })

      // seed seen message ids to avoid WS duplicates
      const seen = messageIdsByConvRef.current[conversationId] || new Set()
      for (const m of messagesSource) {
        if (m?.id != null) seen.add(m.id)
      }
      messageIdsByConvRef.current[conversationId] = seen
      setConversationsById(prev => ({ ...prev, [conversationId]: { messages: normalizedMessages, meta: data?.conversation ?? null, _raw: data } }))
    } catch (err: any) {
      // console.error('Failed to fetch conversation:', err)
      setConversationError(err?.message || 'Failed to fetch conversation')
    } finally {
      setConversationLoadingId(null)
    }
  }, [selectedChatId, isPageFocused, isPageVisible])

  useEffect(() => {
    if (selectedChatId != null) {
      fetchConversation(selectedChatId)
    }
  }, [selectedChatId, fetchConversation])

  // Load/save AI toggle per conversation (UI-only for now)
  useEffect(() => {
    if (selectedChatId == null) return
    const key = `aiEnabled:${selectedChatId}`
    const stored = getSessionStorageItem(key)
    setAiEnabled(stored === 'true')
  }, [selectedChatId])

  const handleToggleAi = async (value: boolean) => {
    if (selectedChatId == null) return
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')
      
              await axios.put(`${baseUrl}/conversations/${selectedChatId}/ai-toggle`, {
          is_ai_enabled: value
        }, {
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420' 
        }
      })
      
      // Update local state and session storage after successful API call
      setAiEnabled(value)
      const key = `aiEnabled:${selectedChatId}`
      setSessionStorageItem(key, String(value))
      
      // Add system message to show AI status change
      const sysMsg = {
        id: `ai-toggle-${Date.now()}`,
        text: `AI ${value ? 'enabled' : 'disabled'} for this conversation`,
        time: formatTime(new Date().toISOString()),
        fromMe: false,
        role: 'system',
        type: 'text',
        attachments: []
      }
      
      setConversationsById(prev => {
        const existing = prev[selectedChatId]?.messages ?? []
        return { 
          ...prev, 
          [selectedChatId]: { 
            ...(prev[selectedChatId] || {}), 
            messages: [...existing, sysMsg] 
          } 
        }
      })
      
    } catch (err: any) {
      console.error('Failed to toggle AI:', err)
      // Revert the switch if API call fails
      setAiEnabled(!value)
      alert(err?.message || 'Failed to toggle AI status')
    }
  }

  // Inbox WS (dept + tenant) for realtime list updates
  useEffect(() => {
    // Only connect if page is visible and focused
    if (!isPageVisible || !isPageFocused) return
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) return
    
    const wsBase = baseUrl.replace(/^http/, 'ws').replace(/\/+$/, '')
    const deptParams = new URLSearchParams({
      tenant_id: getSessionStorageItem('tenantId') || '',
      department_id: getSessionStorageItem('departmentId') || '',
      'ngrok-skip-browser-warning': 'true'
    })
    const tenantParams = new URLSearchParams({
      tenant_id: getSessionStorageItem('tenantId') || '',
      'ngrok-skip-browser-warning': 'true'
    })

    const onOpen = () => {
      console.log('Inbox WebSocket opened')
      setWsOpenCount(n => n + 1)
    }
    const onClose = () => {
      console.log('Inbox WebSocket closed')
      setWsOpenCount(n => Math.max(0, n - 1))
    }

    const applyInboxUpdate = ({ conversation_id, last_message, timestamp, unread_count }: any) => {
      let applied = false
      setChats(prev => {
        const list = [...prev]
        const idx = list.findIndex((c: any) => (c.conversation_id ?? c.id) === conversation_id)
        if (idx === -1) return prev
        const existing: any = list[idx]
        const existingTs = existing.timestamp ? new Date(existing.timestamp).getTime() : 0
        const incomingTs = timestamp ? new Date(timestamp).getTime() : 0
        if (incomingTs >= existingTs) {
          list[idx] = {
            ...existing,
            message: last_message ?? existing.message,
            timestamp: timestamp ?? existing.timestamp,
            unread_count: typeof unread_count === 'number' ? unread_count : existing.unread_count,
          }
          applied = true
        }
        return reorder(list)
      })
      return applied
    }

    const handleInboxWs = async (evt: MessageEvent) => {
      const msg = JSON.parse(evt.data || '{}')
      if (msg.type === 'conversation_created') {
        // refetch inbox
        try {
          const response = await axios.get(`${baseUrl}/inbox`, {
            params: { tenant_id: getSessionStorageItem('tenantId'), department_id: getSessionStorageItem('departmentId'), limit: 50, offset: 0 },
            
          })
          const data = response?.data
          let items: any[] = []
          if (Array.isArray(data)) items = data
          else if (Array.isArray(data?.items)) items = data.items
          else if (Array.isArray(data?.data)) items = data.data
          else if (Array.isArray(data?.results)) items = data.results
          setChats(reorder(items))
        } catch {}
        return
      }
      if (msg.type === 'inbox_updated') {
        const ok = applyInboxUpdate({
          conversation_id: msg.conversation_id,
          last_message: msg.last_message,
          timestamp: msg.timestamp,
          unread_count: msg.unread_count,
        })
        if (!ok) {
          try {
            const response = await axios.get(`${baseUrl}/inbox`, {
              params: { tenant_id: getSessionStorageItem('tenantId'), department_id: getSessionStorageItem('departmentId'), limit: 50, offset: 0 },
              
            })
            const data = response?.data
            let items: any[] = []
            if (Array.isArray(data)) items = data
            else if (Array.isArray(data?.items)) items = data.items
            else if (Array.isArray(data?.data)) items = data.data
            else if (Array.isArray(data?.results)) items = data.results
            setChats(reorder(items))
          } catch {}
        }
        return
      }
      if (msg.type === 'inbox_assignment') {
        setChats(prev => {
          const list = [...prev]
          const idx = list.findIndex((c: any) => (c.conversation_id ?? c.id) === msg.conversation_id)
          if (idx >= 0) {
            list[idx] = { ...list[idx], assigned_agent: msg.assigned_agent || null }
          }
          return list
        })
        return
      }
    }

    const stopDept = openWS(`${wsBase}/inbox/ws?${deptParams.toString()}`, { onMessage: handleInboxWs, onOpen, onClose })
    const stopTenant = openWS(`${wsBase}/inbox/ws?${tenantParams.toString()}`, { onMessage: handleInboxWs, onOpen, onClose })
    
    // Store cleanup functions
    wsConnectionsRef.current.dept = stopDept
    wsConnectionsRef.current.tenant = stopTenant
    
    return () => { 
      stopDept(); 
      stopTenant()
      wsConnectionsRef.current.dept = null
      wsConnectionsRef.current.tenant = null
    }
  }, [isPageVisible, isPageFocused])

  // Polling fallback when inbox WS is down
  useEffect(() => {
    function start() {
      const isOnChatsPage = window.location.pathname.includes('/chats')
      if (inboxWsUp || !isPageVisible || !isPageFocused || !isOnChatsPage) return
      stop()
      pollRef.current = setInterval(async () => {
        // Only poll if page is visible, focused, and still on chats page
        const stillOnChatsPage = window.location.pathname.includes('/chats')
        if (!isPageVisible || !isPageFocused || !stillOnChatsPage) return
        
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
          if (!baseUrl) return
          const response = await axios.get(`${baseUrl}/inbox`, {
            params: { tenant_id: getSessionStorageItem('tenantId'), department_id: getSessionStorageItem('departmentId'), limit: 50, offset: 0 },
            
          })
          const data = response?.data
          let items: any[] = []
          if (Array.isArray(data)) items = data
          else if (Array.isArray(data?.items)) items = data.items
          else if (Array.isArray(data?.data)) items = data.data
          else if (Array.isArray(data?.results)) items = data.results
          setChats(reorder(items))
        } catch {}
      }, 5000)
    }
    function stop() {
      if (pollRef.current) { clearInterval(pollRef.current as any); pollRef.current = null }
    }
    start()
    return stop
  }, [inboxWsUp, isPageVisible, isPageFocused])

  // Load AI status from session storage when conversation changes
  useEffect(() => {
    if (selectedChatId) {
      const key = `aiEnabled:${selectedChatId}`
      const stored = getSessionStorageItem(key)
      if (stored !== null) {
        setAiEnabled(JSON.parse(stored))
      } else {
        // Default to false if no stored value
        setAiEnabled(false)
      }
    }
  }, [selectedChatId])

  // Chat WS for selected conversation
  useEffect(() => {
    if (selectedChatId == null || !isPageVisible || !isPageFocused) return
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) return
    const wsBase = baseUrl.replace(/^http/, 'ws').replace(/\/+$/, '')
    const stop = openWS(`${wsBase}/chat/${selectedChatId}/ws`, {
      onMessage: (evt) => {
        const msg = JSON.parse(evt.data || '{}')
        if (msg.type === 'message') {
          const realId = msg.message_id
          if (realId != null) {
            const seen = messageIdsByConvRef.current[selectedChatId] || new Set()
            if (seen.has(realId)) return
            seen.add(realId)
            messageIdsByConvRef.current[selectedChatId] = seen
          }
          const role = msg.sender_type === 'bot' ? 'bot' : ((msg.sender_type === 'agent' || msg.sender_type === 'admin') ? 'agent' : 'patient')
          const isOutbound = role === 'agent' || role === 'bot'
          const newMsg = {
            id: msg.message_id,
            text: msg.content,
            time: formatTime(msg.timestamp),
            fromMe: Boolean(isOutbound),
            role,
            type: 'text',
            attachments: [],
          }
          setConversationsById(prev => {
            const existing = prev[selectedChatId]?.messages ?? []
            return { ...prev, [selectedChatId]: { ...(prev[selectedChatId] || {}), messages: [...existing, newMsg] } }
          })
          // Auto-scroll to bottom when new message arrives
          setTimeout(() => scrollToBottom(), 100)
        }
        if (msg.type === 'agent_joined' || msg.type === 'agent_left') {
          const sysText = msg.type === 'agent_joined' ? `Agent ${msg.user_id} joined` : `Agent ${msg.user_id} left`
          const sysMsg = { id: `sys-${Date.now()}`, text: sysText, time: formatTime(msg.timestamp), fromMe: true, role: 'system', type: 'text', attachments: [] }
          setConversationsById(prev => {
            const existing = prev[selectedChatId]?.messages ?? []
            return { ...prev, [selectedChatId]: { ...(prev[selectedChatId] || {}), messages: [...existing, sysMsg] } }
          })
          
          // Auto-scroll to bottom after system message
          setTimeout(() => scrollToBottom(), 100)
          fetchConversation(selectedChatId)
        }
        if (msg.type === 'conversation_assigned' || msg.type === 'conversation_unassigned') {
          const sysText = msg.type === 'conversation_assigned' ? `Conversation assigned to ${msg.agent_name || msg.agent_id}` : 'Conversation unassigned'
          const sysMsg = { id: `sys2-${Date.now()}`, text: sysText, time: formatTime(msg.timestamp), fromMe: true, role: 'system', type: 'text', attachments: [] }
          setConversationsById(prev => {
            const existing = prev[selectedChatId]?.messages ?? []
            return { ...prev, [selectedChatId]: { ...(prev[selectedChatId] || {}), messages: [...existing, sysMsg] } }
          })
          
          // Auto-scroll to bottom after system message
          setTimeout(() => scrollToBottom(), 100)
          fetchConversation(selectedChatId)
        }
      }
    })
    // Load initial conversation details
    fetchConversation(selectedChatId)
    
    // Store cleanup function
    wsConnectionsRef.current.chat = stop
    
    return () => { 
      stop()
      wsConnectionsRef.current.chat = null
    }
  }, [selectedChatId, fetchConversation, isPageVisible, isPageFocused])

  // Cleanup effect to leave conversation when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      // If we're currently in a conversation, leave it when unmounting
      if (currentJoinedConversationId) {
        autoLeaveConversation(currentJoinedConversationId)
      }
    }
  }, [currentJoinedConversationId])

  // Cleanup all WebSocket connections when component unmounts
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up all connections...')
      cleanupWebSocketConnections()
    }
  }, [])

  const sendMessage = async () => {
    if (!selectedChat || !input.trim()) return
    try {
      setSendError(null)
      setSending(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')

      const tenantId = parseSessionNumber('tenantID')
      const departmentId = parseSessionNumber('departmentID')
      const userId = parseSessionNumber('userID')
      // if (!tenantId || !departmentId || !userId) {
      //   throw new Error('Missing tenant/department/user identifiers in session')
      // }

      // Optimistic update with dedupe key
      const tempId = `temp-${Date.now()}`
      const optimisticMessage = {
        id: tempId,
        text: input,
        time: formatTime(new Date().toISOString()),
        fromMe: true,
        role: 'agent',
        type: 'text',
        attachments: [],
      }
      setConversationsById(prev => {
        const existing = prev[selectedChat.id]?.messages ?? []
        return { ...prev, [selectedChat.id]: { ...(prev[selectedChat.id] || {}), messages: [...existing, optimisticMessage] } }
      })
      
      // Auto-scroll to bottom after adding optimistic message
      setTimeout(() => scrollToBottom(), 50)

      await axios.post(`${baseUrl}/chat/send-message`, {
        conversation_id: selectedChat.id,
        // conversation_id: 5,
        // department_id:   departmentId,
        department_id: getSessionStorageItem('departmentId'),
        sender_type: 'agent',
        sender_user_id: getSessionStorageItem('userID'),
        tenant_id: getSessionStorageItem('tenantId'),
        text: input,
      }, { headers: { 'ngrok-skip-browser-warning': '69420' } })

      setInput("")
      // Let WS event add the real message; optionally refresh after slight delay to reconcile
      setTimeout(() => fetchConversation(selectedChat.id), 400)
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setSendError(err?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setAttachmentError(validationError)
        toast.error(validationError)
        return
      }
      setSelectedFile(file)
      setAttachmentError(null)
    }
  }

  const clearAttachment = () => {
    setSelectedFile(null)
    setAttachmentCaption('')
    setAttachmentError(null)
  }

  const sendAttachment = async () => {
    if (!selectedChat || !selectedFile) return
    
    try {
      setAttachmentError(null)
      setUploadingAttachment(true)
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')

      // Validate file
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setAttachmentError(validationError)
        return
      }

      // Create FormData
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('conversation_id', selectedChat.id.toString())
      formData.append('tenant_id', getSessionStorageItem('tenantId') || '')
      formData.append('department_id', getSessionStorageItem('departmentId') || '')
      formData.append('caption', attachmentCaption)
      formData.append('sender_user_id', getSessionStorageItem('userID') || '')
      formData.append('sender_type', 'agent')

      // Optimistic update
      const tempId = `temp-${Date.now()}`
      const fileType = getFileType(selectedFile)
      const optimisticMessage = {
        id: tempId,
        text: attachmentCaption || `Sent ${getFileIcon(fileType)} ${selectedFile.name}`,
        time: formatTime(new Date().toISOString()),
        fromMe: true,
        role: 'agent',
        type: fileType,
        attachments: [{
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          icon: getFileIcon(fileType)
        }],
      }

      setConversationsById(prev => {
        const existing = prev[selectedChat.id]?.messages ?? []
        return { ...prev, [selectedChat.id]: { ...(prev[selectedChat.id] || {}), messages: [...existing, optimisticMessage] } }
      })

      // Auto-scroll to bottom
      setTimeout(() => scrollToBottom(), 50)

      // Send attachment
      await axios.post(`${baseUrl}/chat/send-attachment`, formData, {
        headers: { 
          'ngrok-skip-browser-warning': '69420',
          'Content-Type': 'multipart/form-data'
        }
      })

      // Clear attachment state
      setSelectedFile(null)
      setAttachmentCaption('')
      
      // Refresh conversation to get real message
      setTimeout(() => fetchConversation(selectedChat.id), 400)
      
      toast.success('Attachment sent successfully!')
    } catch (err: any) {
      console.error('Failed to send attachment:', err)
      setAttachmentError(err?.message || 'Failed to send attachment')
      toast.error('Failed to send attachment')
    } finally {
      setUploadingAttachment(false)
    }
  }

  // Function to automatically join a conversation
  const autoJoinConversation = async (conversationId: string | number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')

      await axios.post(`${baseUrl}/conversations/${conversationId}/join`, {
        // tenant_id: getSessionStorageItem('tenantId'),
        // department_id: getSessionStorageItem('departmentId'),
        agent_id: getSessionStorageItem('userID'),
        // user_role: getSessionStorageItem('userRole')
      }, { 
        headers: { 'ngrok-skip-browser-warning': '69420' } 
      })

      setCurrentJoinedConversationId(conversationId)
      setAgentJoned(true)
      toast.success(`Joined conversation`)
    } catch (err: any) {
      console.error('Failed to join conversation:', err)
      toast.error('Failed to join conversation')
    }
  }

  // Function to automatically leave a conversation
  const autoLeaveConversation = async (conversationId: string | number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL')

      await axios.post(`${baseUrl}/conversations/${conversationId}/leave`, {
        // tenant_id: getSessionStorageItem('tenantId'),
        // department_id: getSessionStorageItem('departmentId'),
        agent_id: getSessionStorageItem('userID'),
        // user_role: getSessionStorageItem('userRole')
      }, { 
        headers: { 'ngrok-skip-browser-warning': '69420' } 
      })

      setCurrentJoinedConversationId(null)
      setAgentJoned(false)
      toast.success(`Left conversation`)
    } catch (err: any) {
      console.error('Failed to leave conversation:', err)
      toast.error('Failed to leave conversation')
    }
  }

  // Function to handle conversation switching with auto join/leave
  const handleConversationSwitch = async (newConversationId: string | number) => {
    // If we're currently in a conversation, leave it first
    if (currentJoinedConversationId && currentJoinedConversationId !== newConversationId) {
      await autoLeaveConversation(currentJoinedConversationId)
    }

    // Set the new conversation as selected
    setSelectedChatKey(newConversationId)
    
    // Join the new conversation
    await autoJoinConversation(newConversationId)
    
    // Fetch conversation data if not already loaded
    if (!conversationsById[newConversationId]) {
      fetchConversation(newConversationId)
    }
  }

  // Responsive: if mobile and a chat is selected, hide sidebar
  // We'll use a simple CSS approach for this demo

  return (
    <div className="flex h-screen bg-[#fafbfc]">
      {/* Sidebar */}
      <aside
        className={`
          w-80 overflow-y-auto max-w-full border-r bg-white flex-shrink-0 flex flex-col
          sticky top-0 left-0 h-screen z-20
          transition-transform duration-300
          md:translate-x-0
          ${selectedChatKey && typeof window !== 'undefined' && window.innerWidth < 768 ? '-translate-x-full absolute' : ''}
        `}
      >
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">Chats</h2>
          
          {/* Search Bar */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-md pl-8 pr-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-2.5 top-2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 w-3 h-3 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
          </div>
            
            {/* Search Type Selector */}
            <div className="mt-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Search All</option>
                <option value="name">Name Only</option>
                <option value="number">Phone Number</option>
                <option value="message">Message Content</option>
              </select>
        </div>
            
            {/* Search Results Counter */}
            {searchQuery && (
              <div className="mt-2 text-xs text-gray-500">
                Found {uiChats.length} result{uiChats.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
          
          {/* AI Filter */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">AI Status</label>
            <select
              value={aiFilter}
              onChange={(e) => setAiFilter(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Conversations</option>
              <option value="enabled">AI Enabled</option>
              <option value="disabled">AI Disabled</option>
            </select>
          </div>

          {/* Department Filter - Only for Admin/Manager */}
          {(getSessionStorageItem('userRole') === 'Admin' || getSessionStorageItem('userRole') === 'Manager') && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Summary and Clear Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {uiChats.length} conversation{uiChats.length !== 1 ? 's' : ''} 
              {searchQuery && ` • &quot;${searchQuery}&quot;`}
              {aiFilter !== 'all' && ` • AI ${aiFilter}`}
              {departmentFilter !== 'all' && departments.find(d => d.id.toString() === departmentFilter.toString()) && 
                ` • ${departments.find(d => d.id.toString() === departmentFilter.toString())?.name}`
              }
            </div>
            <div className="flex items-center gap-2">
              {(aiFilter !== 'all' || departmentFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setAiFilter('all')
                    setDepartmentFilter('all')
                    setSearchQuery('')
                    setSearchType('all')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-gray-600 hover:text-gray-800"
                title="Refresh conversations"
              >
                ↻
              </button>
            </div>
          </div>
        </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-all duration-200">
          {uiChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 p-4">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <div className="text-sm font-medium">No conversations found</div>
              <div className="text-xs text-gray-400 text-center">
                {aiFilter !== 'all' || departmentFilter !== 'all' 
                  ? 'Try adjusting your filters or clear them to see all conversations.'
                  : 'No conversations available at the moment.'
                }
              </div>
            </div>
          ) : (
            uiChats.map((chat) => (
            <button
              key={chat.key}
              onClick={() => handleConversationSwitch(chat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors ${selectedChatKey === chat.key ? 'bg-gray-100' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-xl">
                {chat.avatar}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm truncate max-w-[12rem]">
                      {searchQuery ? highlightText(chat.name, searchQuery) : chat.name}
                    </div>
                  <div className="text-[10px] text-gray-400">{formatTime(chat.timestamp)}</div>
                </div>
                {chat.phone && (
                    <div className="text-[10px] text-gray-600 truncate max-w-[14rem] flex items-center gap-1">
                      <svg className="w-2.5 h-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-blue-600 font-medium">
                        {searchQuery ? highlightText(chat.phone, searchQuery) : chat.phone}
                      </span>
                    </div>
                  )}
                <div className="text-[11px] text-gray-500 truncate max-w-[14rem]">
                    {searchQuery ? highlightText(truncate(chat.lastMessage || ''), searchQuery) : truncate(chat.lastMessage || '')}
                </div>
                 
                <div className="flex items-center gap-2 mr-[-5px]">
                    {/* AI Status Indicator */}
                    
                    
                    {/* Department Badge */}
                  {chat.departmentName ? (
                      <span className="text-[10px] bg-gray-800 text-white rounded-full px-2 py-[2px]">
                        {chat.departmentName}
</span>
                  ) : null}
                    
                    {/* Unread Count */}
                  {chat.unreadCount > 0 ? (
                    <span className="ml-auto text-[10px] bg-green-500 text-white rounded-full px-2 py-[2px]">
                      {chat.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Chat header */}
        {selectedChat && (
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-white sticky top-0 z-10">
            <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-xl">
              {selectedChat.avatar}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base">{selectedChat.name}</div>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {selectedChat.phone || selectedChat.status}
                </span>
               
              </div>
            </div>
            {/* Header controls: Join/Leave + AI toggle */}
            <div className="flex items-center gap-2">
              
              {/* <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100">
                <span className={`w-2 h-2 rounded-full ${currentJoinedConversationId === selectedChat.id ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-xs text-gray-600">
                  {currentJoinedConversationId === selectedChat.id ? 'Joined' : 'Not Joined'}
                </span>
              </div> */}
              
              <div className="flex items-center gap-2 pl-2 ml-2 border-l">
                <Bot className={`h-4 w-4 ${aiEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-xs text-gray-600">AI</span>
                <Switch checked={aiEnabled} onCheckedChange={handleToggleAi} />
              </div>
              
              {/* Scroll to bottom button */}
              <button
                onClick={scrollToBottom}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Scroll to bottom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {(selectedConversation?.messages ?? []).map((msg: any) => (
            <div
              key={msg.id}
              className={`${msg.role === 'system' ? 'w-full flex justify-center' : `max-w-xs md:max-w-md lg:max-w-lg ${msg.fromMe ? 'ml-auto' : ''}`}`}
            >
              <div
                className={`rounded-xl px-5 py-3 shadow-sm text-base relative ${
                  msg.role === 'system'
                    ? 'bg-gray-100 text-gray-600 text-center border border-gray-200 max-w-md'
                    : msg.role === 'agent'
                      ? 'bg-green-400 text-white text-right'
                      : msg.role === 'bot'
                        ? 'bg-blue-50 text-blue-900 text-left border border-blue-200'
                      : 'bg-white text-gray-900 text-left border'
                }`}
              >
                {/* Message Content */}
                <div className="whitespace-pre-wrap break-words">
                  {msg.text || ''}
                </div>
                
                {/* Attachments Display */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-2xl">{attachment.icon || getFileIcon(getFileType({ type: attachment.type } as File))}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {attachment.name || 'Unknown file'}
                          </div>
                          {attachment.size && (
                            <div className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </div>
                  )}
                </div>
                        <button
                          onClick={() => {
                            // Handle attachment download/view
                            if (attachment.url) {
                              window.open(attachment.url, '_blank')
                            } else {
                              toast.info('Attachment preview not available')
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View attachment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`flex items-center gap-2 text-xs mt-2 ${msg.role === 'agent' ? 'text-green-100 justify-end' : msg.role === 'bot' ? 'text-blue-500' : msg.role === 'system' ? 'text-gray-500 justify-center' : 'text-gray-400'}`}>
                  {msg.role === 'patient' && <User className="h-3.5 w-3.5" />}
                  {msg.role === 'agent' && <BadgeCheck className="h-3.5 w-3.5" />}
                  {msg.role === 'bot' && <Bot className="h-3.5 w-3.5" />}
                  {msg.role === 'system' && <BadgeCheck className="h-3.5 w-3.5" />}
                  <span className="capitalize">{msg.role}</span>
                  <span className="opacity-70">•</span>
                  <span>{msg.time}</span>
                </div>
              </div>
            </div>
          ))}
          {/* {!loading && !error && selectedChat && (!selectedConversation?.messages || selectedConversation.messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-600">
              <MessageSquare className="h-16 w-16 mb-4" />
              <div className="text-lg font-semibold">No messages yet</div>
              <div className="text-sm text-gray-500 mt-1">Start the conversation by sending a message.</div>
            </div>
          )}
          {loading && !selectedChat && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-600">
              <Loader2 className="h-16 w-16 mb-4 animate-spin" />
              <div className="text-lg font-semibold">Loading chats…</div>
              <div className="text-sm text-gray-500 mt-1">Fetching your latest conversations.</div>
            </div>
          )}
          {conversationLoadingId && selectedChat && conversationLoadingId === selectedChat.id && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-600">
              <Loader2 className="h-16 w-16 mb-4 animate-spin" />
              <div className="text-lg font-semibold">Loading conversation…</div>
              <div className="text-sm text-gray-500 mt-1">Please wait while we sync messages.</div>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
              <AlertCircle className="h-16 w-16 mb-4" />
              <div className="text-lg font-semibold">Something went wrong</div>
              <div className="text-sm opacity-90 mt-1">{error}</div>
            </div>
          )} */}
          {conversationError && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-green-500">
              <AlertCircle className="h-16 w-16 mb-4" />
              <div className="text-lg font-semibold">Select a conversation</div>
              <div className="text-sm opacity-90 mt-1">select a conversation from the list</div>
            </div>
          )}
        </div>

        {/* Chat input (fixed at bottom) */}
        {selectedChat && (
          <div className="w-full bg-white border-t sticky bottom-0 z-20">
            {/* Attachment Preview */}
            {selectedFile && (
              <div className="p-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{getFileIcon(getFileType(selectedFile))}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</div>
                    </div>
                  </div>
                  <button
                    onClick={clearAttachment}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Remove attachment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Caption Input */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Add a caption (optional)..."
                    value={attachmentCaption}
                    onChange={(e) => setAttachmentCaption(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Error Display */}
                {attachmentError && (
                  <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {attachmentError}
                  </div>
                )}
              </div>
            )}

            {/* Message Input Form */}
          <form
              className="w-full flex gap-2 p-4"
            onSubmit={e => {
              e.preventDefault()
                if (selectedFile) {
                  sendAttachment()
                } else {
              sendMessage()
                }
              }}
            >
              {/* Attachment Button */}
              <label className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer transition-colors">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 2 0 00-2.828-2.828z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>

              {/* Text Input */}
            <input
              type="text"
              className="flex-1 rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                value={selectedFile ? attachmentCaption : input}
                onChange={e => selectedFile ? setAttachmentCaption(e.target.value) : setInput(e.target.value)}
                disabled={!!selectedFile && !attachmentCaption.trim()}
              />

              {/* Send Button */}
            <button
              type="submit"
                disabled={
                  !!sending || 
                  !!uploadingAttachment || 
                  (selectedFile ? !attachmentCaption.trim() : !input.trim())
                }
                aria-busy={!!(sending || uploadingAttachment)}
                className={`bg-green-400 text-white font-semibold px-6 py-2 rounded-full transition-colors ${
                  (!!sending || !!uploadingAttachment || (selectedFile ? !attachmentCaption.trim() : !input.trim())) 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:bg-green-500'
                }`}
              >
                {sending || uploadingAttachment ? 'Sending…' : 'Send'}
            </button>
            </form>

            {/* Error Display */}
            {sendError && !selectedFile ? (
              <div className="px-4 pb-3 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{sendError}</span>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Responsive overlay for mobile: show chat only */}
      <style jsx global>{`
        @media (max-width: 767px) {
          aside {
            position: fixed !important;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 30;
            width: 80vw !important;
            max-width: 320px;
            background: #fff;
            transition: transform 0.3s;
          }
          main {
            width: 100vw !important;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  )
}
