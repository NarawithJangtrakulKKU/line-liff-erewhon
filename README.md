# 🛍️ LINE LIFF E-commerce App (Next.js)

โปรเจกต์นี้เป็นระบบจัดการสินค้าผ่าน LINE LIFF (LINE Front-end Framework) ที่ใช้ [Next.js](https://nextjs.org/) พัฒนาด้วย TypeScript โดยรองรับการแสดงผลและจัดการสินค้าผ่าน LINE Application พร้อมระบบจัดการฐานข้อมูลด้วย Prisma และ UI ที่ทันสมัยด้วย Tailwind CSS

## 🚀 Features

- แสดงผลสินค้าผ่าน LINE LIFF
- จัดการสินค้า (Products): เพิ่ม, แก้ไข, ลบ, ดูรายละเอียด
- จัดการหมวดหมู่ (Categories): เพิ่ม, แก้ไข, ลบ
- ระบบตะกร้าสินค้า (Cart)
- UI/UX ทันสมัย Responsive ด้วย Tailwind CSS
- รองรับการเชื่อมต่อกับ LINE Platform
- ระบบ Authentication ด้วย LINE Login
- รองรับการแสดงผลบน LINE Application

## 🛠️ Tech Stack

- [Next.js 15](https://nextjs.org/) (Frontend)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/) (Database)
- [Tailwind CSS](https://tailwindcss.com/)
- [LINE LIFF](https://developers.line.biz/en/docs/liff/overview/)
- [React](https://reactjs.org/)

---

## 📦 การติดตั้งและรันโปรเจกต์

### 1. Clone โปรเจกต์นี้ลงเครื่อง

```bash
git clone https://github.com/NarawithJangtrakulKKU/line-liff-erewhon.git
cd line-liff-erewhon
```

### 2. ติดตั้ง dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์หลักของโปรเจกต์ โดยมีค่าตัวอย่างดังนี้:

```env
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb?schema=public"

# LINE LIFF
NEXT_PUBLIC_LIFF_ID="your-liff-id"
```

### 4. รัน Prisma Migration

```bash
npx prisma migrate dev
```

### 5. รัน Development Server

```bash
npm run dev
```

### 6. เปิด Browser หรือ LINE Application

```
http://localhost:3000
```

---

## 📝 โครงสร้างข้อมูล (Database Schema)

- **Product**: id, name, description, price, image, categoryId, createdAt, updatedAt
- **Category**: id, name, createdAt, updatedAt
- **Cart**: id, userId, productId, quantity, createdAt, updatedAt

---

## 📋 ตัวอย่าง API Endpoint

- `GET /api/products` — ดึงรายการสินค้า
- `POST /api/products` — เพิ่มสินค้า
- `PUT /api/products/:id` — แก้ไขสินค้า
- `DELETE /api/products/:id` — ลบสินค้า
- `GET /api/categories` — ดึงหมวดหมู่
- `GET /api/cart` — ดึงข้อมูลตะกร้าสินค้า
- `POST /api/cart` — เพิ่มสินค้าลงตะกร้า

---

## 🖼️ การอัพโหลดและแสดงผลรูปภาพ
- อัพโหลดไฟล์ภาพผ่านฟอร์ม
- เก็บไฟล์ไว้ใน `/public` directory
- แสดงผลรูปภาพผ่าน Next.js Image Component

---

## 👨‍💻 ผู้พัฒนา

โปรเจกต์นี้พัฒนาโดย นราวิชญ์ จังตระกูล

หากมีข้อเสนอแนะ หรือต้องการพูดคุยเกี่ยวกับโปรเจกต์นี้ สามารถติดต่อมาได้เลยครับ 🙌
