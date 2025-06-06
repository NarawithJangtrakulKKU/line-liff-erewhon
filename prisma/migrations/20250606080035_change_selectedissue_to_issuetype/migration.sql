/*
  Warnings:

  - You are about to drop the column `selectedIssue` on the `contacts` table. All the data in the column will be lost.
  - Added the required column `issueType` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "selectedIssue",
ADD COLUMN     "issueType" TEXT NOT NULL;
