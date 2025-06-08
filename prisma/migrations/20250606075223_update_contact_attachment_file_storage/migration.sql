/*
  Warnings:

  - You are about to drop the column `base64Data` on the `contact_attachments` table. All the data in the column will be lost.
  - Added the required column `attachmentType` to the `contact_attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `contact_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'PDF', 'DOC');

-- AlterTable
ALTER TABLE "contact_attachments" DROP COLUMN "base64Data",
ADD COLUMN     "attachmentType" "AttachmentType" NOT NULL,
ADD COLUMN     "filePath" TEXT NOT NULL;
