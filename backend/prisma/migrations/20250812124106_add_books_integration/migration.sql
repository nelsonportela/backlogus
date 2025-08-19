-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "hardcover_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "cover_url" TEXT,
    "release_date" TIMESTAMP(3),
    "description" TEXT,
    "isbn" TEXT,
    "isbn13" TEXT,
    "pages" INTEGER,
    "language" TEXT,
    "publisher" TEXT,
    "published_date" TIMESTAMP(3),
    "authors" JSONB,
    "series" TEXT,
    "series_position" DOUBLE PRECISION,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "average_rating" DOUBLE PRECISION,
    "ratings_count" INTEGER,
    "goodreads_id" TEXT,
    "amazon_url" TEXT,
    "worldcat_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_books" (
    "id" SERIAL NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'BACKLOG',
    "quick_review" "QuickReview",
    "current_page" INTEGER,
    "format" TEXT,
    "notes" TEXT,
    "started_date" TIMESTAMP(3),
    "finished_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,

    CONSTRAINT "user_books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "books_hardcover_id_key" ON "books"("hardcover_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_books_user_id_book_id_key" ON "user_books"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
