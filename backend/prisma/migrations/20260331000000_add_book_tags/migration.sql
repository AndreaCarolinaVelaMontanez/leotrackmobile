CREATE TABLE "book_tags" (
  "id" TEXT NOT NULL,
  "user_book_id" TEXT NOT NULL,
  "tag" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "book_tags_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "book_tags" ADD CONSTRAINT "book_tags_user_book_id_fkey"
  FOREIGN KEY ("user_book_id") REFERENCES "user_books"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
