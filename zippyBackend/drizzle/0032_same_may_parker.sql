ALTER TABLE "sessions" DROP CONSTRAINT "sessions_horse_horse_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-14T12:25:00.353Z';--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "horse" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "horse" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "horse" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-14T12:25:00.346Z';