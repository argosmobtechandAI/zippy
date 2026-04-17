ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-17T06:17:16.818Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-17T06:17:16.809Z';--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "vat_id" uuid;--> statement-breakpoint
ALTER TABLE "horse" ADD CONSTRAINT "horse_vat_id_vet_id_fk" FOREIGN KEY ("vat_id") REFERENCES "public"."vet"("id") ON DELETE no action ON UPDATE no action;