import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';
import { saveAttachmentFile } from '@/lib/fileUtils';

// ✅ POST: สร้างข้อมูลการติดต่อใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      issueType,
      message,
      attachments = [] // Array of { fileName, fileType, fileSize, base64Data }
    } = body;

    console.log('📝 Creating new contact with data:', {
      name,
      email,
      phone,
      issueType,
      message,
      attachmentCount: attachments.length
    });

    // สร้างข้อมูลการติดต่อในฐานข้อมูล
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        issueType,
        message,
        status: ContactStatus.PENDING,
      },
    });

    // บันทึกไฟล์แนบ (ถ้ามี)
    if (attachments.length > 0) {
      const attachmentPromises = attachments.map(async (attachment: any) => {
        try {
          // บันทึกไฟล์จริงในระบบ
          const { filePath, attachmentType } = await saveAttachmentFile(
            attachment.base64Data,
            attachment.fileName,
            attachment.fileType
          );

          // สร้างข้อมูลไฟล์แนบในฐานข้อมูล
          return prisma.contactAttachment.create({
            data: {
              contactId: contact.id,
              fileName: attachment.fileName,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
              filePath: filePath,
              attachmentType: attachmentType,
            },
          });
        } catch (error) {
          console.error('❌ Error saving attachment:', error);
          // ไม่ทำให้ process ล้มเหลว แต่ log error
          return null;
        }
      });

      // รอให้บันทึกไฟล์แนบทั้งหมดเสร็จ
      await Promise.all(attachmentPromises);
    }

    console.log('✅ Contact created successfully with ID:', contact.id);

    return NextResponse.json({
      success: true,
      message: 'ส่งข้อความติดต่อเรียบร้อยแล้ว',
      data: contact,
    });

  } catch (error) {
    console.error('❌ Error creating contact:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่งข้อความติดต่อ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ✅ GET: ดึงข้อมูลการติดต่อทั้งหมด (สำหรับหน้า Admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueType = searchParams.get('issueType');

    console.log('📋 Fetching contacts with filters:', { issueType });

    // สร้าง where clause
    const whereClause = issueType && issueType !== 'all' ? { issueType } : {};

    // ดึงข้อมูลจากฐานข้อมูล
    const contacts = await prisma.contact.findMany({
      where: whereClause,
      include: {
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            filePath: true,
            attachmentType: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Found contacts:', contacts.length);

    return NextResponse.json({
      success: true,
      data: contacts,
    });

  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการติดต่อ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 