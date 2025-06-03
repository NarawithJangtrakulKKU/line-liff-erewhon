import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before destructuring
    const { id } = await params;
    const body = await request.json()
    const { role } = body

    // Validation
    if (!role || !['CUSTOMER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role. Must be either CUSTOMER or ADMIN' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      include: {
        _count: {
          select: {
            orders: true,
            cartItems: true,
            reviews: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before destructuring
    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            cartItems: true,
            reviews: true
          }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has any associated data
    if (existingUser._count.orders > 0 || existingUser._count.reviews > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete user. They have ${existingUser._count.orders} order(s) and ${existingUser._count.reviews} review(s) associated with their account.` 
        },
        { status: 400 }
      )
    }

    // Delete user's cart items first (if any)
    if (existingUser._count.cartItems > 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: id }
      })
    }

    // Delete the user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 