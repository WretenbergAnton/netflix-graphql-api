/*
  Warnings:

  - Added the required column `created_by` to the `movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "created_by" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "movies_created_by_idx" ON "movies"("created_by");

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
