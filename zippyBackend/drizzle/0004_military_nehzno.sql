ALTER TABLE "rider" RENAME COLUMN "sessions" TO "joined_sessions";--> statement-breakpoint
ALTER TABLE "rider" ALTER COLUMN "plan" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rider" ALTER COLUMN "session_count" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rider" ALTER COLUMN "safety_briefing" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rider" ALTER COLUMN "trophies" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rider" ADD COLUMN "pending_sessions" uuid[] DEFAULT '{}';