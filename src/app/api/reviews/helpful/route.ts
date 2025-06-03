// /api/reviews/helpful/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema
const helpfulVoteSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  isHelpful: z.boolean()
})

// POST - Vote if review is helpful or not
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = helpfulVoteSchema.parse(body)
    const { reviewId, userId, isHelpful } = validatedData

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

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user is trying to vote on their own review
    if (review.userId === userId) {
      return NextResponse.json(
        { error: 'You cannot vote on your own review' },
        { status: 403 }
      )
    }

    // Use upsert to either create new vote or update existing one
    const helpfulVote = await prisma.reviewHelpful.upsert({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      },
      update: {
        isHelpful
      },
      create: {
        reviewId,
        userId,
        isHelpful
      }
    })

    // Count total helpful votes for this review
    const helpfulCount = await prisma.reviewHelpful.count({
      where: {
        reviewId,
        isHelpful: true
      }
    })

    // Update the review's helpful count
    await prisma.review.update({
      where: { id: reviewId },
      data: { isHelpful: helpfulCount }
    })

    return NextResponse.json({
      success: true,
      vote: helpfulVote,
      totalHelpfulVotes: helpfulCount
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error voting on review:', error)
    return NextResponse.json(
      { error: 'Failed to vote on review' },
      { status: 500 }
    )
  }
}

// GET - Get user's vote on a specific review
export async function GET(request: NextRequest) {
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

    const vote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    })

    // Get total helpful votes for this review
    const helpfulCount = await prisma.reviewHelpful.count({
      where: {
        reviewId,
        isHelpful: true
      }
    })

    const notHelpfulCount = await prisma.reviewHelpful.count({
      where: {
        reviewId,
        isHelpful: false
      }
    })

    return NextResponse.json({
      userVote: vote,
      stats: {
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
        total: helpfulCount + notHelpfulCount
      }
    })

  } catch (error) {
    console.error('Error fetching vote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vote' },
      { status: 500 }
    )
  }
}

// DELETE - Remove user's vote
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

    // Delete the vote
    await prisma.reviewHelpful.delete({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    })

    // Recalculate helpful count
    const helpfulCount = await prisma.reviewHelpful.count({
      where: {
        reviewId,
        isHelpful: true
      }
    })

    // Update the review's helpful count
    await prisma.review.update({
      where: { id: reviewId },
      data: { isHelpful: helpfulCount }
    })

    return NextResponse.json({
      success: true,
      message: 'Vote removed successfully',
      totalHelpfulVotes: helpfulCount
    })

  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}