CREATE TYPE "public"."frequency" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once');--> statement-breakpoint
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_ownerId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_budgetId_Budget_id_fk";
--> statement-breakpoint
ALTER TABLE "Expense" ALTER COLUMN "frequency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Expense" ALTER COLUMN "frequency" SET DATA TYPE "public"."frequency" USING "frequency"::text::"public"."frequency";--> statement-breakpoint
ALTER TABLE "Expense" ALTER COLUMN "frequency" SET DEFAULT 'once';--> statement-breakpoint
ALTER TABLE "Income" ALTER COLUMN "frequency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Income" ALTER COLUMN "frequency" SET DATA TYPE "public"."frequency" USING "frequency"::text::"public"."frequency";--> statement-breakpoint
ALTER TABLE "Income" ALTER COLUMN "frequency" SET DEFAULT 'monthly';--> statement-breakpoint
ALTER TABLE "BudgetParticipant" ADD COLUMN "contributedAmount" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "BudgetParticipant" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "icon" varchar(100);--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "currentAmount" numeric(12, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "targetAmount" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "autoTransferEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "autoTransferAmount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "autoTransferFrequency" "frequency";--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "autoTransferDay" integer;--> statement-breakpoint
ALTER TABLE "Budget" ADD COLUMN "nextAutoTransferDate" timestamp;--> statement-breakpoint
ALTER TABLE "Event" ADD COLUMN "icon" varchar(100);--> statement-breakpoint
ALTER TABLE "Expense" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "Expense" ADD COLUMN "icon" varchar(100);--> statement-breakpoint
ALTER TABLE "Expense" ADD COLUMN "category" varchar(100);--> statement-breakpoint
ALTER TABLE "Expense" ADD COLUMN "isRecurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Expense" ADD COLUMN "nextPaymentDate" timestamp;--> statement-breakpoint
ALTER TABLE "Expense" ADD COLUMN "splitPercentages" jsonb;--> statement-breakpoint
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BudgetParticipant" DROP COLUMN "contributesToBudget";--> statement-breakpoint
ALTER TABLE "BudgetParticipant" DROP COLUMN "monthlyContribution";--> statement-breakpoint
ALTER TABLE "Budget" DROP COLUMN "ownerId";--> statement-breakpoint
ALTER TABLE "Budget" DROP COLUMN "monthlyAmount";--> statement-breakpoint
ALTER TABLE "EventParticipant" DROP COLUMN "amountToPay";--> statement-breakpoint
ALTER TABLE "Expense" DROP COLUMN "budgetId";--> statement-breakpoint
ALTER TABLE "Expense" DROP COLUMN "dueDay";--> statement-breakpoint
DROP TYPE "public"."expense_frequency";