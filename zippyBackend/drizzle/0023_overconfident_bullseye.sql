ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-20T08:18:49.020Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-20T08:18:49.013Z';--> statement-breakpoint
ALTER TABLE "stable" ADD COLUMN "horses" varchar(255)[] DEFAULT '{}';