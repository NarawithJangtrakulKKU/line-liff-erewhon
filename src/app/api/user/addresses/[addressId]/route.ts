import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/user/addresses/[addressId]
export async function PUT(req: NextRequest, { params }: { params: { addressId: string } }) {
  const { addressId } = params
  const data = await req.json()
  const address = await prisma.address.update({
    where: { id: addressId },
    data
  })
  return NextResponse.json({ address })
}

// DELETE /api/user/addresses/[addressId]
export async function DELETE(req: NextRequest, { params }: { params: { addressId: string } }) {
  const { addressId } = params
  await prisma.address.delete({ where: { id: addressId } })
  return NextResponse.json({ success: true })
} 