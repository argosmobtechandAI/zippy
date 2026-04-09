CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"mobile" varchar(20) NOT NULL,
	"type" varchar(50) NOT NULL,
	"dob" varchar(50),
	"age" integer,
	"weight" integer,
	"parent_name" varchar(255),
	"emergency_contact" varchar(20),
	"notifications" jsonb DEFAULT '[]'::jsonb,
	CONSTRAINT "users_mobile_unique" UNIQUE("mobile")
);
