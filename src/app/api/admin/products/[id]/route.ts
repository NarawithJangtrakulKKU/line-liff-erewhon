import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

// Helper function to save uploaded files
async function saveUploadedFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return []

  // Create products directory if it doesn't exist
  const productsDir = join(process.cwd(), 'public', 'images', 'products')
  if (!existsSync(productsDir)) {
    await mkdir(productsDir, { recursive: true })
  }

  const savedUrls: string[] = []

  for (const file of files) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error(`Invalid file type: ${file.name}. Only images are allowed.`)
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`File too large: ${file.name}. Maximum size is 5MB.`)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'image'
    const filename = `${timestamp}-${randomString}-${cleanFileName}.${fileExtension}`
    const filepath = join(productsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Add to saved URLs
    savedUrls.push(`/images/products/${filename}`)
  }

  return savedUrls
}

// Helper function to delete image files
async function deleteImageFiles(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    try {
      const filename = imageUrl.split('/').pop()
      if (filename) {
        const filepath = join(process.cwd(), 'public', 'images', 'products', filename)
        if (existsSync(filepath)) {
          await unlink(filepath)
        }
      }
    } catch (error) {
      console.error('Error deleting image file:', error)
      // Continue with other deletions
    }
  }
}

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before destructuring
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update product with file upload
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before destructuring
    const { id } = await params;
    
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const comparePrice = formData.get('comparePrice') ? parseFloat(formData.get('comparePrice') as string) : null
    const sku = formData.get('sku') as string
    const stock = parseInt(formData.get('stock') as string)
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const isActive = formData.get('isActive') === 'true'
    const isFeatured = formData.get('isFeatured') === 'true'
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
    const categoryId = formData.get('categoryId') as string
    
    // Extract existing image URLs (that should be kept)
    const existingImages: string[] = []
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (key.startsWith('existingImages-') && typeof value === 'string') {
        existingImages.push(value)
      }
    }

    // Extract uploaded files
    const imageFiles: File[] = []
    for (const [key, value] of entries) {
      if (key.startsWith('images-') && value instanceof File) {
        imageFiles.push(value)
      }
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product name is required' },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'Category is required' },
        { status: 400 }
      )
    }

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: 'Valid price is required' },
        { status: 400 }
      )
    }

    if (isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { success: false, message: 'Valid stock quantity is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if category exists and is active
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      )
    }

    if (!category.isActive) {
      return NextResponse.json(
        { success: false, message: 'Selected category is inactive' },
        { status: 400 }
      )
    }

    // Check if SKU already exists (excluding current product)
    if (sku && sku.trim()) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          sku: {
            equals: sku.trim(),
            mode: 'insensitive'
          },
          id: {
            not: id
          }
        }
      })

      if (duplicateProduct) {
        return NextResponse.json(
          { success: false, message: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    // Save new uploaded images
    const newImageUrls = await saveUploadedFiles(imageFiles)
    
    // Combine existing and new image URLs
    const allImageUrls = [...existingImages, ...newImageUrls]

    // Get URLs of images that will be deleted
    const currentImageUrls = existingProduct.images.map(img => img.imageUrl)
    const imagesToDelete = currentImageUrls.filter(url => !allImageUrls.includes(url))

    // Update product and its images
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        sku: sku?.trim() || null,
        stock: Number(stock),
        weight: weight ? Number(weight) : null,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        sortOrder: Number(sortOrder),
        categoryId,
        // Delete existing images and create new ones
        images: {
          deleteMany: {},
          create: allImageUrls.map((imageUrl: string, index: number) => ({
            imageUrl,
            sortOrder: index,
            altText: `${name.trim()} - Image ${index + 1}`
          }))
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    // Delete removed image files from filesystem
    if (imagesToDelete.length > 0) {
      await deleteImageFiles(imagesToDelete)
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before destructuring
    const { id } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Get image URLs for deletion
    const imageUrls = existingProduct.images.map(img => img.imageUrl)

    // Delete product (this will cascade delete images due to Prisma relations)
    await prisma.product.delete({
      where: { id }
    })

    // Delete image files from filesystem
    if (imageUrls.length > 0) {
      await deleteImageFiles(imageUrls)
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    )
  }
}