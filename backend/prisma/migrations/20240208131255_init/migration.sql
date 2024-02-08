-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_meetingId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meetingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
