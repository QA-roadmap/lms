-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "invoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_invoiceId_key" ON "Purchase"("invoiceId");
