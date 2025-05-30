// /api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

interface MediaFile {
  mediaType: 'IMAGE' | 'VIDEO'
  mediaUrl: string
  thumbnailUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  duration?: number | null
  altText?: string | null
}

// Validation schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createReviewSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().nullable().optional(),
  mediaFiles: z.array(z.object({
    mediaType: z.enum(['IMAGE', 'VIDEO']),
    mediaUrl: z.string().min(1, 'Media URL is required').refine(
      (url) => url.startsWith('http') || url.startsWith('/'),
      'Invalid media URL format'
    ),
    thumbnailUrl: z.union([
      z.string().refine(
        (url) => url.startsWith('http') || url.startsWith('/'),
        'Invalid thumbnail URL format'
      ),
      z.null()
    ]).optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    duration: z.number().optional(), // for videos
    altText: z.string().optional()
  })).optional().default([])
})

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Fetch reviews with user info and media files
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        },
        mediaFiles: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Count total reviews
    const totalReviews = await prisma.review.count({
      where: { productId }
    })

    // Calculate average rating
    const ratingStats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    // Count reviews by rating
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true }
    })

    return NextResponse.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page * limit < totalReviews,
        hasPrev: page > 1
      },
      stats: {
        averageRating: ratingStats._avg.rating || 0,
        totalReviews: ratingStats._count.rating || 0,
        distribution: ratingDistribution.reduce((acc, item) => {
          acc[item.rating] = item._count.rating
          return acc
        }, {} as Record<number, number>)
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    // Set timeout for the entire operation
    const startTime = Date.now()
    const TIMEOUT_MS = 120000 // 2 minutes
    
    const formData = await request.formData()
    
    // Check timeout after formData parsing
    if (Date.now() - startTime > TIMEOUT_MS) {
      return NextResponse.json(
        { error: 'Request timeout during file parsing' },
        { status: 408 }
      )
    }
    
    // Extract text fields from FormData
    const userId = formData.get('userId')?.toString()
    const productId = formData.get('productId')?.toString()
    const orderId = formData.get('orderId')?.toString()
    const rating = parseInt(formData.get('rating')?.toString() || '0')
    const comment = formData.get('comment')?.toString() || null

    // Validate required fields
    if (!userId || !productId || !orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    console.log('Starting review creation process', {
      userId,
      productId,
      orderId,
      rating,
      hasComment: !!comment,
      timestamp: new Date().toISOString()
    })

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: userId,
        status: 'DELIVERED' // Only allow reviews for delivered orders
      },
      include: {
        orderItems: {
          where: { productId: productId }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not eligible for review' },
        { status: 403 }
      )
    }

    if (order.orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Product not found in this order' },
        { status: 403 }
      )
    }

    const orderItem = order.orderItems[0]

    // Check if review already exists for this order item
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_orderItemId: {
          userId: userId,
          orderItemId: orderItem.id
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product from this order' },
        { status: 409 }
      )
    }

    // Process uploaded media files
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediaFiles: any[] = []
    const uploadedFiles: File[] = []
    
    // Collect all uploaded files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('media-') && value instanceof File) {
        uploadedFiles.push(value)
      }
    }

    console.log(`Found ${uploadedFiles.length} files to process`)

    // Process each uploaded file
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i]
      
      // Check timeout before processing each file
      if (Date.now() - startTime > TIMEOUT_MS) {
        return NextResponse.json(
          { error: 'Request timeout during file processing' },
          { status: 408 }
        )
      }
      
      if (file.size === 0) continue

      console.log(`Processing file ${i + 1}/${uploadedFiles.length}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      })

      // Validate file type and size
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) {
        console.error(`Invalid file type: ${file.type}`)
        return NextResponse.json(
          { error: `File ${file.name} is not a valid image or video` },
          { status: 400 }
        )
      }

      // Check file size limits
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB for video, 10MB for image
      if (file.size > maxSize) {
        console.error(`File size too large: ${file.size} bytes, max: ${maxSize} bytes`)
        return NextResponse.json(
          { error: `File ${file.name} exceeds size limit (${isVideo ? '50MB' : '10MB'})` },
          { status: 413 }
        )
      }

      try {
        // Create upload directory based on file type
        const fileTypeDir = isImage ? 'images' : 'videos'
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews', fileTypeDir)
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop()
        const fileName = `review_${timestamp}_${randomString}.${fileExtension}`
        const filePath = join(uploadDir, fileName)

        console.log(`Saving file to: ${filePath}`)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        console.log(`File saved successfully: ${fileName}`)

        // Add to media files array
        mediaFiles.push({
          mediaType: isImage ? 'IMAGE' : 'VIDEO',
          mediaUrl: `/uploads/reviews/${fileTypeDir}/${fileName}`,
          fileName: file.name,
          fileSize: file.size,
          sortOrder: i
        })

      } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
          { error: `Failed to upload file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    console.log(`Successfully processed ${mediaFiles.length} media files`)

    // Create review with media files
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        orderId,
        orderItemId: orderItem.id,
        rating,
        comment,
        isVerified: true, // Since it's from a delivered order
        mediaFiles: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: mediaFiles.map((media: any, index: number) => ({
            mediaType: media.mediaType,
            mediaUrl: media.mediaUrl,
            fileName: media.fileName,
            fileSize: media.fileSize,
            sortOrder: index
          }))
        }
      },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true
          }
        },
        mediaFiles: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Review created successfully'
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('Error creating review:', error)
    
    // Check if it's a timeout or size error
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return NextResponse.json(
          { error: 'Request timeout - ลองลดขนาดไฟล์หรือจำนวนไฟล์', details: error.message },
          { status: 408 }
        )
      }
      if (error.message.includes('ENOSPC') || error.message.includes('space')) {
        return NextResponse.json(
          { error: 'Server storage full - ติดต่อผู้ดูแลระบบ', details: error.message },
          { status: 507 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Update a review (optional - for editing reviews)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, userId, rating, comment, mediaFiles } = body

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: userId
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update review
    const updatedReview = await prisma.$transaction(async (tx) => {
      // Delete existing media files if new ones are provided
      if (mediaFiles && mediaFiles.length > 0) {
        await tx.reviewMedia.deleteMany({
          where: { reviewId }
        })
      }

      // Update review
      return await tx.review.update({
        where: { id: reviewId },
        data: {
          rating,
          comment,
          ...(mediaFiles && mediaFiles.length > 0 && {
            mediaFiles: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              create: mediaFiles.map((media: any, index: number) => ({
                mediaType: media.mediaType,
                mediaUrl: media.mediaUrl,
                thumbnailUrl: media.thumbnailUrl,
                fileName: media.fileName,
                fileSize: media.fileSize,
                duration: media.duration,
                altText: media.altText,
                sortOrder: index
              }))
            }
          })
        },
        include: {
          user: {
            select: {
              displayName: true,
              pictureUrl: true
            }
          },
          mediaFiles: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      review: updatedReview
    })

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')
    const userId = searchParams.get('userId')

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: 'Review ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: userId
      },
      include: {
        mediaFiles: true
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete review (media files will be cascade deleted)
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Optionally delete media files from filesystem
    // for (const mediaFile of existingReview.mediaFiles) {
    //   // Delete file from filesystem
    // }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}