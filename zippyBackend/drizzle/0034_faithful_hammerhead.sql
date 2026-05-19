ALTER TABLE "sessions" RENAME COLUMN "horse" TO "horse_id";--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-14T12:53:02.788Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-14T12:53:02.782Z';--> statement-breakpoint
ALTER TABLE "batches" DROP COLUMN "horse";