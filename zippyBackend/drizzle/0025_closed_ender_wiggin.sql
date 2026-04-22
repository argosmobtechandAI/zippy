ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-21T07:21:11.045Z';--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "trainers" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-21T07:21:11.040Z';