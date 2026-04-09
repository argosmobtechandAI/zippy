CREATE TABLE "health_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"horse" uuid NOT NULL,
	"date" varchar(50) NOT NULL,
	"status" varchar(255) NOT NULL,
	"notes" varchar(500),
	"title" varchar(255) NOT NULL,
	"treatment" varchar(255) NOT NULL,
	"medications" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horse" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"weight" integer NOT NULL,
	"speed" integer NOT NULL,
	"shoe_status" varchar(255) NOT NULL,
	"diet" varchar(255) NOT NULL,
	"sessions" uuid[] DEFAULT '{}',
	"last_visit" varchar(50),
	"health_status" uuid[] NOT NULL,
	"vaccination_records" uuid[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sessions_count" integer NOT NULL,
	"validity" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"level" varchar(255) NOT NULL,
	"rules" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rider" (
	"allergies" varchar(255),
	"level" varchar(255) NOT NULL,
	"instructions" varchar(500),
	"plan" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"signature" varchar(255),
	"session_count" integer DEFAULT 0 NOT NULL,
	"sessions" uuid[] DEFAULT '{}',
	"safety_briefing" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"trophies" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"timing" varchar(255) NOT NULL,
	"date" varchar(50) NOT NULL,
	"joining_amount" integer NOT NULL,
	"trainers" uuid NOT NULL,
	"horse" uuid NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb,
	"duration" varchar(50) NOT NULL,
	"location" varchar(255) NOT NULL,
	"total_seats" integer NOT NULL,
	"note" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "stable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"horse" uuid[] DEFAULT '{}',
	"stocks" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"horseId" uuid[] NOT NULL,
	"title" varchar(255) NOT NULL,
	"sessions" uuid[] DEFAULT '{}',
	"pendingSessions" uuid[] DEFAULT '{}',
	"leaveRequests" jsonb DEFAULT '[]'::jsonb,
	"experience" varchar(255) NOT NULL,
	"certificates" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "vaccination_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"horse" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" varchar(50) NOT NULL,
	"next_date" varchar(50) NOT NULL,
	"batch_number" varchar(255) NOT NULL,
	"notes" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "vet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"certificates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"patience" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_trainers_trainers_id_fk" FOREIGN KEY ("trainers") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_horse_horse_id_fk" FOREIGN KEY ("horse") REFERENCES "public"."horse"("id") ON DELETE no action ON UPDATE no action;