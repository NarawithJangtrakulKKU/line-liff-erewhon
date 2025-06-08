import { AttachmentType } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

/**
 * กำหนดประเภทไฟล์แนบจาก MIME type
 */
export function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith('image/')) {
    return AttachmentType.IMAGE;
  } else if (mimeType === 'application/pdf') {
    return AttachmentType.PDF;
  } else if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return AttachmentType.DOC;
  } else {
    // Default fallback
    return AttachmentType.DOC;
  }
}

/**
 * กำหนด folder path จากประเภทไฟล์
 */
export function getAttachmentFolder(attachmentType: AttachmentType): string {
  switch (attachmentType) {
    case AttachmentType.IMAGE:
      return 'images';
    case AttachmentType.PDF:
      return 'pdf';
    case AttachmentType.DOC:
      return 'doc';
    default:
      return 'doc';
  }
}

/**
 * สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const nameWithoutExtension = path.basename(originalName, extension);
  
  return `${nameWithoutExtension}_${timestamp}_${randomString}${extension}`;
}

/**
 * บันทึกไฟล์ไปยัง public/attachment/[folder]/
 */
export async function saveAttachmentFile(
  base64Data: string,
  fileName: string,
  mimeType: string
): Promise<{ filePath: string; attachmentType: AttachmentType }> {
  try {
    // กำหนดประเภทและโฟลเดอร์
    const attachmentType = getAttachmentType(mimeType);
    const folder = getAttachmentFolder(attachmentType);
    
    // สร้างชื่อไฟล์ใหม่
    const uniqueFileName = generateUniqueFileName(fileName);
    
    // สร้าง path เต็ม
    const publicPath = path.join(process.cwd(), 'public', 'attachment', folder);
    const fullPath = path.join(publicPath, uniqueFileName);
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    await fs.mkdir(publicPath, { recursive: true });
    
    // แปลง base64 เป็น buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // บันทึกไฟล์
    await fs.writeFile(fullPath, buffer);
    
    // return path สำหรับเก็บใน database (relative path)
    const relativePath = `/${folder}/${uniqueFileName}`;
    
    return {
      filePath: relativePath,
      attachmentType
    };
  } catch (error) {
    console.error('Error saving attachment file:', error);
    throw new Error('Failed to save attachment file');
  }
}

/**
 * ลบไฟล์แนบ
 */
export async function deleteAttachmentFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting attachment file:', error);
    // ไม่ throw error เพราะไฟล์อาจไม่มีอยู่แล้ว
  }
} 