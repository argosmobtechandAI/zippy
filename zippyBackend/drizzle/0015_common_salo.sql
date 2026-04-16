CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"unit" varchar(50) NOT NULL,
	"min_threshold" integer DEFAULT 10,
	"status" varchar(50) DEFAULT 'In Stock',
	"last_updated" varchar(50) DEFAULT '2026-04-15T10:36:55.015Z'
);
--> statement-breakpoint
ALTER TABLE "horse" ALTER COLUMN "health_status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "horse" ALTER COLUMN "vaccination_records" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-15T10:36:55.006Z';--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "image_url" varchar(1000);--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "age" integer;--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "trainer_id" uuid;--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "status" varchar(50) DEFAULT 'Available';--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "deworming_record" varchar(500);--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "shoeing_remarks" varchar(500);--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "health_remarks" varchar(500);--> statement-breakpoint
ALTER TABLE "horse" ADD COLUMN "vaccination_summary" varchar(500);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "status" varchar(50) DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "stable_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" varchar(20) DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_picture" varchar(255);--> statement-breakpoint
ALTER TABLE "vet" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "horse" ADD CONSTRAINT "horse_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_stable_id_stable_id_fk" FOREIGN KEY ("stable_id") REFERENCES "public"."stable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet" ADD CONSTRAINT "vet_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;