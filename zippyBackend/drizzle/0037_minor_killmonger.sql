ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-21T08:46:34.448Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-21T08:46:34.425Z';--> statement-breakpoint
ALTER TABLE "rider" ADD COLUMN "type" varchar(50) DEFAULT 'Regular';