// app/api/products/[id]/related/route.ts
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลสินค้าปัจจุบันเพื่อหา categoryId
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true }
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // ดึงสินค้าที่เกี่ยวข้องในหมวดเดียวกัน (ยกเว้นสินค้าปัจจุบัน)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        isActive: true,
        NOT: {
          id: id
        }
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
          },
          take: 1
        },
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
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // ฟอร์แมตข้อมูลสำหรับ response
    const formattedProducts = relatedProducts.map(product => {
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        sku: product.sku,
        stock: product.stock,
        isFeatured: product.isFeatured,
        category: product.category,
        image: product.images[0]?.imageUrl || null,
        averageRating: averageRating,
        reviewCount: product._count.reviews,
        createdAt: product.createdAt
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length
    });

  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// หากมี API route อื่นที่ใช้ params ก็ต้องแก้ไขด้วย
// ตัวอย่าง: app/api/admin/categories/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = await params; // เพิ่ม await
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = await request.json();
    
    // ... rest of the code
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // error handling
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = await params; // เพิ่ม await
    
    // ... rest of the code
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // error handling
  }
}