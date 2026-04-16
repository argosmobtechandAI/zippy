ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-16T08:29:33.021Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-16T08:29:33.014Z';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "leaves" jsonb DEFAULT '[]'::jsonb;