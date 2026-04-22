ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-20T07:05:10.003Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-20T07:05:09.997Z';--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "stable_id" uuid;--> statement-breakpoint
ALTER TABLE "horse" ADD CONSTRAINT "horse_stable_id_stable_id_fk" FOREIGN KEY ("stable_id") REFERENCES "public"."stable"("id") ON DELETE no action ON UPDATE no action;