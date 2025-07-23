-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WANT_TO_PLAY', 'PLAYING', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('WANT_TO_WATCH', 'WATCHING', 'WATCHED', 'DROPPED');

-- CreateEnum
CREATE TYPE "QuickReview" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "avatar_url" TEXT,
    "timezone" VARCHAR(50) DEFAULT 'UTC',
    "theme_preference" VARCHAR(20) DEFAULT 'system',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "igdb_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "cover_url" TEXT,
    "banner_url" TEXT,
    "release_date" TIMESTAMP(3),
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "developer" TEXT,
    "publisher" TEXT,
    "game_engine" TEXT,
    "esrb_rating" TEXT,
    "website" TEXT,
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "franchise" TEXT,
    "rating" DOUBLE PRECISION,
    "total_rating" DOUBLE PRECISION,
    "aggregated_rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artworks" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "original_title" TEXT,
    "cover_url" TEXT,
    "backdrop_url" TEXT,
    "release_date" TIMESTAMP(3),
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "director" TEXT,
    "cast" JSONB,
    "runtime" INTEGER,
    "rating" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "budget" BIGINT,
    "revenue" BIGINT,
    "homepage" TEXT,
    "imdb_id" TEXT,
    "tagline" TEXT,
    "status" TEXT,
    "original_language" TEXT,
    "popularity" DOUBLE PRECISION,
    "certification" TEXT,
    "trailer_key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_movies" (
    "id" SERIAL NOT NULL,
    "status" "MovieStatus" NOT NULL DEFAULT 'WANT_TO_WATCH',
    "personal_rating" INTEGER,
    "quick_review" "QuickReview",
    "notes" TEXT,
    "watched_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,

    CONSTRAINT "user_movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_games" (
    "id" SERIAL NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WANT_TO_PLAY',
    "personal_rating" INTEGER,
    "quick_review" "QuickReview",
    "user_platform" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "user_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_api_credentials" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "api_provider" VARCHAR(50) NOT NULL,
    "api_key" TEXT,
    "client_id" TEXT,
    "client_secret" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_api_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "games_igdb_id_key" ON "games"("igdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_movies_user_id_movie_id_key" ON "user_movies"("user_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_games_user_id_game_id_key" ON "user_games"("user_id", "game_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_api_credentials_user_id_api_provider_key" ON "user_api_credentials"("user_id", "api_provider");

-- AddForeignKey
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_api_credentials" ADD CONSTRAINT "user_api_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
