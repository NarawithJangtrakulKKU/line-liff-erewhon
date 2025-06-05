import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params

    // Validate category ID (optional but good practice)
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      )
    }

    // Fetch products for the given category ID
    const products = await prisma.product.findMany({
      where: {
        categoryId: id,
        isActive: true, // Assuming you only want active products
      },
      include: { // Include related data like images and category name
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Check if the category exists (optional, based on requirement. If no products are found for a valid ID, it returns an empty array)
    // If you need to explicitly return 404 for non-existent categories, you'd first check if the category exists.
    // For now, returning empty array for no products is fine.

    return NextResponse.json({
      success: true,
      products
    })

  } catch (error) {
    console.error('Error fetching products by category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products for category' },
      { status: 500 }
    )
  }
} 