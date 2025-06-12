import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                category: { select: { id: true, name: true, isActive: true } },
                reviews: {
                    select: {
                        rating: true
                    }
                },
                _count: {
                    select: {
                        reviews: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        })

        // Calculate averageRating for each product
        const productsWithRating = products.map(product => {
            const averageRating = product.reviews.length > 0
                ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
                : 0;

            const { _count, ...productData } = product;
            
            return {
                ...productData,
                averageRating: averageRating,
                reviewCount: _count.reviews
            };
        });

        return NextResponse.json({
            success: true,
            products: productsWithRating,
        })
    } catch (error) {
        console.error('Error fetching newest products:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch newest products',
                error: error instanceof Error ? error.message : 'An unknown error occurred',
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}