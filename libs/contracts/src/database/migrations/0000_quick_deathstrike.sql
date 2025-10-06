CREATE TABLE "Account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"password" varchar(255) NOT NULL,
	"refreshToken" varchar(500) NOT NULL,
	"refreshTokenExpiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Account_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"age" integer,
	"phoneNumber" varchar(50),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" varchar(500),
	"StripeId" varchar(255),
	"lang" varchar(10) DEFAULT 'fr',
	"isActive" boolean DEFAULT true NOT NULL,
	"emailNotification" boolean DEFAULT false,
	"smsNotification" boolean DEFAULT false,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;