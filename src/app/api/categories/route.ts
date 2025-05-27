import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 