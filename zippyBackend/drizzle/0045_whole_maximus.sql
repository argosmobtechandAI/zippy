ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-31T02:58:29.017Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-31T02:58:29.008Z';--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "schedule_sessions" uuid[] DEFAULT '{}';