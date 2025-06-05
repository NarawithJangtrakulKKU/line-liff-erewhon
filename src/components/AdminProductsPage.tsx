'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Upload, X, Package, Tag } from 'lucide-react'
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
  isActive: boolean
}

interface ProductImage {
  id: string
  imageUrl: string
  altText: string | null
  sortOrder: number
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  comparePrice: number | null
  sku: string | null
  stock: number
  weight: number | null
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  categoryId: string
  category: Category
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

interface ProductFormData {
  name: string
  description: string
  price: number
  comparePrice: number | null
  sku: string
  stock: number
  weight: number | null
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  categoryId: string
  images: string[]
}

// Product Form Component
const ProductForm = React.memo(({ 
  formData,
  setFormData,
  categories,
  onSubmit, 
  submitLabel, 
  mode = 'create',
  submitting,
  uploadingImage,
  imagePreview,
  onImageUpload,
  onRemoveImage,
}: { 
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  onSubmit: () => void;
  submitLabel: string;
  mode?: 'create' | 'edit';
  submitting: boolean;
  uploadingImage: boolean;
  imagePreview: string[];
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}) => {
  const idPrefix = mode;
  
  // Memoized handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, [setFormData]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, [setFormData]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, price: value }));
  }, [setFormData]);

  const handleComparePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value) || null;
    setFormData(prev => ({ ...prev, comparePrice: value }));
  }, [setFormData]);

  const handleSkuChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, sku: e.target.value }));
  }, [setFormData]);

  const handleStockChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, stock: value }));
  }, [setFormData]);

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value) || null;
    setFormData(prev => ({ ...prev, weight: value }));
  }, [setFormData]);

  const handleSortOrderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, sortOrder: value }));
  }, [setFormData]);

  const handleIsActiveChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  }, [setFormData]);

  const handleIsFeaturedChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, isFeatured: checked }));
  }, [setFormData]);

  const handleCategoryChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, categoryId: value }));
  }, [setFormData]);
  
  return (
    <div className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto">
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Product Name {mode === 'create' ? '*' : ''}</Label>
        <Input
          id={`${idPrefix}-name`}
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Enter product name"
          required={mode === 'create'}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Enter product description"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-price`}>Price (฿) {mode === 'create' ? '*' : ''}</Label>
          <Input
            id={`${idPrefix}-price`}
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handlePriceChange}
            placeholder="0.00"
            required={mode === 'create'}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-comparePrice`}>Compare Price (฿)</Label>
          <Input
            id={`${idPrefix}-comparePrice`}
            type="number"
            step="0.01"
            min="0"
            value={formData.comparePrice || ''}
            onChange={handleComparePriceChange}
            placeholder="0.00"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-sku`}>SKU</Label>
          <Input
            id={`${idPrefix}-sku`}
            value={formData.sku}
            onChange={handleSkuChange}
            placeholder="Product SKU"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-stock`}>Stock {mode === 'create' ? '*' : ''}</Label>
          <Input
            id={`${idPrefix}-stock`}
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleStockChange}
            placeholder="0"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-weight`}>Weight (g)</Label>
          <Input
            id={`${idPrefix}-weight`}
            type="number"
            step="0.01"
            min="0"
            value={formData.weight || ''}
            onChange={handleWeightChange}
            placeholder="0.00"
          />
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
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-category`}>Category {mode === 'create' ? '*' : ''}</Label>
        <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-images`}>Product Images</Label>
        
        {/* Image Preview */}
        {imagePreview.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imagePreview.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => onRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              multiple
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
              {uploadingImage ? 'Uploading...' : 'Upload Images'}
            </Label>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF. Max size: 5MB per image
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`${idPrefix}-isActive`}
            checked={formData.isActive}
            onCheckedChange={handleIsActiveChange}
          />
          <Label htmlFor={`${idPrefix}-isActive`}>Active</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id={`${idPrefix}-isFeatured`}
            checked={formData.isFeatured}
            onCheckedChange={handleIsFeaturedChange}
          />
          <Label htmlFor={`${idPrefix}-isFeatured`}>Featured</Label>
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={
            submitting || 
            uploadingImage || 
            !formData.name.trim() || 
            (mode === 'create' && !formData.categoryId)
          }
        >
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )
});

ProductForm.displayName = 'ProductForm';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    comparePrice: null,
    sku: '',
    stock: 0,
    weight: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    categoryId: '',
    images: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  
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

  // Fetch products and categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [productsResponse, categoriesResponse] = await Promise.all([
        axios.get('/api/admin/products'),
        axios.get('/api/admin/categories')
      ])
      
      setProducts(productsResponse.data.products || [])
      setCategories(categoriesResponse.data.categories?.filter((cat: Category) => cat.isActive) || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error) 
          ? error.response?.data?.message || "Failed to fetch data"
          : "An error occurred while fetching data"
      )
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter products - memoized
  const filteredProducts = React.useMemo(() => 
    products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || !selectedCategory || product.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }), [products, searchTerm, selectedCategory]
  )

  // Reset form - memoized
  const resetForm = useCallback(() => {
    // Revoke all object URLs to free memory
    imagePreview.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    
    setFormData({
      name: '',
      description: '',
      price: 0,
      comparePrice: null,
      sku: '',
      stock: 0,
      weight: null,
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      categoryId: '',
      images: []
    })
    setSelectedProduct(null)
    setImagePreview([])
    setImageFiles([])
  }, [imagePreview])

  // Handle create - memoized
  const handleCreate = useCallback(async () => {
    try {
      setSubmitting(true)
      
      // Create FormData instead of JSON
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price.toString())
      if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice.toString())
      formDataToSend.append('sku', formData.sku)
      formDataToSend.append('stock', formData.stock.toString())
      if (formData.weight) formDataToSend.append('weight', formData.weight.toString())
      formDataToSend.append('isActive', formData.isActive.toString())
      formDataToSend.append('isFeatured', formData.isFeatured.toString())
      formDataToSend.append('sortOrder', formData.sortOrder.toString())
      formDataToSend.append('categoryId', formData.categoryId)

      // Add image files (stored from previous uploads)
      for (let i = 0; i < imageFiles.length; i++) {
        formDataToSend.append(`images-${i}`, imageFiles[i])
      }
      
      const response = await axios.post('/api/admin/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setProducts(prev => [...prev, response.data.product])
      setIsCreateModalOpen(false)
      resetForm()
      showNotification('success', 'Success', 'Product created successfully')
    } catch (error) {
      console.error('Error creating product:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to create product"
          : "An error occurred while creating product"
      )
    } finally {
      setSubmitting(false)
    }
  }, [formData, imageFiles, resetForm, showNotification])

  // Handle edit - memoized
  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      sku: product.sku || '',
      stock: Number(product.stock),
      weight: product.weight ? Number(product.weight) : null,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      sortOrder: Number(product.sortOrder),
      categoryId: product.categoryId,
      images: product.images.map(img => img.imageUrl)
    })
    setImagePreview(product.images.map(img => img.imageUrl))
    setIsEditModalOpen(true)
  }, [])

  // Handle update - memoized
  const handleUpdate = useCallback(async () => {
    if (!selectedProduct) return

    try {
      setSubmitting(true)
      
      // Create FormData instead of JSON
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price.toString())
      if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice.toString())
      formDataToSend.append('sku', formData.sku)
      formDataToSend.append('stock', formData.stock.toString())
      if (formData.weight) formDataToSend.append('weight', formData.weight.toString())
      formDataToSend.append('isActive', formData.isActive.toString())
      formDataToSend.append('isFeatured', formData.isFeatured.toString())
      formDataToSend.append('sortOrder', formData.sortOrder.toString())
      formDataToSend.append('categoryId', formData.categoryId)

      // Add existing images that weren't removed
      const existingImages = selectedProduct.images
        .filter(img => imagePreview.includes(img.imageUrl))
        .map(img => img.imageUrl)
      
      // Add existing image URLs with proper indexing
      existingImages.forEach((imageUrl, index) => {
        formDataToSend.append(`existingImages-${index}`, imageUrl)
      })

      // Add new image files (stored from previous uploads)
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`images-${index}`, file)
      })
      
      const response = await axios.put(`/api/admin/products/${selectedProduct.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setProducts(prev => 
        prev.map(product => product.id === selectedProduct.id ? response.data.product : product)
      )
      setIsEditModalOpen(false)
      resetForm()
      showNotification('success', 'Success', 'Product updated successfully')
    } catch (error) {
      console.error('Error updating product:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to update product"
          : "An error occurred while updating product"
      )
    } finally {
      setSubmitting(false)
    }
  }, [selectedProduct, formData, imageFiles, imagePreview, resetForm, showNotification])

  // Handle image upload - memoized
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validate files
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Error', 'Please select valid image files only')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Error', 'Each image should be less than 5MB')
        return
      }
    }

    // Store files and create preview URLs
    const newFiles = Array.from(files)
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
    
    setImageFiles(prev => [...prev, ...newFiles])
    setImagePreview(prev => [...prev, ...newPreviewUrls])
    
    // Update form data with image URLs for display purposes
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...newPreviewUrls] 
    }))
  }, [showNotification])

  // Remove image - memoized
  const handleRemoveImage = useCallback(async (index: number) => {
    // Remove from preview and files
    setImagePreview(prev => {
      // Revoke object URL to free memory
      if (prev[index].startsWith('blob:')) {
        URL.revokeObjectURL(prev[index])
      }
      return prev.filter((_, i) => i !== index)
    })
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }, [])

  // Handle delete product - memoized
  const handleDelete = useCallback(async (productId: string) => {
    try {
      // Get the product to delete
      const productToDelete = products.find(product => product.id === productId)
      
      // Delete the product
      await axios.delete(`/api/admin/products/${productId}`)
      
      // If the product had images, delete them
      if (productToDelete?.images && productToDelete.images.length > 0) {
        try {
          const deletePromises = productToDelete.images.map(image =>
            axios.delete(`/api/admin/upload-image?imageUrl=${encodeURIComponent(image.imageUrl)}`)
          )
          await Promise.all(deletePromises)
        } catch (error) {
          console.error('Error deleting product images:', error)
          // Continue with product deletion even if image deletion fails
        }
      }
      
      setProducts(prev => prev.filter(product => product.id !== productId))
      showNotification('success', 'Success', 'Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      showNotification(
        'error',
        'Error',
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete product"
          : "An error occurred while deleting product"
      )
    }
  }, [products, showNotification])

  // Format price for display
  const formatPrice = (price: number) => `฿${price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-2">Manage your product inventory and details</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(product => product.isActive).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Featured Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {products.filter(product => product.isFeatured).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(product => product.stock < 10).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Product</DialogTitle>
                      <DialogDescription>
                        Add a new product to your inventory.
                      </DialogDescription>
                    </DialogHeader>
                    <ProductForm 
                      formData={formData}
                      setFormData={setFormData}
                      categories={categories}
                      onSubmit={handleCreate} 
                      submitLabel="Create Product" 
                      mode="create"
                      submitting={submitting}
                      uploadingImage={false}
                      imagePreview={imagePreview}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
              <CardDescription>
                Manage your product inventory and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-gray-400 text-lg mb-2">No products found</div>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || (selectedCategory && selectedCategory !== 'all') ? 'Try adjusting your search or filter terms' : 'Get started by creating your first product'}
                  </p>
                  {!searchTerm && (!selectedCategory || selectedCategory === 'all') && (
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Product
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
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {product.images.length > 0 ? (
                                <Image
                                  src={product.images[0].imageUrl}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">
                                  {product.sku ? `SKU: ${product.sku}` : 'No SKU'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Tag className="h-3 w-3" />
                              {product.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{formatPrice(product.price)}</div>
                              {product.comparePrice && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.comparePrice)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={product.stock < 10 ? "destructive" : product.stock < 50 ? "secondary" : "default"}
                            >
                              {product.stock} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={product.isActive ? "default" : "secondary"}>
                                {product.isActive ? (
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
                              {product.isFeatured && (
                                <Badge variant="outline" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(product.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
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
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                                    </AlertDialogDescription>
                                    {product.images.length > 0 && (
                                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                        <strong>Warning:</strong> This will also delete {product.images.length} associated image(s).
                                      </div>
                                    )}
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(product.id)}
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
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update the product information below.
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onSubmit={handleUpdate} 
                submitLabel="Update Product" 
                mode="edit"
                submitting={submitting}
                uploadingImage={false}
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