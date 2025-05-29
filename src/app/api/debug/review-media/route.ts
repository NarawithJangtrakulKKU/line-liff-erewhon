// Debug API for checking review media URLs
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const reviewMedia = await prisma.reviewMedia.findMany({
      include: {
        review: {
          include: {
            user: {
              select: {
                displayName: true
              }
            },
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      count: reviewMedia.length,
      data: reviewMedia.map(media => ({
        id: media.id,
        mediaType: media.mediaType,
        mediaUrl: media.mediaUrl,
        fileName: media.fileName,
        fileSize: media.fileSize,
        createdAt: media.createdAt,
        review: {
          id: media.review.id,
          rating: media.review.rating,
          user: media.review.user.displayName,
          product: media.review.product.name
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching review media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review media' },
      { status: 500 }
    )
  }
} 