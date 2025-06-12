import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // รอให้ params resolve
    const resolvedParams = await params;
    
    // รวม path segments
    const filePath = resolvedParams.path.join('/');
    const fullPath = path.join(process.cwd(), 'public', 'attachment', filePath);
    
    console.log('📁 Serving file:', fullPath);

    // ตรวจสอบว่าไฟล์มีอยู่จริง
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // อ่านไฟล์
    const fileBuffer = await fs.readFile(fullPath);
    const fileName = path.basename(fullPath);
    
    // กำหนด Content-Type จากนามสกุลไฟล์
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }

    // ตรวจสอบ query parameter สำหรับ download
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    // สร้าง response headers
    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
    };

    if (download) {
      // บังคับให้ดาวน์โหลด
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(fileName)}"`;
    } else {
      // แสดงในเบราว์เซอร์ (ถ้าเป็นไฟล์ที่เบราว์เซอร์รองรับ)
      headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(fileName)}"`;
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error serving file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 