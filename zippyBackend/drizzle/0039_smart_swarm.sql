ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-05-21T12:53:31.087Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-05-21T12:53:31.081Z';--> statement-breakpoint
ALTER TABLE "stable" ADD COLUMN "code" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "stable" ADD CONSTRAINT "stable_code_unique" UNIQUE("code");