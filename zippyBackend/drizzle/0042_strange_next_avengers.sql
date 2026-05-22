ALTER TABLE "batches" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "batches" CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_batchs_id_batches_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-22T10:47:21.116Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-22T10:47:21.104Z';--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "joining_amount";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "batchs_id";