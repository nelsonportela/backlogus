/*
  Warnings:

  - You are about to drop the column `average_rating` on the `books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "average_rating",
ADD COLUMN     "rating" DOUBLE PRECISION;
