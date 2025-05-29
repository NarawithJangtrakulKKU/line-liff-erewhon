// /api/reviews/upload-media/route.ts (Enhanced Version)
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { generateVideoThumbnail, getVideoInfo, validateVideo } from '@/lib/videoUtils'
import sharp from 'sharp'

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_VIDEO_DURATION = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image' or 'video'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { 
          error: 'Unsupported file type', 
          message: 'Please upload images (JPG, PNG, GIF, WebP) or videos (MP4, WebM, MOV, AVI)' 
        },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'File size too large', 
          message: `Maximum size is ${isImage ? '10MB' : '50MB'}` 
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = path.extname(file.name)
    const fileName = `${timestamp}_${randomId}${fileExtension}`

    // Create upload directories
    const mediaType = isImage ? 'images' : 'videos'
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reviews', mediaType)
    const thumbnailDir = path.join(process.cwd(), 'public', 'uploads', 'reviews', 'thumbnails')
    
    for (const dir of [uploadDir, thumbnailDir]) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
    }

    // Write original file
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)

    // Generate URL
    const fileUrl = `/uploads/reviews/${mediaType}/${fileName}`
    let thumbnailUrl = null
    let duration = null
    let dimensions = { width: 0, height: 0 }

    if (isImage) {
      try {
        // Get image dimensions and create optimized thumbnail
        const metadata = await sharp(buffer).metadata()
        dimensions.width = metadata.width || 0
        dimensions.height = metadata.height || 0

        // Create thumbnail for large images
        if (metadata.width && metadata.width > 300) {
          const thumbnailFileName = `thumb_${fileName.replace(fileExtension, '.webp')}`
          const thumbnailPath = path.join(thumbnailDir, thumbnailFileName)
          
          await sharp(buffer)
            .resize(300, 300, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .webp({ quality: 80 })
            .toFile(thumbnailPath)
          
          thumbnailUrl = `/uploads/reviews/thumbnails/${thumbnailFileName}`
        }
      } catch (error) {
        console.error('Error processing image:', error)
        // Continue without thumbnail if processing fails
      }
    }

    if (isVideo) {
      try {
        // Validate video
        const validation = await validateVideo(filePath, MAX_VIDEO_DURATION, MAX_VIDEO_SIZE)
        
        if (!validation.valid) {
          // Delete uploaded file
          const fs = require('fs').promises
          await fs.unlink(filePath).catch(() => {})
          
          return NextResponse.json(
            { 
              error: 'Invalid video', 
              message: validation.error 
            },
            { status: 400 }
          )
        }

        if (validation.info) {
          duration = Math.round(validation.info.duration)
          dimensions.width = validation.info.width
          dimensions.height = validation.info.height
        }

        // Generate video thumbnail
        const thumbnailFileName = `thumb_${fileName.replace(fileExtension, '.jpg')}`
        const thumbnailPath = path.join(thumbnailDir, thumbnailFileName)
        
        try {
          await generateVideoThumbnail(filePath, thumbnailPath, {
            timeOffset: Math.min(2, duration ? duration / 4 : 1), // Capture at 25% or 2s
            width: 320,
            height: 240
          })
          
          thumbnailUrl = `/uploads/reviews/thumbnails/${thumbnailFileName}`
        } catch (thumbnailError) {
          console.error('Error generating video thumbnail:', thumbnailError)
          // Use default video placeholder
          thumbnailUrl = '/images/video-placeholder.jpg'
        }

      } catch (error) {
        console.error('Error processing video:', error)
        // Delete uploaded file
        const fs = require('fs').promises
        await fs.unlink(filePath).catch(() => {})
        
        return NextResponse.json(
          { 
            error: 'Video processing failed', 
            message: 'Unable to process video file' 
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      thumbnailUrl,
      fileName: file.name,
      fileSize: file.size,
      mediaType: isImage ? 'IMAGE' : 'VIDEO',
      duration,
      dimensions,
      metadata: {
        originalName: file.name,
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        message: 'An error occurred while uploading the file' 
      },
      { status: 500 }
    )
  }
}

// Enhanced DELETE method with better cleanup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('fileUrl')
    const thumbnailUrl = searchParams.get('thumbnailUrl')

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      )
    }

    const fs = require('fs').promises
    const filesToDelete = [fileUrl]
    
    if (thumbnailUrl && thumbnailUrl !== '/images/video-placeholder.jpg') {
      filesToDelete.push(thumbnailUrl)
    }

    // Delete files
    for (const url of filesToDelete) {
      try {
        const filePath = path.join(process.cwd(), 'public', url)
        if (existsSync(filePath)) {
          await fs.unlink(filePath)
        }
      } catch (error) {
        console.error(`Error deleting file ${url}:`, error)
        // Continue with other files even if one fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Files deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting files:', error)
    return NextResponse.json(
      { 
        error: 'Deletion failed',
        message: 'An error occurred while deleting files'
      },
      { status: 500 }
    )
  }
}