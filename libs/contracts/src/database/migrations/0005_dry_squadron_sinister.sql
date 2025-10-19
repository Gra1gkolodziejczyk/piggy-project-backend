ALTER TABLE "Transaction" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transaction_type";--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'event', 'budget_transfer', 'budget_withdrawal', 'manual_adjustment');--> statement-breakpoint
ALTER TABLE "Transaction" ALTER COLUMN "type" SET DATA TYPE "public"."transaction_type" USING "type"::"public"."transaction_type";