'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Edit, Trash2, Search, User, Crown } from 'lucide-react'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: string
  lineUserId: string
  displayName: string | null
  pictureUrl: string | null
  email: string | null
  phone: string | null
  role: 'CUSTOMER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    orders: number
    cartItems: number
    reviews: number
  }
}

interface UserFormData {
  role: 'CUSTOMER' | 'ADMIN'
}

// Role selector component
const UserRoleForm = React.memo(({ 
  formData,
  setFormData,
  onSubmit, 
  submitting
}: { 
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onSubmit: () => void;
  submitting: boolean;
}) => {
  const handleRoleChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, role: value as 'CUSTOMER' | 'ADMIN' }));
  }, [setFormData]);
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="user-role">User Role *</Label>
        <Select value={formData.role} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select user role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUSTOMER">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </div>
            </SelectItem>
            <SelectItem value="ADMIN">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Admin
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Customers can shop and place orders. Admins have full access to the management system.
        </p>
      </div>

      <DialogFooter className="mt-4">
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Updating...' : 'Update Role'}
        </Button>
      </DialogFooter>
    </div>
  )
});

UserRoleForm.displayName = 'UserRoleForm';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    role: 'CUSTOMER'
  })
  const [submitting, setSubmitting] = useState(false)
  
  // Notification modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success')

  // Memoized notification function
  const showNotification = useCallback((type: 'success' | 'error', title: string, message: string) => {
    setNotificationType(type)
    setNotificationTitle(title)
    setNotificationMessage(message)
    setShowNotificationModal(true)
  }, [])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error) 
          ? error.response?.data?.message || "Failed to fetch users"
          : "An error occurred while fetching users"
      )
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users based on search term - memoized
  const filteredUsers = React.useMemo(() => 
    users.filter(user =>
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.lineUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm))
    ), [users, searchTerm]
  )

  // Handle edit - memoized
  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user)
    setFormData({
      role: user.role
    })
    setIsEditModalOpen(true)
  }, [])

  // Handle update - memoized
  const handleUpdate = useCallback(async () => {
    if (!selectedUser) return

    try {
      setSubmitting(true)
      const response = await axios.put(`/api/admin/users/${selectedUser.id}`, formData)
      
      setUsers(prev => 
        prev.map(user => user.id === selectedUser.id ? response.data.user : user)
      )
      setIsEditModalOpen(false)
      setSelectedUser(null)
      showNotification('success', 'Success', 'User role updated successfully')
    } catch (error) {
      console.error('Error updating user:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to update user"
          : "An error occurred while updating user"
      )
    } finally {
      setSubmitting(false)
    }
  }, [selectedUser, formData, showNotification])

  // Handle delete user - memoized
  const handleDelete = useCallback(async (userId: string) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      setUsers(prev => prev.filter(user => user.id !== userId))
      showNotification('success', 'Success', 'User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete user"
          : "An error occurred while deleting user"
      )
    }
  }, [showNotification])

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4" />
      case 'CUSTOMER':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Get role color
  const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'CUSTOMER':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(user => user.isActive).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter(user => user.role === 'CUSTOMER').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter(user => user.role === 'ADMIN').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, LINE ID, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Manage user accounts and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No users found</div>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'No users have registered yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {user.pictureUrl ? (
                                <Image
                                  src={user.pictureUrl}
                                  alt={user.displayName || 'User'}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">
                                  {user.displayName || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-500 font-mono">
                                  {user.lineUserId.slice(0, 20)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {user.email && (
                                <div className="text-sm text-gray-600">{user.email}</div>
                              )}
                              {user.phone && (
                                <div className="text-sm text-gray-600">{user.phone}</div>
                              )}
                              {!user.email && !user.phone && (
                                <span className="text-gray-400 text-sm">No contact info</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleVariant(user.role)}>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {user.role}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600">
                                Orders: {user._count?.orders || 0}
                              </div>
                              <div className="text-sm text-gray-600">
                                Reviews: {user._count?.reviews || 0}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete user &quot;{user.displayName || user.lineUserId}&quot;? This action cannot be undone.
                                      {user._count && (user._count.orders > 0 || user._count.reviews > 0) && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                          <strong>Warning:</strong> This user has {user._count.orders} order(s) and {user._count.reviews} review(s) associated with their account.
                                        </div>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogDescription>
                  Update the role for user: {selectedUser?.displayName || selectedUser?.lineUserId}
                </DialogDescription>
              </DialogHeader>
              <UserRoleForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdate} 
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>

          {/* Notification Modal */}
          <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className={`flex items-center gap-2 ${
                  notificationType === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {notificationType === 'success' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {notificationTitle}
                </DialogTitle>
                <DialogDescription>
                  {notificationMessage}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  onClick={() => setShowNotificationModal(false)}
                  className={
                    notificationType === 'success' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}