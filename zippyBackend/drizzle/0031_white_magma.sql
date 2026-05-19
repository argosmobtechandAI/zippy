ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-14T09:47:52.666Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-14T09:47:52.659Z';--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "batchs_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_batchs_id_batches_id_fk" FOREIGN KEY ("batchs_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;