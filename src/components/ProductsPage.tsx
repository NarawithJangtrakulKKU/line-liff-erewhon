'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

// ประเภทตาม Prisma schema
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  weight?: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [initialPriceRange, setInitialPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');

  // ดึงข้อมูลสินค้าและหมวดหมู่
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ดึงข้อมูลหมวดหมู่
        const categoriesResponse = await axios.get('/api/categories');
        const categoriesData = categoriesResponse.data.categories || [];
        setCategories(categoriesData);

        // ดึงข้อมูลสินค้า
        const productsResponse = await axios.get('/api/products');
        const productsData = productsResponse.data.products || [];
        
        // กรองเฉพาะสินค้าที่ active และมี stock
        const activeProducts = productsData.filter((product: Product) => 
          product.isActive && product.stock > 0
        );
        
        setProducts(activeProducts);

        // กำหนดช่วงราคาตามข้อมูลสินค้าจริง
        if (activeProducts.length > 0) {
          const prices = activeProducts.map((product: Product) => product.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
          setInitialPriceRange([minPrice, maxPrice]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันสำหรับกรองและเรียงลำดับสินค้า
  const getFilteredProducts = () => {
    return products
      .filter(product => {
        // กรองตามคำค้นหา
        const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.category && product.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // กรองตามหมวดหมู่
        const matchesCategory = selectedCategory === 'all' || 
          product.categoryId === selectedCategory;
        
        // กรองตามช่วงราคา
        const matchesPrice = 
          product.price >= priceRange[0] && product.price <= priceRange[1];
        
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        // เรียงลำดับตามตัวเลือกที่เลือก
        switch (sortOption) {
          case 'price-low-high':
            return a.price - b.price;
          case 'price-high-low':
            return b.price - a.price;
          case 'name-a-z':
            return a.name.localeCompare(b.name);
          case 'name-z-a':
            return b.name.localeCompare(a.name);
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'featured':
            // แสดงสินค้า featured ก่อน แล้วเรียงตาม sortOrder
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return a.sortOrder - b.sortOrder;
          default:
            return a.sortOrder - b.sortOrder;
        }
      });
  };

  // รีเซ็ตตัวกรอง
  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange(initialPriceRange);
    setSortOption('featured');
    setSearchTerm('');
  };

  // ฟอร์แมตราคาเป็นรูปแบบสกุลเงินไทย
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  // รายการสินค้าที่กรองแล้ว
  const filteredProducts = getFilteredProducts();

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า
  const handleAddToCart = async (productId: string) => {
    try {
      await axios.post('/api/cart', {
        productId,
        quantity: 1
      });
      // TODO: แสดง notification หรือ update cart count
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      // TODO: แสดง error notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <Link href="/home" className="text-2xl font-bold text-gray-900"></Link>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 md:w-80">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/3 mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search and filters */}
      <header className="py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <Link href="/home" className="text-2xl font-bold text-gray-900"></Link>
          
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort options */}
            <div className="hidden md:block">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="name-a-z">Name: A to Z</SelectItem>
                  <SelectItem value="name-z-a">Name: Z to A</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mobile filters */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters & Sort</SheetTitle>
                    <SheetDescription>
                      Filter and sort the products to find what you&apos;re looking for.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Sort By</h3>
                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                          <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                          <SelectItem value="name-a-z">Name: A to Z</SelectItem>
                          <SelectItem value="name-z-a">Name: Z to A</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Categories</h3>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="all-categories" 
                            checked={selectedCategory === 'all'} 
                            onCheckedChange={() => setSelectedCategory('all')}
                          />
                          <label htmlFor="all-categories" className="text-sm">All Categories</label>
                        </div>
                        {categories.filter(cat => cat.isActive).map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category.id}`} 
                              checked={selectedCategory === category.id} 
                              onCheckedChange={() => setSelectedCategory(category.id)}
                            />
                            <label htmlFor={`category-${category.id}`} className="text-sm">{category.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Price Range</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={priceRange}
                          min={initialPriceRange[0]}
                          max={initialPriceRange[1]}
                          step={1}
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{formatCurrency(priceRange[0])}</span>
                        <span className="text-sm">{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>
                  
                  <SheetFooter className="flex justify-between sm:justify-between">
                    <SheetClose asChild>
                      <Button variant="outline" onClick={resetFilters}>Reset</Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop filters sidebar */}
          <div className="hidden md:block w-64 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <Button 
                  variant={selectedCategory === 'all' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </Button>
                {categories.filter(cat => cat.isActive).map((category) => (
                  <Button 
                    key={category.id} 
                    variant={selectedCategory === category.id ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="px-2">
                <Slider
                  defaultValue={priceRange}
                  min={initialPriceRange[0]}
                  max={initialPriceRange[1]}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
            </div>
            
            <Separator />
            
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </div>
          
          {/* Products grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedCategory === 'all' 
                    ? 'All Products' 
                    : `${categories.find(c => c.id === selectedCategory)?.name || 'Products'}`}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredProducts.length} items found
                </p>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden group min-h-[350px] flex flex-col">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].imageUrl}
                          alt={product.images[0].altText || product.name}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          No image available
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className="bg-black text-white">
                          {product.category.name}
                        </Badge>
                        {product.isFeatured && (
                          <Badge className="bg-orange-500 text-white">
                            Featured
                          </Badge>
                        )}
                        {product.comparePrice && product.comparePrice > product.price && (
                          <Badge className="bg-red-500 text-white">
                            Sale
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-white">
                          Stock: {product.stock}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 flex flex-col flex-1">
                      <h3 className="font-medium truncate">
                        <Link href={`/product/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </h3>
                      {product.sku && (
                        <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                      )}
                      {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-auto flex flex-col gap-2 pt-4">
                        <div className="flex items-center gap-2">
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(product.comparePrice)}
                            </span>
                          )}
                          <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:bg-black group-hover:text-white transition-colors"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.stock <= 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" /> 
                          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn&apos;t find any products matching your search and filters.
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}