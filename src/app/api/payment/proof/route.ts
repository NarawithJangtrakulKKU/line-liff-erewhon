import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { PrismaClient, PaymentStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const slip = formData.get('slip') as File
    const orderId = formData.get('orderId') as string
    const userId = formData.get('userId') as string
    const notes = formData.get('notes') as string

    if (!slip || !orderId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payments directory if it doesn't exist
    const paymentsDir = join(process.cwd(), 'public', 'images', 'payments')
    if (!existsSync(paymentsDir)) {
      await mkdir(paymentsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${orderId}-${timestamp}.${slip.name.split('.').pop()}`
    const filePath = join(paymentsDir, filename)

    // Convert File to Buffer and save
    const bytes = await slip.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL for the image
    const paymentSlipUrl = `/images/payments/${filename}`

    // Update order in database
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
        userId: userId,
      },
      data: {
        paymentSlipUrl,
        notes,
        paymentStatus: PaymentStatus.PENDING,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.id,
        paymentSlipUrl: updatedOrder.paymentSlipUrl,
        paymentStatus: updatedOrder.paymentStatus,
      },
    })
  } catch (error) {
    console.error('Error processing payment proof:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process payment proof' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 