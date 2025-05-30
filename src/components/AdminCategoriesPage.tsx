'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Upload, X } from 'lucide-react'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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


interface Category {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

interface CategoryFormData {
  name: string
  description: string
  imageUrl: string
  isActive: boolean
  sortOrder: number
}

// Separate CategoryForm component outside of the main component
const CategoryForm = React.memo(({ 
  formData,
  setFormData,
  onSubmit, 
  submitLabel, 
  mode = 'create',
  submitting,
  uploadingImage,
  imagePreview,
  onImageUpload,
  onRemoveImage
}: { 
  formData: CategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  onSubmit: () => void;
  submitLabel: string;
  mode?: 'create' | 'edit';
  submitting: boolean;
  uploadingImage: boolean;
  imagePreview: string | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}) => {
  const idPrefix = mode;
  
  // Memoized handlers to prevent re-creation on every render
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, [setFormData]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, [setFormData]);

  const handleSortOrderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, sortOrder: value }));
  }, [setFormData]);

  const handleIsActiveChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  }, [setFormData]);
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Category Name *</Label>
        <Input
          id={`${idPrefix}-name`}
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Enter category name"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Enter category description"
          rows={3}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-image`}>Category Image</Label>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative inline-block">
            <Image
              src={imagePreview}
              alt="Category preview"
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={onRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Upload Button */}
        {!imagePreview && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
                id={`${idPrefix}-image-upload`}
                disabled={uploadingImage}
              />
              <Label
                htmlFor={`${idPrefix}-image-upload`}
                className={`flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-4 w-4" />
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </Label>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF. Max size: 5MB
        </p>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-sortOrder`}>Sort Order</Label>
        <Input
          id={`${idPrefix}-sortOrder`}
          type="number"
          value={formData.sortOrder}
          onChange={handleSortOrderChange}
          placeholder="0"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id={`${idPrefix}-isActive`}
          checked={formData.isActive}
          onCheckedChange={handleIsActiveChange}
        />
        <Label htmlFor={`${idPrefix}-isActive`}>Active</Label>
      </div>

      <DialogFooter className="mt-4">
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={submitting || uploadingImage || !formData.name.trim()}
        >
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )
});

CategoryForm.displayName = 'CategoryForm';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
    sortOrder: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
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

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error) 
          ? error.response?.data?.message || "Failed to fetch categories"
          : "An error occurred while fetching categories"
      )
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Filter categories based on search term - memoized
  const filteredCategories = React.useMemo(() => 
    categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [categories, searchTerm]
  )

  // Reset form - memoized
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      isActive: true,
      sortOrder: 0
    })
    setSelectedCategory(null)
    setImagePreview(null)
  }, [])

  // Handle create - memoized
  const handleCreate = useCallback(async () => {
    try {
      setSubmitting(true)
      const response = await axios.post('/api/admin/categories', formData)
      
      setCategories(prev => [...prev, response.data.category])
      setIsCreateModalOpen(false)
      resetForm()
      showNotification('success', 'Success', 'Category created successfully')
    } catch (error) {
      console.error('Error creating category:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to create category"
          : "An error occurred while creating category"
      )
    } finally {
      setSubmitting(false)
    }
  }, [formData, resetForm, showNotification])

  // Handle edit - memoized
  const handleEdit = useCallback((category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    })
    setImagePreview(category.imageUrl)
    setIsEditModalOpen(true)
  }, [])

  // Handle update - memoized
  const handleUpdate = useCallback(async () => {
    if (!selectedCategory) return

    try {
      setSubmitting(true)
      const response = await axios.put(`/api/admin/categories/${selectedCategory.id}`, formData)
      
      setCategories(prev => 
        prev.map(cat => cat.id === selectedCategory.id ? response.data.category : cat)
      )
      setIsEditModalOpen(false)
      resetForm()
      showNotification('success', 'Success', 'Category updated successfully')
    } catch (error) {
      console.error('Error updating category:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to update category"
          : "An error occurred while updating category"
      )
    } finally {
      setSubmitting(false)
    }
  }, [selectedCategory, formData, resetForm, showNotification])

  // Handle image upload - memoized
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Error', 'Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Error', 'Image size should be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)
      
      const response = await axios.post('/api/admin/upload-image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const imageUrl = response.data.imageUrl
      setFormData(prev => ({ ...prev, imageUrl }))
      setImagePreview(imageUrl)
      
    } catch (error) {
      console.error('Error uploading image:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to upload image"
          : "An error occurred while uploading image"
      )
    } finally {
      setUploadingImage(false)
    }
  }, [showNotification])

  // Remove image - memoized
  const handleRemoveImage = useCallback(async () => {
    if (!formData.imageUrl) return

    try {
      // Delete the image file from the server
      await axios.delete(`/api/admin/upload-image?imageUrl=${encodeURIComponent(formData.imageUrl)}`)
      
      // Update form state
      setFormData(prev => ({ ...prev, imageUrl: '' }))
      setImagePreview(null)
    } catch (error) {
      console.error('Error removing image:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to remove image"
          : "An error occurred while removing image"
      )
    }
  }, [formData.imageUrl, showNotification])

  // Handle delete category - memoized
  const handleDelete = useCallback(async (categoryId: string) => {
    try {
      // Get the category to delete
      const categoryToDelete = categories.find(cat => cat.id === categoryId)
      
      // Delete the category
      await axios.delete(`/api/admin/categories/${categoryId}`)
      
      // If the category had an image, delete it
      if (categoryToDelete?.imageUrl) {
        try {
          await axios.delete(`/api/admin/upload-image?imageUrl=${encodeURIComponent(categoryToDelete.imageUrl)}`)
        } catch (error) {
          console.error('Error deleting category image:', error)
          // Continue with category deletion even if image deletion fails
        }
      }
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      showNotification('success', 'Success', 'Category deleted successfully')
    } catch (error) {
      console.error('Error deleting category:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete category"
          : "An error occurred while deleting category"
      )
    }
  }, [categories, showNotification])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600 mt-2">Manage product categories for your store</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {categories.filter(cat => cat.isActive).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Inactive Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {categories.filter(cat => !cat.isActive).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>
                        Add a new product category to organize your inventory.
                      </DialogDescription>
                    </DialogHeader>
                    <CategoryForm 
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleCreate} 
                      submitLabel="Create Category" 
                      mode="create"
                      submitting={submitting}
                      uploadingImage={uploadingImage}
                      imagePreview={imagePreview}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Categories ({filteredCategories.length})</CardTitle>
              <CardDescription>
                Manage and organize your product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No categories found</div>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
                  </p>
                  {!searchTerm && (
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Category
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sort Order</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {category.imageUrl && (
                                <Image
                                  src={category.imageUrl}
                                  alt={category.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-gray-500">{category.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {category.description ? (
                                <p className="text-sm text-gray-600 truncate">
                                  {category.description}
                                </p>
                              ) : (
                                <span className="text-gray-400 text-sm">No description</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{category.sortOrder}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {category._count?.products || 0} products
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(category.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(category)}
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
                                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                                      {category._count?.products && category._count.products > 0 && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                          <strong>Warning:</strong> This category has {category._count.products} product(s) associated with it.
                                        </div>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(category.id)}
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
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the category information below.
                </DialogDescription>
              </DialogHeader>
              <CategoryForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdate} 
                submitLabel="Update Category" 
                mode="edit"
                submitting={submitting}
                uploadingImage={uploadingImage}
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
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