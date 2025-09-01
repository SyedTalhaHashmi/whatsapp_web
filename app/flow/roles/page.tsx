'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Building2, 
  UserCheck, 
  Settings, 
  MessageSquare, 
  Tag, 
  ClipboardList, 
  Ticket,
  Database,
  Shield,
  HeadphonesIcon,
  Bot
} from 'lucide-react'

interface RoleCard {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

const RolesPage = () => {
  const [userRole, setUserRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user role from session storage
    const role = sessionStorage.getItem('userRole')
    if (role) {
      setUserRole(role)
    }
    setIsLoading(false)
  }, [])

  // Define role-specific cards
  const getRoleCards = (role: string): RoleCard[] => {
    switch (role) {
      case 'Admin':
        return [
          {
            title: 'Manage Managers',
            description: 'Create, update, and remove managers from the system',
            icon: <Shield className="h-8 w-8" />,
            href: '/flow/roles/manager',
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            title: 'Manage Department Heads',
            description: 'Oversee department head assignments and permissions',
            icon: <Building2 className="h-8 w-8" />,
            href: '/flow/roles/department-head',
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            title: 'Manage Agents',
            description: 'Control agent access and permissions across departments',
            icon: <Users className="h-8 w-8" />,
            href: '/flow/roles/agent',
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            title: 'Manage Teams',
            description: 'Organize and structure team hierarchies',
            icon: <UserCheck className="h-8 w-8" />,
            href: '/flow/roles/team',
            color: 'bg-orange-500 hover:bg-orange-600'
          }
        ]

      case 'Manager':
        return [
          {
            title: 'Manage Department Heads',
            description: 'Oversee department head assignments and permissions',
            icon: <Building2 className="h-8 w-8" />,
            href: '/flow/roles/department-head',
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            title: 'Manage Agents',
            description: 'Control agent access and permissions across departments',
            icon: <Users className="h-8 w-8" />,
            href: '/flow/roles/agent',
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            title: 'Manage Teams',
            description: 'Organize and structure team hierarchies',
            icon: <UserCheck className="h-8 w-8" />,
            href: '/flow/roles/team',
            color: 'bg-orange-500 hover:bg-orange-600'
          },
          
        ]

      case 'Department Head':
        return [
          {
            title: 'Add Agents',
            description: 'Add new agents to your department',
            icon: <Users className="h-8 w-8" />,
            href: '/flow/roles/agent',
            color: 'bg-purple-500 hover:bg-purple-600'
          },
         
        ]

      case 'Agent':
        return [
          {
            title: 'Respond to Chats',
            description: 'Handle customer conversations and inquiries',
            icon: <MessageSquare className="h-8 w-8" />,
            href: '/flow/chats',
            color: 'bg-blue-500 hover:bg-blue-600'
          },
         
        ]

      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const roleCards = getRoleCards(userRole)

  if (roleCards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page or your role is not defined.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userRole || 'Not set'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Management</h1>
        <p className="text-gray-600">
          Welcome, {userRole}. Here are your available management options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleCards.map((card, index) => (
          <Link key={index} href={card.href} className="block">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-0">
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full ${card.color} flex items-center justify-center text-white mb-4`}>
                  {card.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

     
    </div>
  )
}

export default RolesPage
