import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    await prisma.cartItem.deleteMany({ where: { userId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 