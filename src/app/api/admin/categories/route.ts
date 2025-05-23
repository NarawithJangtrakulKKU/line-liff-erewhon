import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ]
      })
  
      return NextResponse.json({
        success: true,
        categories
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

}

export async function POST(request: NextRequest) {
    try {
      const body = await request.json()
      const { name, description, imageUrl, isActive, sortOrder } = body
  
      // Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: 'Category name is required' },
          { status: 400 }
        )
      }
  
      // Check if category name already exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          }
        }
      })
  
      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: 'Category name already exists' },
          { status: 400 }
        )
      }
  
      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          isActive: Boolean(isActive),
          sortOrder: Number(sortOrder) || 0
        },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        }
      })
  
      return NextResponse.json({
        success: true,
        message: 'Category created successfully',
        category
      }, { status: 201 })
    } catch (error) {
      console.error('Error creating category:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create category' },
        { status: 500 }
      )
    }
}