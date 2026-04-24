ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-24T08:44:35.946Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-24T08:44:35.937Z';--> statement-breakpoint
ALTER TABLE "revenue" ADD COLUMN "plan_key" varchar(255);