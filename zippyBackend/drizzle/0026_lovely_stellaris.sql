CREATE TABLE "revenue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	"date" varchar(50) NOT NULL,
	"purchaserId" uuid,
	"purchaseType" varchar(255) NOT NULL,
	"planId" uuid
);
--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "last_updated" SET DEFAULT '2026-04-24T08:42:27.517Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-04-24T08:42:27.510Z';--> statement-breakpoint
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_purchaserId_users_id_fk" FOREIGN KEY ("purchaserId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_planId_plan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plan"("id") ON DELETE no action ON UPDATE no action;