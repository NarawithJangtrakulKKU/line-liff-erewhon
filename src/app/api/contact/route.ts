import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AttachedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

export interface ContactSubmission {
  id: string;
  selectedIssue: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  attachments: AttachedFile[];
  submittedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { selectedIssue, name, phone, email, message, attachments } = body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!selectedIssue || !name || !phone || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // สร้าง contact submission ใหม่ในฐานข้อมูล
    const newContact = await prisma.contact.create({
      data: {
        selectedIssue,
        name,
        phone,
        email,
        message,
      }
    });
    
    // สร้างไฟล์แนบ (ถ้ามี)
    if (attachments && attachments.length > 0) {
      await prisma.contactAttachment.createMany({
        data: attachments.map((attachment: AttachedFile) => ({
          contactId: newContact.id,
          fileName: attachment.name,
          fileType: attachment.type,
          fileSize: attachment.size,
          base64Data: attachment.base64
        }))
      });
    }
    
    // ดึงข้อมูลที่สร้างใหม่พร้อมไฟล์แนบ
    const contactWithAttachments = await prisma.contact.findUnique({
      where: { id: newContact.id },
      include: { attachments: true }
    });
    
    if (!contactWithAttachments) {
      throw new Error('Failed to retrieve created contact');
    }
    
    // แปลงข้อมูลให้ตรงกับ interface เดิม
    const responseData: ContactSubmission = {
      id: contactWithAttachments.id,
      selectedIssue: contactWithAttachments.selectedIssue,
      name: contactWithAttachments.name,
      phone: contactWithAttachments.phone,
      email: contactWithAttachments.email,
      message: contactWithAttachments.message,
      attachments: contactWithAttachments.attachments.map((att: any) => ({
        name: att.fileName,
        size: att.fileSize,
        type: att.fileType,
        base64: att.base64Data
      })),
      submittedAt: contactWithAttachments.createdAt.toISOString()
    };
    
    console.log('New contact submission saved to database:', {
      id: contactWithAttachments.id,
      selectedIssue: contactWithAttachments.selectedIssue,
      name: contactWithAttachments.name,
      attachmentCount: contactWithAttachments.attachments.length
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'ส่งข้อความสำเร็จ',
      data: responseData 
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueType = searchParams.get('issueType');
    
    // สร้างเงื่อนไขกรอง
    const whereClause = issueType && issueType !== 'all' 
      ? { selectedIssue: issueType }
      : {};
    
    // ดึงข้อมูลจากฐานข้อมูล
    const contacts = await prisma.contact.findMany({
      where: whereClause,
      include: {
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // แปลงข้อมูลให้ตรงกับ interface เดิม
    const responseData: ContactSubmission[] = contacts.map((contact: any) => ({
      id: contact.id,
      selectedIssue: contact.selectedIssue,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      message: contact.message,
      attachments: contact.attachments.map((att: any) => ({
        name: att.fileName,
        size: att.fileSize,
        type: att.fileType,
        base64: att.base64Data
      })),
      submittedAt: contact.createdAt.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      data: responseData,
      total: responseData.length
    });
    
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
} 