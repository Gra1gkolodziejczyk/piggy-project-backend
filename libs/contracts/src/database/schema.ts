import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const expenseFrequencyEnum = pgEnum('expense_frequency', [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'once',
]);

export const eventStatusEnum = pgEnum('event_status', [
  'planned',
  'completed',
  'cancelled',
]);

export const incomeTypeEnum = pgEnum('income_type', [
  'salary',
  'social_aid',
  'bonus',
  'investment',
  'other',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
  'transfer',
  'adjustment',
]);

export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phoneNumber', { length: 50 }),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: varchar('image', { length: 500 }),
  stripeId: varchar('StripeId', { length: 255 }),
  lang: varchar('lang', { length: 10 }).default('fr'),
  isActive: boolean('isActive').default(true).notNull(),
  emailNotification: boolean('emailNotification').default(false),
  smsNotification: boolean('smsNotification').default(false),
});

export const accounts = pgTable('Account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  password: varchar('password', { length: 255 }).notNull(),
  refreshToken: varchar('refreshToken', { length: 500 }).notNull(),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
    mode: 'date',
  }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const banks = pgTable('Bank', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  balance: decimal('balance', { precision: 12, scale: 2 })
    .default('0.00')
    .notNull(),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  lastUpdatedAt: timestamp('lastUpdatedAt', { mode: 'date' })
    .defaultNow()
    .notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const incomes = pgTable('Income', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: incomeTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  frequency: expenseFrequencyEnum('frequency').default('monthly').notNull(),
  nextPaymentDate: timestamp('nextPaymentDate', { mode: 'date' }).notNull(),
  isRecurring: boolean('isRecurring').default(true).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  isArchived: boolean('isArchived').default(false).notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
  archivedAt: timestamp('archivedAt', { mode: 'date' }),
});

export const transactions = pgTable('Transaction', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal('balanceAfter', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  incomeId: uuid('incomeId').references(() => incomes.id, {
    onDelete: 'set null',
  }),
  expenseId: uuid('expenseId').references(() => expenses.id, {
    onDelete: 'set null',
  }),
  eventId: uuid('eventId').references(() => events.id, {
    onDelete: 'set null',
  }),
  budgetId: uuid('budgetId').references(() => budgets.id, {
    onDelete: 'set null',
  }),
  transactionDate: timestamp('transactionDate', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const budgets = pgTable('Budget', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('ownerId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  monthlyAmount: decimal('monthlyAmount', {
    precision: 10,
    scale: 2,
  }).notNull(),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  isArchived: boolean('isArchived').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
  archivedAt: timestamp('archivedAt', { mode: 'date' }),
});

export const budgetParticipants = pgTable('BudgetParticipant', {
  id: uuid('id').defaultRandom().primaryKey(),
  budgetId: uuid('budgetId')
    .notNull()
    .references(() => budgets.id, { onDelete: 'cascade' }),
  userId: uuid('userId').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  contributesToBudget: boolean('contributesToBudget').default(false).notNull(),
  monthlyContribution: decimal('monthlyContribution', {
    precision: 10,
    scale: 2,
  }),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  removedAt: timestamp('removedAt', { mode: 'date' }),
});

export const expenses = pgTable('Expense', {
  id: uuid('id').defaultRandom().primaryKey(),
  budgetId: uuid('budgetId')
    .notNull()
    .references(() => budgets.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  frequency: expenseFrequencyEnum('frequency').default('monthly').notNull(),
  dueDay: integer('dueDay'),
  isActive: boolean('isActive').default(true).notNull(),
  isArchived: boolean('isArchived').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
  archivedAt: timestamp('archivedAt', { mode: 'date' }),
});

export const events = pgTable('Event', {
  id: uuid('id').defaultRandom().primaryKey(),
  budgetId: uuid('budgetId').references(() => budgets.id, {
    onDelete: 'set null',
  }),
  creatorId: uuid('creatorId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  eventDate: timestamp('eventDate', { mode: 'date' }).notNull(),
  status: eventStatusEnum('status').default('planned').notNull(),
  isArchived: boolean('isArchived').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
  archivedAt: timestamp('archivedAt', { mode: 'date' }),
});

export const eventParticipants = pgTable('EventParticipant', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('eventId')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('userId').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  amountToPay: decimal('amountToPay', { precision: 10, scale: 2 }).notNull(),
  hasPaid: boolean('hasPaid').default(false).notNull(),
  paidAt: timestamp('paidAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
  bank: one(banks, {
    fields: [users.id],
    references: [banks.userId],
  }),
  ownedBudgets: many(budgets),
  createdEvents: many(events),
  budgetParticipations: many(budgetParticipants),
  eventParticipations: many(eventParticipants),
  incomes: many(incomes),
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const banksRelations = relations(banks, ({ one }) => ({
  user: one(users, {
    fields: [banks.userId],
    references: [users.id],
  }),
}));

export const incomesRelations = relations(incomes, ({ one, many }) => ({
  user: one(users, {
    fields: [incomes.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  income: one(incomes, {
    fields: [transactions.incomeId],
    references: [incomes.id],
  }),
  expense: one(expenses, {
    fields: [transactions.expenseId],
    references: [expenses.id],
  }),
  event: one(events, {
    fields: [transactions.eventId],
    references: [events.id],
  }),
  budget: one(budgets, {
    fields: [transactions.budgetId],
    references: [budgets.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  owner: one(users, {
    fields: [budgets.ownerId],
    references: [users.id],
  }),
  participants: many(budgetParticipants),
  expenses: many(expenses),
  events: many(events),
  transactions: many(transactions),
}));

export const budgetParticipantsRelations = relations(
  budgetParticipants,
  ({ one }) => ({
    budget: one(budgets, {
      fields: [budgetParticipants.budgetId],
      references: [budgets.id],
    }),
    user: one(users, {
      fields: [budgetParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  budget: one(budgets, {
    fields: [expenses.budgetId],
    references: [budgets.id],
  }),
  transactions: many(transactions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  budget: one(budgets, {
    fields: [events.budgetId],
    references: [budgets.id],
  }),
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
  transactions: many(transactions),
}));

export const eventParticipantsRelations = relations(
  eventParticipants,
  ({ one }) => ({
    event: one(events, {
      fields: [eventParticipants.eventId],
      references: [events.id],
    }),
    user: one(users, {
      fields: [eventParticipants.userId],
      references: [users.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Bank = typeof banks.$inferSelect;
export type NewBank = typeof banks.$inferInsert;

export type Income = typeof incomes.$inferSelect;
export type NewIncome = typeof incomes.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type BudgetParticipant = typeof budgetParticipants.$inferSelect;
export type NewBudgetParticipant = typeof budgetParticipants.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type NewEventParticipant = typeof eventParticipants.$inferInsert;

export type UserWithAccount = User & {
  account?: Account | null;
};

export type AccountWithUser = Account & {
  user: User;
};

export type UserWithBank = User & {
  bank?: Bank | null;
};

export type IncomeWithTransactions = Income & {
  transactions: Transaction[];
};

export type BudgetWithRelations = Budget & {
  owner: User;
  participants: (BudgetParticipant & { user?: User | null })[];
  expenses: Expense[];
  events: Event[];
};

export type EventWithParticipants = Event & {
  creator: User;
  budget?: Budget | null;
  participants: (EventParticipant & { user?: User | null })[];
};

export type ExpenseWithBudget = Expense & {
  budget: Budget;
};

export type TransactionWithRelations = Transaction & {
  user: User;
  income?: Income | null;
  expense?: Expense | null;
  event?: Event | null;
  budget?: Budget | null;
};
