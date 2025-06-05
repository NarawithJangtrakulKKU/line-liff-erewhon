import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { extname } from 'path'

// MIME type mapping
const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
  }
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filePath = path.join('/')
    
    // Security check - prevent directory traversal
    if (filePath.includes('..') || filePath.includes('~')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Only allow images and uploads directories
    if (!filePath.startsWith('images/') && !filePath.startsWith('uploads/')) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const fullPath = join(process.cwd(), 'public', filePath)
    
    if (!existsSync(fullPath)) {
      return new NextResponse('Not Found', { status: 404 })
    }

    try {
      const fileBuffer = await readFile(fullPath)
      const extension = extname(fullPath)
      const mimeType = getMimeType(extension)

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (readError) {
      console.error('Error reading file:', readError)
      return new NextResponse('Error reading file', { status: 500 })
    }

  } catch (error) {
    console.error('Static file handler error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 