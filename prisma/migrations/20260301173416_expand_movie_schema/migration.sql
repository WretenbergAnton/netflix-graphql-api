/*
  Warnings:

  - A unique constraint covering the columns `[show_id]` on the table `movies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `show_id` to the `movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "cast" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "date_added" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "popularity" DOUBLE PRECISION,
ADD COLUMN     "revenue" DOUBLE PRECISION,
ADD COLUMN     "show_id" TEXT NOT NULL,
ADD COLUMN     "vote_average" DOUBLE PRECISION,
ADD COLUMN     "vote_count" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "movies_show_id_key" ON "movies"("show_id");
