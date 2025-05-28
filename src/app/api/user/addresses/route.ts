import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/user/addresses?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  const addresses = await prisma.address.findMany({ where: { userId } })
  return NextResponse.json({ addresses })
}

// POST /api/user/addresses
export async function POST(req: NextRequest) {
  const data = await req.json()
  const address = await prisma.address.create({ data })
  return NextResponse.json({ address })
} 