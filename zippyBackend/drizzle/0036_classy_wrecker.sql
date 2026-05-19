ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-15T07:03:23.551Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-15T07:03:23.545Z';--> statement-breakpoint
ALTER TABLE "stable" ADD COLUMN "logo" varchar(255);