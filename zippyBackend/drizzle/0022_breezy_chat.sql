ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-20T08:17:14.983Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-20T08:17:14.978Z';--> statement-breakpoint
ALTER TABLE "stable" DROP COLUMN "horse";