/*
  Warnings:

  - Added the required column `purpose` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "purpose" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "VerificationToken_identifier_purpose_idx" ON "VerificationToken"("identifier", "purpose");
