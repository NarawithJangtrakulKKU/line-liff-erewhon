// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // แก้ไข: await params ก่อนใช้งาน
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลสินค้าพร้อมหมวดหมู่ รูปภาพ และรีวิว
    const product = await prisma.product.findUnique({
      where: {
        id: id,
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                displayName: true,
                pictureUrl: true
              }
            },
            mediaFiles: {
              orderBy: {
                sortOrder: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // คำนวณคะแนนเฉลี่ย
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    // ฟอร์แมตข้อมูลสำหรับ response
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      sku: product.sku,
      stock: product.stock,
      weight: product.weight ? Number(product.weight) : null,
      isFeatured: product.isFeatured,
      category: product.category,
      images: product.images.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        sortOrder: img.sortOrder
      })),
      reviews: product.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        isVerified: review.isVerified,
        user: {
          displayName: review.user.displayName,
          pictureUrl: review.user.pictureUrl
        },
        mediaFiles: review.mediaFiles.map(media => ({
          id: media.id,
          mediaType: media.mediaType,
          mediaUrl: media.mediaUrl,
          thumbnailUrl: media.thumbnailUrl,
          fileName: media.fileName,
          altText: media.altText,
          sortOrder: media.sortOrder
        }))
      })),
      averageRating: averageRating,
      reviewCount: product._count.reviews,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    return NextResponse.json(formattedProduct);

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}