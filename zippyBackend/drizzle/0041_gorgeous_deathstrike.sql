ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-22T08:37:48.153Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-22T08:37:48.124Z';--> statement-breakpoint
ALTER TABLE "rider" ADD COLUMN "code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "rider" ADD CONSTRAINT "rider_code_unique" UNIQUE("code");