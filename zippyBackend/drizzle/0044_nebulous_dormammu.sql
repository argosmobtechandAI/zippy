ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-31T02:43:59.649Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-31T02:43:59.638Z';--> statement-breakpoint
ALTER TABLE "rider" ADD COLUMN "wallet" integer DEFAULT 0;