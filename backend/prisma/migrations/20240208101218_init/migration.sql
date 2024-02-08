/*
  Warnings:

  - Added the required column `topic` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "description" TEXT,
ADD COLUMN     "topic" TEXT NOT NULL;
