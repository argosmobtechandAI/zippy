ALTER TABLE "trainers" ALTER COLUMN "horseId" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "trainers" ALTER COLUMN "horseId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-08T12:10:48.664Z';