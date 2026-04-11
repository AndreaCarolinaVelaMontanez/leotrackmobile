-- CreateIndex
CREATE INDEX "progress_logs_user_book_id_created_at_idx" ON "progress_logs"("user_book_id", "created_at");

-- CreateIndex
CREATE INDEX "reading_sessions_user_book_id_started_at_idx" ON "reading_sessions"("user_book_id", "started_at");

-- CreateIndex
CREATE INDEX "user_books_user_id_status_idx" ON "user_books"("user_id", "status");
