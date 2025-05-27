// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, userId } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!productId || !quantity || !userId) {
      return NextResponse.json(
        { error: 'Product ID, quantity, and user ID are required' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าสินค้ามีอยู่จริงและยังใช้งานได้
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // ตรวจสอบ stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีสินค้าในตะกร้าอยู่แล้วหรือไม่
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      }
    });

    let cartItem;

    if (existingCartItem) {
      // อัปเดตจำนวนถ้ามีอยู่แล้ว
      const newQuantity = existingCartItem.quantity + quantity;
      
      // ตรวจสอบ stock อีกครั้งสำหรับจำนวนใหม่
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for requested quantity' },
          { status: 400 }
        );
      }

      cartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: newQuantity
        },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: {
                take: 1,
                orderBy: {
                  sortOrder: 'asc'
                }
              }
            }
          }
        }
      });
    } else {
      // สร้างรายการใหม่ในตะกร้า
      cartItem = await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: productId,
          quantity: quantity
        },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: {
                take: 1,
                orderBy: {
                  sortOrder: 'asc'
                }
              }
            }
          }
        }
      });
    }

    // ดึงจำนวนรายการทั้งหมดในตะกร้า
    const cartCount = await prisma.cartItem.count({
      where: {
        userId: userId
      }
    });

    return NextResponse.json({
      message: 'Product added to cart successfully',
      cartItem: {
        id: cartItem.id,
        quantity: cartItem.quantity,
        product: {
          name: cartItem.product.name,
          price: Number(cartItem.product.price),
          image: cartItem.product.images[0]?.imageUrl || null
        }
      },
      cartCount: cartCount
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ดึงรายการในตะกร้า
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: userId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
            images: {
              take: 1,
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // ฟอร์แมตข้อมูลและคำนวณยอดรวม
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        stock: item.product.stock,
        isActive: item.product.isActive,
        image: item.product.images[0]?.imageUrl || null
      },
      subtotal: Number(item.product.price) * item.quantity,
      createdAt: item.createdAt
    }));

    const totalAmount = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      items: formattedItems,
      summary: {
        totalItems: totalItems,
        totalAmount: totalAmount,
        itemCount: formattedItems.length
      }
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}