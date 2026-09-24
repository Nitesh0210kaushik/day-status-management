ALTER TABLE "refresh_tokens" RENAME TO "sessions";
ALTER TABLE "sessions" RENAME CONSTRAINT "refresh_tokens_pkey" TO "sessions_pkey";
ALTER INDEX "refresh_tokens_token_hash_key" RENAME TO "sessions_token_hash_key";
ALTER INDEX "refresh_tokens_user_id_idx" RENAME TO "sessions_user_id_idx";
ALTER INDEX "refresh_tokens_expires_at_idx" RENAME TO "sessions_expires_at_idx";
ALTER TABLE "sessions" RENAME CONSTRAINT "refresh_tokens_user_id_fkey" TO "sessions_user_id_fkey";
