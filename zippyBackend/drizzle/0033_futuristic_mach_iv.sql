ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-14T12:33:44.524Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-14T12:33:44.518Z';--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "horse" uuid[] DEFAULT '{}';