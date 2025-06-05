// /api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { createReadStream, createWriteStream } from 'fs'

const prisma = new PrismaClient()

interface MediaFile {
  mediaType: 'IMAGE' | 'VIDEO'
  mediaUrl: string
  fileName: string
  fileSize: number
  sortOrder: number
}

interface MediaFileInput {
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  altText?: string;
}

// Helper function to process file with streaming
async function processFileStreaming(file: File, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = file.stream().getReader()
    const writeStream = createWriteStream(filePath)
    
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          if (!writeStream.write(value)) {
            await new Promise<void>((drainResolve) => writeStream.once('drain', () => drainResolve()))
          }
        }
        writeStream.end()
        resolve()
      } catch (error) {
        writeStream.destroy()
        reject(error)
      }
    }
    
    writeStream.on('error', reject)
    writeStream.on('finish', () => resolve())
    pump()
  })
}

// Helper function to compress and resize image
async function processImage(file: File, outputPath: string): Promise<{ size: number }> {
  try {
    // For now, just save the file directly
    // In production, you might want to use sharp or similar for compression
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(outputPath, buffer)
    return { size: buffer.length }
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  }
}

// Helper function to process video
async function processVideo(file: File, outputPath: string): Promise<{ size: number }> {
  try {
    // Use streaming for large video files
    await processFileStreaming(file, outputPath)
    const stats = await import('fs').then(fs => fs.promises.stat(outputPath))
    return { size: stats.size }
  } catch (error) {
    console.error('Error processing video:', error)
    throw error
  }
}

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
  const startTime = Date.now()
  const TIMEOUT_MS = 300000 // 5 minutes for video processing
  
  try {
    console.log('🚀 Starting review creation process...')
    
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

    console.log('✅ Basic validation passed', {
      userId,
      productId,
      orderId,
      rating,
      hasComment: !!comment
    })

    // Parallel database validation to speed up checks
    const [user, product, order] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.order.findFirst({
        where: { 
          id: orderId,
          userId: userId,
          status: 'DELIVERED'
        },
        include: {
          orderItems: {
            where: { productId: productId }
          }
        }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!order || order.orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Order not found or not eligible for review' },
        { status: 403 }
      )
    }

    const orderItem = order.orderItems[0]

    // Check if review already exists
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

    console.log('✅ Database validation completed')

    // Process uploaded media files
    const mediaFiles: MediaFile[] = []
    const uploadedFiles: File[] = []
    
    // Collect all uploaded files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('media-') && value instanceof File) {
        uploadedFiles.push(value)
      }
    }

    console.log(`📁 Found ${uploadedFiles.length} files to process`)

    if (uploadedFiles.length > 0) {
      // Process files in parallel for better performance
      const fileProcessingPromises = uploadedFiles.map(async (file, i) => {
        // Check timeout before processing each file
        if (Date.now() - startTime > TIMEOUT_MS) {
          throw new Error('Request timeout during file processing')
        }
        
        if (file.size === 0) return null

        console.log(`🔄 Processing file ${i + 1}/${uploadedFiles.length}:`, {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          type: file.type
        })

        // Validate file type and size
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        
        if (!isImage && !isVideo) {
          throw new Error(`Invalid file type: ${file.type}`)
        }

        // More strict file size limits
        const maxSize = isVideo ? 20 * 1024 * 1024 : 10 * 1024 * 1024 // 20MB for video, 10MB for image
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds size limit (${isVideo ? '20MB' : '10MB'})`)
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

          console.log(`💾 Saving file: ${fileName}`)

          // Process file based on type
          let finalSize: number
          if (isImage) {
            const result = await processImage(file, filePath)
            finalSize = result.size
          } else {
            const result = await processVideo(file, filePath)
            finalSize = result.size
          }

          console.log(`✅ File saved: ${fileName} (${(finalSize / 1024 / 1024).toFixed(2)}MB)`)

          return {
            mediaType: isImage ? 'IMAGE' : 'VIDEO',
            mediaUrl: `/uploads/reviews/${fileTypeDir}/${fileName}`,
            fileName: file.name,
            fileSize: finalSize,
            sortOrder: i
          } as MediaFile

        } catch (error) {
          console.error(`❌ Error processing file ${file.name}:`, error)
          throw new Error(`Failed to upload file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      // Wait for all files to be processed
      console.log('⏳ Processing all files in parallel...')
      const results = await Promise.all(fileProcessingPromises)
      
      // Filter out null results and add to mediaFiles
      results.forEach(result => {
        if (result) mediaFiles.push(result)
      })

      console.log(`✅ Successfully processed ${mediaFiles.length} media files`)
    }

    // Create review with media files in a transaction for data consistency
    console.log('�� Creating review in database...')
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        orderId,
        orderItemId: orderItem.id,
        rating,
        comment,
        isVerified: true,
        mediaFiles: {
          create: mediaFiles.map((media, index) => ({
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

    const totalTime = Date.now() - startTime
    console.log(`🎉 Review created successfully in ${totalTime}ms`)

    return NextResponse.json({
      success: true,
      review,
      message: 'Review created successfully',
      processingTime: totalTime
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`❌ Error creating review after ${totalTime}ms:`, error)
    
    // Enhanced error handling
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return NextResponse.json(
          { error: 'Request timeout - กรุณาลดขนาดไฟล์หรือจำนวนไฟล์', details: error.message },
          { status: 408 }
        )
      }
      if (error.message.includes('ENOSPC') || error.message.includes('space')) {
        return NextResponse.json(
          { error: 'Server storage full - ติดต่อผู้ดูแลระบบ', details: error.message },
          { status: 507 }
        )
      }
      if (error.message.includes('size limit') || error.message.includes('exceeds')) {
        return NextResponse.json(
          { error: 'ไฟล์มีขนาดใหญ่เกินไป - กรุณาลดขนาดไฟล์', details: error.message },
          { status: 413 }
        )
      }
      if (error.message.includes('ECONNRESET') || error.message.includes('aborted')) {
        return NextResponse.json(
          { error: 'การเชื่อมต่อถูกยกเลิก - กรุณาลองใหม่อีกครั้ง', details: error.message },
          { status: 499 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create review', 
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime: totalTime
      },
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
              create: mediaFiles.map((media: MediaFileInput, index: number) => ({
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