import { writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get('image') as File;
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = parseFloat(formData.get('price') as string);

  if (!file || !file.name) {
    return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const filePath = path.join(process.cwd(), 'public/image/product', filename);

  await writeFile(filePath, buffer);
  const imagePath = `/image/product/${filename}`;

  const product = await prisma.product.create({
    data: {
      name,
      price,
      image: imagePath,
      categoryId: category,
    },
  });

  return NextResponse.json({
    message: 'Product created',
    product,
  });
}
