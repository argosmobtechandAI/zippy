ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-15T05:36:35.451Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-15T05:36:35.445Z';--> statement-breakpoint
ALTER TABLE "stable" ADD COLUMN "head_trainer" uuid;--> statement-breakpoint
ALTER TABLE "stable" ADD COLUMN "trainers" uuid[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "stable" ADD CONSTRAINT "stable_head_trainer_trainers_id_fk" FOREIGN KEY ("head_trainer") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;