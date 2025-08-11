/*
  Warnings:

  - The `status` column on the `user_games` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `user_movies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `user_shows` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'DROPPED', 'BACKLOG');

-- AlterTable
ALTER TABLE "user_games" DROP COLUMN "status",
ADD COLUMN     "status" "MediaStatus" NOT NULL DEFAULT 'BACKLOG';

-- AlterTable
ALTER TABLE "user_movies" DROP COLUMN "status",
ADD COLUMN     "status" "MediaStatus" NOT NULL DEFAULT 'BACKLOG';

-- AlterTable
ALTER TABLE "user_shows" DROP COLUMN "status",
ADD COLUMN     "status" "MediaStatus" NOT NULL DEFAULT 'BACKLOG';

-- DropEnum
DROP TYPE "GameStatus";

-- DropEnum
DROP TYPE "MovieStatus";

-- DropEnum
DROP TYPE "ShowStatus";
