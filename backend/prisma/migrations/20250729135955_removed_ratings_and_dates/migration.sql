/*
  Warnings:

  - You are about to drop the column `personal_rating` on the `user_games` table. All the data in the column will be lost.
  - You are about to drop the column `personal_rating` on the `user_movies` table. All the data in the column will be lost.
  - You are about to drop the column `watched_date` on the `user_movies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_games" DROP COLUMN "personal_rating";

-- AlterTable
ALTER TABLE "user_movies" DROP COLUMN "personal_rating",
DROP COLUMN "watched_date";
