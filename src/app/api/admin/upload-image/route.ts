import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'

// Configure body parser limits for better performance
export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB increased for better UX)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Create categories directory if it doesn't exist
    const categoriesDir = join(process.cwd(), 'public', 'images', 'categories')
    if (!existsSync(categoriesDir)) {
      await mkdir(categoriesDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'image'
    const filename = `${timestamp}-${randomId}-${cleanFileName}.${fileExtension}`
    const filepath = join(categoriesDir, filename)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      // Optimize image using sharp for better performance and smaller file size
      let processedBuffer: Buffer = buffer
      
      if (file.size > 1024 * 1024) { // Only optimize files larger than 1MB
        console.log(`Optimizing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
        
        processedBuffer = await sharp(buffer)
          .resize(1200, 1200, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85,
            progressive: true,
            mozjpeg: true
          })
          .toBuffer()
          
        console.log(`Optimization complete: ${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB`)
      }

      // Save optimized file
      await writeFile(filepath, processedBuffer)
      
    } catch (optimizationError) {
      console.warn('Image optimization failed, saving original:', optimizationError)
      // Fallback to original file if optimization fails
      await writeFile(filepath, buffer)
    }

    // Return the relative path for the image
    const imageUrl = `/images/categories/${filename}`
    const processingTime = Date.now() - startTime

    console.log(`Image upload completed in ${processingTime}ms: ${filename}`)

    return NextResponse.json({ 
      imageUrl,
      originalSize: file.size,
      processingTime 
    })
    
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { message: 'Error uploading image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json(
        { message: 'No image URL provided' },
        { status: 400 }
      )
    }

    // Extract filename from URL
    const filename = imageUrl.split('/').pop()
    if (!filename) {
      return NextResponse.json(
        { message: 'Invalid image URL' },
        { status: 400 }
      )
    }

    // Delete file from public directory
    const filepath = join(process.cwd(), 'public', 'images', 'categories', filename)
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { message: 'Error deleting image' },
      { status: 500 }
    )
  }
} 