/*
  Warnings:

  - You are about to drop the column `amazon_url` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `goodreads_id` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `isbn` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `isbn13` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `published_date` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `ratings_count` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `worldcat_url` on the `books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "amazon_url",
DROP COLUMN "goodreads_id",
DROP COLUMN "isbn",
DROP COLUMN "isbn13",
DROP COLUMN "language",
DROP COLUMN "published_date",
DROP COLUMN "publisher",
DROP COLUMN "ratings_count",
DROP COLUMN "worldcat_url",
ADD COLUMN     "alternative_titles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "has_audiobook" BOOLEAN DEFAULT false,
ADD COLUMN     "has_ebook" BOOLEAN DEFAULT false,
ADD COLUMN     "moods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "series_names" TEXT[] DEFAULT ARRAY[]::TEXT[];
