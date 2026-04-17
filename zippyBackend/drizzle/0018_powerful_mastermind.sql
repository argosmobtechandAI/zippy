ALTER TABLE "horse" ALTER COLUMN "health_status" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-17T06:55:21.220Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-17T06:55:21.207Z';--> statement-breakpoint
ALTER TABLE "horse" ADD CONSTRAINT "horse_health_status_health_status_id_fk" FOREIGN KEY ("health_status") REFERENCES "public"."health_status"("id") ON DELETE no action ON UPDATE no action;