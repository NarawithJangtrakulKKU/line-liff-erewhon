# 🛍️ LINE LIFF E-commerce App (Next.js)

โปรเจกต์นี้เป็นระบบจัดการสินค้าออนไลน์ผ่าน LINE LIFF (LINE Front-end Framework) ที่ใช้ [Next.js 15](https://nextjs.org/) พัฒนาด้วย TypeScript โดยรองรับการแสดงผลและจัดการสินค้าผ่าน LINE Application พร้อมระบบจัดการฐานข้อมูลด้วย Prisma และ UI ที่ทันสมัยด้วย Tailwind CSS

## 🚀 Features

### สำหรับลูกค้า (Customer)
- 🔐 ระบบ Authentication ด้วย LINE Login
- 🛍️ ดูรายการสินค้าและหมวดหมู่
- 🔍 ค้นหาสินค้า
- 🛒 ระบบตะกร้าสินค้า (Cart)
- 💳 ระบบชำระเงิน (Payment)
- 📋 ประวัติการสั่งซื้อ
- 👤 จัดการข้อมูลส่วนตัวและที่อยู่
- ⭐ ระบบรีวิวสินค้า
- 📞 ติดต่อสอบถาม
- 🎁 ระบบบัตรของขวัญ

### สำหรับแอดมิน (Admin)
- 📦 จัดการสินค้า (Products): เพิ่ม, แก้ไข, ลบ, ดูรายละเอียด
- 📁 จัดการหมวดหมู่ (Categories): เพิ่ม, แก้ไข, ลบ
- 📊 ระบบจัดการคำสั่งซื้อ
- 👥 จัดการผู้ใช้
- 📈 รายงานและสถิติ
- 💬 จัดการข้อความติดต่อ

### คุณสมบัติทั่วไป
- 📱 UI/UX ทันสมัย Responsive ด้วย Tailwind CSS
- 🔗 รองรับการเชื่อมต่อกับ LINE Platform
- 🖼️ ระบบอัพโหลดรูปภาพ
- 📧 ระบบแจ้งเตือน
- 🌐 รองรับการแสดงผลบน LINE Application

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **LINE Integration**: [LINE LIFF](https://developers.line.biz/en/docs/liff/overview/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Media Processing**: [FFmpeg](https://ffmpeg.org/)
- **Authentication**: [JWT](https://jwt.io/)

---

## 📋 ข้อกำหนดเบื้องต้น

ก่อนเริ่มติดตั้งโปรเจกต์ ตรวจสอบให้แน่ใจว่าคุณมีสิ่งต่อไปนี้:

- [Node.js](https://nodejs.org/) เวอร์ชัน 18.17 หรือใหม่กว่า
- [npm](https://www.npmjs.com/) หรือ [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) และ [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)
- LINE Developer Account (สำหรับ LIFF ID)

---

## 📦 การติดตั้งและรันโปรเจกต์

### 1. Clone โปรเจกต์นี้ลงเครื่อง

```bash
git clone https://github.com/NarawithJangtrakulKKU/line-liff-erewhon.git
cd line-liff-erewhon
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลักของโปรเจกต์:

```bash
touch .env
```

เพิ่มค่าต่อไปนี้ในไฟล์ `.env`:

```env
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb?schema=public"

# LINE LIFF
NEXT_PUBLIC_LIFF_ID="your-liff-id"

# JWT Secret (สำหรับ Authentication)
JWT_SECRET="your-super-secret-jwt-key"

# Upload Configuration
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **หมายเหตุ**: แทนที่ `your-liff-id` ด้วย LIFF ID จริงจาก LINE Developers Console

### 4. รัน PostgreSQL Database ด้วย Docker

```bash
# รัน PostgreSQL และ pgAdmin
docker-compose up -d postgres pgadmin
```

หลังจากรันคำสั่งนี้แล้ว:
- PostgreSQL จะรันที่พอร์ต `5432`
- pgAdmin จะรันที่ `http://localhost:5050`
  - Email: `admin@admin.com`
  - Password: `root`

### 5. รัน Prisma Migration

```bash
# สร้าง Database Schema
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 6. เพิ่มข้อมูลตัวอย่าง (Optional)

```bash
# Seed ข้อมูลตัวอย่าง (ถ้ามี seed file)
npx prisma db seed
```

### 7. รัน Development Server

```bash
npm run dev
```

### 8. เปิด Application

เปิดเบราว์เซอร์และเข้าไปที่:
```
http://localhost:3000
```

---

## 🔧 การตั้งค่า LINE LIFF

### 1. สร้าง LINE Channel

1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่ประเภท "LINE Login"

### 2. ตั้งค่า LIFF App

1. ไปที่ Tab "LIFF"
2. คลิก "Add" เพื่อสร้าง LIFF App ใหม่
3. กรอกข้อมูล:
   - **LIFF app name**: ชื่อแอป
   - **Size**: Full
   - **Endpoint URL**: `https://your-domain.com` (สำหรับ production) หรือ `https://your-ngrok-url.ngrok.io` (สำหรับ development)
   - **Scope**: profile, openid
   - **Bot feature**: Aggressive (ถ้าต้องการ)

### 3. ใช้งาน LIFF ID

คัดลอก LIFF ID และนำไปใส่ในไฟล์ `.env`:
```env
NEXT_PUBLIC_LIFF_ID="your-liff-id-here"
```

---

## 🌐 การรันบน Production

### 1. Build Application

```bash
npm run build
```

### 2. รันด้วย Docker (แนะนำ)

```bash
# Build และรัน Application ด้วย Docker
docker-compose up -d
```

### 3. รันด้วย PM2 (Alternative)

```bash
# ติดตั้ง PM2
npm install -g pm2

# Build และ Start
npm run build
pm2 start npm --name "line-liff-app" -- start
```

---

## 📱 วิธีการใช้งาน

### สำหรับลูกค้า (Customer)

#### 1. เข้าสู่ระบบ
- เปิด LINE Application
- เข้าไปที่ LIFF URL หรือ Rich Menu
- ระบบจะ Login อัตโนมัติด้วย LINE Account

#### 2. ดูสินค้า
- หน้าแรก: แสดงสินค้าแนะนำและหมวดหมู่
- หมวดหมู่: คลิกเพื่อดูสินค้าในหมวดหมู่นั้น ๆ
- ค้นหา: ใช้ Search Box ด้านบน

#### 3. เพิ่มสินค้าลงตะกร้า
- คลิกที่สินค้าเพื่อดูรายละเอียด
- เลือกจำนวน
- คลิก "เพิ่มลงตะกร้า"

#### 4. ชำระเงิน
- ไปที่ตะกร้าสินค้า
- ตรวจสอบรายการ
- กรอกข้อมูลการจัดส่ง
- เลือกวิธีการชำระเงิน
- ยืนยันการสั่งซื้อ

#### 5. ติดตามการสั่งซื้อ
- ไปที่ "ประวัติการสั่งซื้อ"
- ดูสถานะการสั่งซื้อ
- ดาวน์โหลดใบเสร็จ

### สำหรับแอดมิน (Admin)

#### 1. เข้าสู่ระบบแอดมิน
- เข้าไปที่ `/admin`
- Login ด้วย Admin Account

#### 2. จัดการสินค้า
- **เพิ่มสินค้า**:
  - ไปที่ "จัดการสินค้า" > "เพิ่มสินค้าใหม่"
  - กรอกข้อมูลสินค้า (ชื่อ, คำอธิบาย, ราคา, รูปภาพ)
  - เลือกหมวดหมู่
  - บันทึก

- **แก้ไขสินค้า**:
  - คลิกที่สินค้าที่ต้องการแก้ไข
  - แก้ไขข้อมูล
  - บันทึก

- **ลบสินค้า**:
  - คลิกปุ่ม "ลบ" ที่สินค้า
  - ยืนยันการลบ

#### 3. จัดการหมวดหมู่
- **เพิ่มหมวดหมู่**: กรอกชื่อหมวดหมู่และคำอธิบาย
- **แก้ไขหมวดหมู่**: คลิกเพื่อแก้ไข
- **จัดเรียงหมวดหมู่**: ลากและวางเพื่อเรียงลำดับ

#### 4. จัดการคำสั่งซื้อ
- ดูรายการคำสั่งซื้อทั้งหมด
- อัพเดทสถานะการสั่งซื้อ
- พิมพ์ใบสั่งซื้อ
- จัดการการจัดส่ง

---

## 🗂️ โครงสร้างโปรเจกต์

```
line-liff-erewhon/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── products/      # Product APIs
│   │   │   ├── categories/    # Category APIs
│   │   │   ├── cart/          # Cart APIs
│   │   │   ├── orders/        # Order APIs
│   │   │   ├── auth/          # Authentication APIs
│   │   │   ├── user/          # User APIs
│   │   │   └── admin/         # Admin APIs
│   │   ├── admin/             # Admin Dashboard
│   │   ├── products/          # Product Pages
│   │   ├── cart/             # Cart Page
│   │   ├── checkout/         # Checkout Pages
│   │   ├── profile/          # User Profile
│   │   └── ...               # Other Pages
│   ├── components/           # Reusable Components
│   ├── lib/                 # Utility Functions
│   ├── hooks/               # Custom React Hooks
│   └── types.d.ts           # Type Definitions
├── prisma/
│   ├── schema.prisma         # Database Schema
│   └── migrations/           # Database Migrations
├── public/
│   ├── uploads/             # Uploaded Files
│   └── images/              # Static Images
├── docker-compose.yml        # Docker Configuration
├── Dockerfile               # Docker Build File
├── package.json             # Dependencies
└── README.md               # This File
```

---

## 📊 โครงสร้างฐานข้อมูล (Database Schema)

### หลักสำคัญ (Core Tables)
- **User**: ข้อมูลผู้ใช้ (id, lineUserId, displayName, email, role)
- **Category**: หมวดหมู่สินค้า (id, name, description, imageUrl)
- **Product**: สินค้า (id, name, description, price, image, categoryId, stock)
- **CartItem**: รายการในตะกร้า (id, userId, productId, quantity)
- **Order**: คำสั่งซื้อ (id, orderNumber, userId, status, total)
- **OrderItem**: รายการสินค้าในคำสั่งซื้อ (id, orderId, productId, quantity, price)

### เสริม (Supporting Tables)
- **Address**: ที่อยู่การจัดส่ง
- **Review**: รีวิวสินค้า
- **ProductImage**: รูปภาพสินค้า
- **Contact**: ข้อความติดต่อ

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` — Login ด้วย LINE
- `POST /api/auth/logout` — Logout
- `GET /api/auth/profile` — ดึงข้อมูลผู้ใช้

### Products
- `GET /api/products` — ดึงรายการสินค้า
- `GET /api/products/[id]` — ดึงรายละเอียดสินค้า
- `POST /api/products` — เพิ่มสินค้า (Admin)
- `PUT /api/products/[id]` — แก้ไขสินค้า (Admin)
- `DELETE /api/products/[id]` — ลบสินค้า (Admin)

### Categories
- `GET /api/categories` — ดึงหมวดหมู่
- `POST /api/categories` — เพิ่มหมวดหมู่ (Admin)
- `PUT /api/categories/[id]` — แก้ไขหมวดหมู่ (Admin)
- `DELETE /api/categories/[id]` — ลบหมวดหมู่ (Admin)

### Cart
- `GET /api/cart` — ดึงตะกร้าสินค้า
- `POST /api/cart` — เพิ่มสินค้าลงตะกร้า
- `PUT /api/cart/[id]` — อัพเดทจำนวนสินค้า
- `DELETE /api/cart/[id]` — ลบสินค้าจากตะกร้า

### Orders
- `GET /api/orders` — ดึงรายการคำสั่งซื้อ
- `POST /api/orders` — สร้างคำสั่งซื้อ
- `GET /api/orders/[id]` — ดึงรายละเอียดคำสั่งซื้อ
- `PUT /api/orders/[id]` — อัพเดทสถานะ (Admin)

---

## 🎨 การจัดการไฟล์และรูปภาพ

### การอัพโหลดรูปภาพ
1. รูปภาพจะถูกเก็บในโฟลเดอร์ `/public/uploads/`
2. ใช้ Next.js Image Component สำหรับแสดงผล
3. รองรับไฟล์ประเภท: JPG, PNG, WebP
4. ขนาดสูงสุด: 5MB

### โครงสร้างไฟล์
```
public/
├── uploads/
│   ├── products/          # รูปภาพสินค้า
│   ├── categories/        # รูปภาพหมวดหมู่
│   ├── avatars/          # รูปโปรไฟล์ผู้ใช้
│   └── reviews/          # รูปภาพรีวิว
```

---

## ⚡ Performance Optimization

### 1. Image Optimization
- ใช้ Next.js Image Component
- WebP format สำหรับรูปภาพใหม่
- Lazy loading สำหรับรูปภาพ

### 2. Database Optimization
- Indexing สำหรับคอลัมน์ที่ค้นหาบ่อย
- Pagination สำหรับรายการยาว
- Caching สำหรับข้อมูลที่ไม่เปลี่ยนแปลงบ่อย

### 3. Bundle Optimization
- Tree shaking
- Dynamic imports
- Code splitting

---

## 🐛 การแก้ไขปัญหาเบื้องต้น

### ปัญหาที่พบบ่อย

#### 1. ไม่สามารถเชื่อมต่อฐานข้อมูลได้
```bash
# ตรวจสอบว่า PostgreSQL รันอยู่หรือไม่
docker-compose ps

# รีสตาร์ท PostgreSQL
docker-compose restart postgres
```

#### 2. LIFF ไม่ทำงาน
- ตรวจสอบ LIFF ID ในไฟล์ `.env`
- ตรวจสอบว่า Endpoint URL ถูกต้อง
- ตรวจสอบ HTTPS (จำเป็นสำหรับ production)

#### 3. Upload ไฟล์ไม่ได้
```bash
# ตรวจสอบการ permission ของโฟลเดอร์
chmod 755 public/uploads

# สร้างโฟลเดอร์ถ้าไม่มี
mkdir -p public/uploads/products public/uploads/categories
```

#### 4. Build Error
```bash
# ลบ node_modules และ install ใหม่
rm -rf node_modules package-lock.json
npm install

# ลบ .next cache
rm -rf .next
npm run build
```

---

## 📚 เอกสารเพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs)
- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 การมีส่วนร่วม

หากต้องการมีส่วนร่วมในโปรเจกต์นี้:

1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

---

## 📄 License

โปรเจกต์นี้อยู่ภายใต้ MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)

---

## 👨‍💻 ผู้พัฒนา

**นราวิชญ์ จังตระกูล**
- Email: [email](mailto:narawith.j@kkumail.com)
- GitHub: [@NarawithJangtrakulKKU](https://github.com/NarawithJangtrakulKKU)

**ธราดล วิชัย**
- Email: [email](mailto:tharadol.w@kkumail.com)

**ศุภวรรณ เพ็ญศรี**
- Email: [email](mailto:supawan.p@kkumail.com)

---


**🙏 ขอบคุณที่ใช้งาน LINE LIFF E-commerce App! ที่มีต้นแบบมาจากเว็บไซต์ EREWON **
