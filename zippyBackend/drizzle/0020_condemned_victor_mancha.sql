ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-20T06:22:56.128Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-20T06:22:56.123Z';--> statement-breakpoint
ALTER TABLE "stable" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "stable" ADD CONSTRAINT "stable_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;