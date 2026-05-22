ALTER TABLE "rider" RENAME COLUMN "type" TO "rider_type";--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-21T10:37:50.627Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-21T10:37:50.614Z';