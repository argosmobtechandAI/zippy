ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-24T10:46:26.217Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-24T10:46:26.201Z';--> statement-breakpoint
ALTER TABLE "revenue" ADD COLUMN "status" varchar(50) DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "revenue" ADD COLUMN "end_date" varchar(50);