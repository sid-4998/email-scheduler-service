/*
  Warnings:

  - The values [SCHEDULED,CANCELLED] on the enum `EmailStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `hourlyLimit` on the `EmailSender` table. All the data in the column will be lost.
  - You are about to drop the column `retryCount` on the `ScheduledEmail` table. All the data in the column will be lost.
  - Added the required column `defaultHourlyLimit` to the `EmailSender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delayBetweenMs` to the `ScheduledEmail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourlyLimit` to the `ScheduledEmail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'DELAYED', 'SENT', 'FAILED');
ALTER TABLE "public"."ScheduledEmail" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ScheduledEmail" ALTER COLUMN "status" TYPE "EmailStatus_new" USING ("status"::text::"EmailStatus_new");
ALTER TYPE "EmailStatus" RENAME TO "EmailStatus_old";
ALTER TYPE "EmailStatus_new" RENAME TO "EmailStatus";
DROP TYPE "public"."EmailStatus_old";
ALTER TABLE "ScheduledEmail" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "EmailSendLog" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "providerMessageId" TEXT;

-- AlterTable
ALTER TABLE "EmailSender" DROP COLUMN "hourlyLimit",
ADD COLUMN     "defaultHourlyLimit" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledEmail" DROP COLUMN "retryCount",
ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "delayBetweenMs" INTEGER NOT NULL,
ADD COLUMN     "hourlyLimit" INTEGER NOT NULL,
ADD COLUMN     "messageId" TEXT,
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ScheduledEmail_senderId_scheduledFor_idx" ON "ScheduledEmail"("senderId", "scheduledFor");
