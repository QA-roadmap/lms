-- DropIndex
DROP INDEX "UserProgress_userId_lessonSlug_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lifetimeAccess",
DROP COLUMN "subscriptionId",
DROP COLUMN "subscriptionStatus";

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "courseSlug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_userId_courseSlug_key" ON "Purchase"("userId", "courseSlug");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_courseSlug_lessonSlug_key" ON "UserProgress"("userId", "courseSlug", "lessonSlug");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

