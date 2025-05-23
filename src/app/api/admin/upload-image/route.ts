import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
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

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 5MB.' },
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
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
    const filepath = join(categoriesDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the relative path for the image
    const imageUrl = `/images/categories/${filename}`

    return NextResponse.json({ imageUrl })
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