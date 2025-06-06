import { NextRequest, NextResponse } from 'next/server';

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

// ใช้ in-memory storage สำหรับ development
let contactSubmissions: ContactSubmission[] = [];

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
    
    // สร้าง submission ใหม่
    const newSubmission: ContactSubmission = {
      id: Date.now().toString(),
      selectedIssue,
      name,
      phone,
      email,
      message,
      attachments: attachments || [],
      submittedAt: new Date().toISOString()
    };
    
    // เพิ่มลงใน array
    contactSubmissions.push(newSubmission);
    
    console.log('New contact submission:', {
      ...newSubmission,
      attachments: newSubmission.attachments.map(att => ({
        name: att.name,
        size: att.size,
        type: att.type
      }))
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'ส่งข้อความสำเร็จ',
      data: newSubmission 
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
    
    let filteredSubmissions = contactSubmissions;
    
    if (issueType && issueType !== 'all') {
      filteredSubmissions = contactSubmissions.filter(
        submission => submission.selectedIssue === issueType
      );
    }
    
    return NextResponse.json({
      success: true,
      data: filteredSubmissions,
      total: filteredSubmissions.length
    });
    
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
} 