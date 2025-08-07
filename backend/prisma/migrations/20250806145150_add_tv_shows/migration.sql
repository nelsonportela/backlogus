-- CreateEnum
CREATE TYPE "ShowStatus" AS ENUM ('WANT_TO_WATCH', 'WATCHING', 'WATCHED', 'DROPPED');

-- CreateTable
CREATE TABLE "shows" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "original_name" TEXT,
    "cover_url" TEXT,
    "backdrop_url" TEXT,
    "first_air_date" TIMESTAMP(3),
    "last_air_date" TIMESTAMP(3),
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "networks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creators" JSONB,
    "cast" JSONB,
    "seasons" INTEGER,
    "episodes" INTEGER,
    "episode_runtime" INTEGER,
    "rating" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "homepage" TEXT,
    "imdb_id" TEXT,
    "tagline" TEXT,
    "status" TEXT,
    "type" TEXT,
    "original_language" TEXT,
    "popularity" DOUBLE PRECISION,
    "certification" TEXT,
    "trailer_key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_shows" (
    "id" SERIAL NOT NULL,
    "status" "ShowStatus" NOT NULL DEFAULT 'WANT_TO_WATCH',
    "quick_review" "QuickReview",
    "current_season" INTEGER,
    "current_episode" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "show_id" INTEGER NOT NULL,

    CONSTRAINT "user_shows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shows_tmdb_id_key" ON "shows"("tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_shows_user_id_show_id_key" ON "user_shows"("user_id", "show_id");

-- AddForeignKey
ALTER TABLE "user_shows" ADD CONSTRAINT "user_shows_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_shows" ADD CONSTRAINT "user_shows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
