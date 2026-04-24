ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-24T11:47:33.034Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-24T11:47:33.028Z';--> statement-breakpoint
ALTER TABLE "rider" ADD COLUMN "plan_end_date" varchar(50) DEFAULT '';