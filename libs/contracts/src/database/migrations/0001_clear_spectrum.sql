CREATE TYPE "public"."event_status" AS ENUM('planned', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."expense_frequency" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once');--> statement-breakpoint
CREATE TABLE "BudgetParticipant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budgetId" uuid NOT NULL,
	"userId" uuid,
	"name" varchar(255) NOT NULL,
	"contributesToBudget" boolean DEFAULT false NOT NULL,
	"monthlyContribution" numeric(10, 2),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"removedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Budget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"monthlyAmount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isArchived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"archivedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "EventParticipant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"userId" uuid,
	"name" varchar(255) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"amountToPay" numeric(10, 2) NOT NULL,
	"hasPaid" boolean DEFAULT false NOT NULL,
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budgetId" uuid,
	"creatorId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"totalAmount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"eventDate" timestamp NOT NULL,
	"status" "event_status" DEFAULT 'planned' NOT NULL,
	"isArchived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"archivedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budgetId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"frequency" "expense_frequency" DEFAULT 'monthly' NOT NULL,
	"dueDay" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"isArchived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"archivedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "BudgetParticipant" ADD CONSTRAINT "BudgetParticipant_budgetId_Budget_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."Budget"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BudgetParticipant" ADD CONSTRAINT "BudgetParticipant_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_budgetId_Budget_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."Budget"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_budgetId_Budget_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."Budget"("id") ON DELETE cascade ON UPDATE no action;