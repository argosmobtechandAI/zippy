CREATE TABLE "batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"timing" varchar(255) NOT NULL,
	"date" varchar(50) NOT NULL,
	"joining_amount" integer NOT NULL,
	"duration" varchar(50) NOT NULL,
	"location" varchar(255) NOT NULL,
	"note" varchar(500),
	"status" varchar(50) DEFAULT 'ACTIVE'
);
--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-14T09:41:57.816Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-14T09:41:57.810Z';