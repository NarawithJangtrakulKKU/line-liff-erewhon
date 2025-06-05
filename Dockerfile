# ระบุ base image สำหรับ Node.js
FROM node:20-alpine

# ตั้งค่า working directory ใน container
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (หรือ yarn.lock) มาที่ /app
COPY package.json package-lock.json* ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์โปรเจ็กต์ทั้งหมดไปยัง container
COPY . .

# สร้าง Prisma client
RUN npx prisma generate

# สร้างแอปพลิเคชัน Next.js แบบ production-ready
RUN npm run build

# เปิดพอร์ตสำหรับการเข้าถึงแอป
EXPOSE 3000

# คำสั่งเริ่มต้นในการรันแอปพลิเคชัน
CMD ["npm", "start"]