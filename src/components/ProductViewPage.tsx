'use client'
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useLiff } from '@/app/contexts/LiffContext';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Check, 
  Minus, 
  Plus, 
  Tag,
  ImageIcon,
  AlertCircle,
  X,
  User,
  Play,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription } from '@/components/ui/alert';

// ประเภทสำหรับรูปภาพสินค้า
interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
}

// ประเภทสำหรับประเภทไฟล์มีเดีย
enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

// ประเภทสำหรับไฟล์มีเดียในรีวิว
interface ReviewMedia {
  id: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  altText?: string;
  sortOrder: number;
}

// ประเภทสำหรับรีวิว
interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  mediaFiles: ReviewMedia[];
  user: {
    displayName?: string;
    pictureUrl?: string;
  };
}

// ประเภทสำหรับหมวดหมู่
interface Category {
  id: string;
  name: string;
}

// ประเภทสำหรับสินค้า
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  weight?: number;
  isFeatured: boolean;
  category?: Category;
  images: ProductImage[];
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ประเภทสำหรับสินค้าที่เกี่ยวข้อง
interface RelatedProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  category?: Category;
  image?: string;
  averageRating: number;
  reviewCount: number;
}

// เพิ่ม interface สำหรับ notification
interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface ProductViewPageProps {
  productId: string;
}

export default function ProductViewPage({ productId }: ProductViewPageProps) {
  const router = useRouter();
  const { dbUser, isLoggedIn, isInitialized } = useLiff();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // เพิ่ม states สำหรับ modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ReviewMedia | null>(null);
  const [modalMediaList, setModalMediaList] = useState<ReviewMedia[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // ดึงข้อมูลสินค้าตาม ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
        
        // ดึงสินค้าที่เกี่ยวข้อง
        fetchRelatedProducts(productId);
        
      } catch (error) {
        console.error('Error fetching product:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError('Product not found');
          } else {
            setError(error.response?.data?.error || 'Failed to load product');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ดึงสินค้าที่เกี่ยวข้อง
  const fetchRelatedProducts = async (id: string) => {
    try {
      const response = await axios.get(`/api/products/${id}/related?limit=4`);
      setRelatedProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    }
  };

  // เพิ่มฟังก์ชันสำหรับแสดง notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    // ซ่อน notification หลังจาก 3 วินาที
    setTimeout(() => setNotification(null), 3000);
  };

  // เพิ่มสินค้าลงตะกร้า
  const addToCart = async () => {
    if (!product) {
      showNotification('error', 'ไม่พบข้อมูลสินค้า');
      return;
    }

    if (!dbUser) {
      if (isInitialized && !isLoggedIn) {
        showNotification('error', 'กรุณาล็อกอินก่อนเพิ่มสินค้าลงตะกร้า');
        return;
      }
      showNotification('error', 'ไม่พบข้อมูลผู้ใช้');
      return;
    }
    
    try {
      setAddingToCart(true);
      
      await axios.post('/api/cart', {
        productId: product.id,
        quantity: quantity,
        userId: dbUser.id
      });
      
      // แสดงข้อความสำเร็จ
      showNotification('success', `เพิ่ม ${quantity} ชิ้นของ ${product.name} ลงตะกร้าแล้ว`);
      
      // รีเซ็ตจำนวนกลับเป็น 1
      setQuantity(1);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (axios.isAxiosError(error)) {
        showNotification('error', error.response?.data?.error || 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
      } else {
        showNotification('error', 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // ปรับเปลี่ยนจำนวนสินค้า
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // กลับไปหน้าเมนู
  const goBackToMenu = () => {
    router.push('/home');
  };

  // ฟอร์แมตราคาเป็นรูปแบบสกุลเงิน
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  // ฟอร์แมตวันที่
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ฟอร์แมตขนาดไฟล์
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // ฟอร์แมตระยะเวลาวิดีโอ
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // แสดงดาว rating
  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // ฟังก์ชันสำหรับเปิด modal
  const openMediaModal = (media: ReviewMedia, mediaList: ReviewMedia[]) => {
    setSelectedMedia(media);
    setModalMediaList(mediaList);
    setCurrentMediaIndex(mediaList.findIndex(m => m.id === media.id));
    setIsModalOpen(true);
  };

  // ฟังก์ชันสำหรับปิด modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
    setModalMediaList([]);
    setCurrentMediaIndex(0);
  };

  // ฟังก์ชันสำหรับเปลี่ยน media ใน modal
  const navigateMedia = useCallback((direction: 'prev' | 'next') => {
    if (modalMediaList.length === 0) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentMediaIndex > 0 ? currentMediaIndex - 1 : modalMediaList.length - 1;
    } else {
      newIndex = currentMediaIndex < modalMediaList.length - 1 ? currentMediaIndex + 1 : 0;
    }
    
    setCurrentMediaIndex(newIndex);
    setSelectedMedia(modalMediaList[newIndex]);
  }, [currentMediaIndex, modalMediaList]);

  // ฟังก์ชันสำหรับจัดการการกด keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          navigateMedia('prev');
          break;
        case 'ArrowRight':
          navigateMedia('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, navigateMedia]);

  // แก้ไขฟังก์ชัน shareProduct
  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
        showNotification('success', 'แชร์สินค้าสำเร็จ');
      } catch (error) {
        console.log('Error sharing:', error);
        showNotification('error', 'ไม่สามารถแชร์สินค้าได้');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showNotification('success', 'คัดลอกลิงก์สินค้าแล้ว');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={goBackToMenu}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Skeleton className="h-10 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-20" />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-6">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Product not found.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={goBackToMenu}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  const mainImage = product.images[selectedImageIndex]?.imageUrl;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/products?category=${product.category.id}`}>
                    {product.category.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button variant="outline" className="mb-6" onClick={goBackToMenu}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square flex items-center justify-center relative">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon className="h-16 w-16 mb-2" />
                  <span>No image available</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || `${product.name} image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-2">
                  <Tag className="h-3 w-3 mr-1" /> {product.category.name}
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="secondary" className="mb-2 ml-2">
                  Featured
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.sku && (
                <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
              )}
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {renderStars(product.averageRating)}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </div>
                {product.comparePrice && product.comparePrice > product.price && (
                  <div className="text-xl text-gray-500 line-through">
                    {formatCurrency(product.comparePrice)}
                  </div>
                )}
              </div>
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="text-sm text-green-600 font-medium">
                  Save {formatCurrency(product.comparePrice - product.price)}
                </div>
              )}
            </div>
            
            <Separator />
            
            {product.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
            
            <Separator />
            
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Quantity</h3>
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="px-3 py-1 border-r border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1 font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="px-3 py-1 border-l border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Availability</h3>
                  <div className={`flex items-center ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        <span>In Stock ({product.stock} available)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Out of Stock</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {product.weight && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Weight: {product.weight}g</span>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={addToCart}
                  disabled={addingToCart || product.stock === 0 || !isLoggedIn}
                >
                  {addingToCart ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" /> 
                      {!isLoggedIn ? 'Login to Add to Cart' : 'Add to Cart'}
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareProduct}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-6 bg-white border rounded-md mt-2">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-line">
                {product.description || 'No detailed information available for this product.'} 
              </p>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Product Information</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Product ID: {product.id}</li>
                  {product.sku && <li>SKU: {product.sku}</li>}
                  {product.weight && <li>Weight: {product.weight}g</li>}
                  <li>Stock: {product.stock} units available</li>
                  <li>Category: {product.category?.name || 'Uncategorized'}</li>
                  <li>Added on: {formatDate(product.createdAt)}</li>
                  {product.updatedAt !== product.createdAt && (
                    <li>Last updated: {formatDate(product.updatedAt)}</li>
                  )}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="p-6 bg-white border rounded-md mt-2">
            <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Product Name</p>
                <p className="font-medium">{product.name}</p>
              </div>
              {product.sku && (
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-medium">{product.sku}</p>
                </div>
              )}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">{formatCurrency(product.price)}</p>
              </div>
              {product.weight && (
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{product.weight}g</p>
                </div>
              )}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{product.category?.name || 'Uncategorized'}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Stock Status</p>
                <p className="font-medium">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Featured Product</p>
                <p className="font-medium">{product.isFeatured ? 'Yes' : 'No'}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="font-medium">{product.averageRating.toFixed(1)}/5.0</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="p-6 bg-white border rounded-md mt-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Customer Reviews</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(product.averageRating)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.averageRating.toFixed(1)} out of 5 ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
            
            {product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {review.user.pictureUrl ? (
                          <Image
                            src={review.user.pictureUrl}
                            alt={review.user.displayName || 'User'}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">
                              {review.user.displayName || 'Anonymous User'}
                            </span>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        
                        {review.comment && (
                          <div className="mt-3">
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                          </div>
                        )}

                        {/* Review Media Files */}
                        {review.mediaFiles && review.mediaFiles.length > 0 && (
                          <div className="mt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {review.mediaFiles
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((media) => (
                                  <div
                                    key={media.id}
                                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer hover:shadow-md transition-shadow"
                                  >
                                    {media.mediaType === MediaType.IMAGE ? (
                                      <Image
                                        src={media.mediaUrl}
                                        alt={media.altText || 'Review image'}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                        onClick={() => openMediaModal(media, review.mediaFiles)}
                                      />
                                    ) : (
                                      <div 
                                        className="relative w-full h-full"
                                        onClick={() => openMediaModal(media, review.mediaFiles)}
                                      >
                                        {media.thumbnailUrl ? (
                                          <Image
                                            src={media.thumbnailUrl}
                                            alt={media.altText || 'Video thumbnail'}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <Play className="h-8 w-8 text-gray-400" />
                                          </div>
                                        )}
                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                                          <div className="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                                            <Play className="h-6 w-6 text-gray-800 ml-1" />
                                          </div>
                                        </div>
                                        {/* Duration Badge */}
                                        {media.duration && (
                                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                            {formatDuration(media.duration)}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* File Info Tooltip */}
                                    {(media.fileName || media.fileSize) && (
                                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded max-w-[120px] truncate">
                                          {media.fileName && (
                                            <div className="truncate">{media.fileName}</div>
                                          )}
                                          {media.fileSize && (
                                            <div>{formatFileSize(media.fileSize)}</div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">Be the first to review this product!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {relatedProduct.image ? (
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {renderStars(relatedProduct.averageRating)}
                      </div>
                      <span className="ml-1 text-xs text-gray-500">
                        ({relatedProduct.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-semibold">{formatCurrency(relatedProduct.price)}</span>
                        {relatedProduct.comparePrice && relatedProduct.comparePrice > relatedProduct.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(relatedProduct.comparePrice)}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/products/${relatedProduct.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for displaying review media */}
      {isModalOpen && selectedMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-t-lg">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedMedia.altText || (selectedMedia.mediaType === MediaType.IMAGE ? 'Review Image' : 'Review Video')}
                </h3>
                {modalMediaList.length > 1 && (
                  <div className="text-sm text-gray-600">
                    {currentMediaIndex + 1} of {modalMediaList.length}
                  </div>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Media Content */}
            <div className="flex-1 bg-black rounded-b-lg overflow-hidden relative flex items-center justify-center">
              {selectedMedia.mediaType === MediaType.IMAGE ? (
                <div className="relative w-full h-full max-w-full max-h-full">
                  <Image
                    src={selectedMedia.mediaUrl}
                    alt={selectedMedia.altText || 'Review image'}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <video
                  src={selectedMedia.mediaUrl}
                  controls
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                />
              )}

              {/* Navigation Arrows */}
              {modalMediaList.length > 1 && (
                <>
                  <button
                    onClick={() => navigateMedia('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                    aria-label="Previous media"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => navigateMedia('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                    aria-label="Next media"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Footer with media info */}
            {(selectedMedia.fileName || selectedMedia.fileSize || selectedMedia.duration) && (
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-b-lg">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    {selectedMedia.fileName && (
                      <span className="font-medium">{selectedMedia.fileName}</span>
                    )}
                    {selectedMedia.fileSize && (
                      <span>{formatFileSize(selectedMedia.fileSize)}</span>
                    )}
                    {selectedMedia.duration && selectedMedia.mediaType === MediaType.VIDEO && (
                      <span>{formatDuration(selectedMedia.duration)}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Press ESC to close • Use arrow keys to navigate
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail strip for multiple media */}
            {modalMediaList.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-lg p-2">
                <div className="flex gap-2 max-w-xs overflow-x-auto">
                  {modalMediaList.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => {
                        setCurrentMediaIndex(index);
                        setSelectedMedia(media);
                      }}
                      className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                        index === currentMediaIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {media.mediaType === MediaType.IMAGE ? (
                        <Image
                          src={media.mediaUrl}
                          alt={`Thumbnail ${index + 1}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          {media.thumbnailUrl ? (
                            <Image
                              src={media.thumbnailUrl}
                              alt={`Video thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Play className="h-4 w-4 text-white" />
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}