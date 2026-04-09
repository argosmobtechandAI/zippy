ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-08T11:20:39.806Z';--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;