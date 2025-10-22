import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

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
  'event',
  'budget_transfer',
  'budget_withdrawal',
  'adjustment',
]);

export const frequencyEnum = pgEnum('frequency', [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'once',
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
  frequency: frequencyEnum('frequency').default('monthly').notNull(),
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
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 100 }),
  description: text('description'),
  currentAmount: decimal('currentAmount', { precision: 12, scale: 2 })
    .default('0.00')
    .notNull(),
  targetAmount: decimal('targetAmount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  autoTransferEnabled: boolean('autoTransferEnabled').default(false).notNull(),
  autoTransferAmount: decimal('autoTransferAmount', {
    precision: 10,
    scale: 2,
  }),
  autoTransferFrequency: frequencyEnum('autoTransferFrequency'),
  autoTransferDay: integer('autoTransferDay'),
  nextAutoTransferDate: timestamp('nextAutoTransferDate', { mode: 'date' }),
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
  contributedAmount: decimal('contributedAmount', { precision: 10, scale: 2 })
    .default('0.00')
    .notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
  removedAt: timestamp('removedAt', { mode: 'date' }),
});

export const expenses = pgTable('Expense', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 100 }),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  frequency: frequencyEnum('frequency').default('once').notNull(),
  isRecurring: boolean('isRecurring').default(false).notNull(),
  nextPaymentDate: timestamp('nextPaymentDate', { mode: 'date' }),
  splitPercentages:
    jsonb('splitPercentages').$type<
      Array<{ name: string; percentage: number }>
    >(),
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
  icon: varchar('icon', { length: 100 }), // ✅
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
  hasPaid: boolean('hasPaid').default(false).notNull(),
  paidAt: timestamp('paidAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, { fields: [users.id], references: [accounts.userId] }),
  bank: one(banks, { fields: [users.id], references: [banks.userId] }),
  incomes: many(incomes),
  expenses: many(expenses),
  budgets: many(budgets),
  createdEvents: many(events),
  eventParticipations: many(eventParticipants),
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const banksRelations = relations(banks, ({ one }) => ({
  user: one(users, { fields: [banks.userId], references: [users.id] }),
}));

export const incomesRelations = relations(incomes, ({ one, many }) => ({
  user: one(users, { fields: [incomes.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, { fields: [events.creatorId], references: [users.id] }),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Bank = typeof banks.$inferSelect;
export type NewBank = typeof banks.$inferInsert;

export type Income = typeof incomes.$inferSelect;
export type NewIncome = typeof incomes.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type NewEventParticipant = typeof eventParticipants.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type UserWithAccount = User & {
  account?: Account | null;
};

export type UserWithBank = User & {
  bank?: Bank | null;
};

export type UserComplete = User & {
  account?: Account | null;
  bank?: Bank | null;
};

export type IncomeWithTransactions = Income & {
  transactions: Transaction[];
};

export type ExpenseWithTransactions = Expense & {
  transactions: Transaction[];
};

export type BudgetWithTransactions = Budget & {
  transactions: Transaction[];
};

export type EventWithParticipants = Event & {
  creator: User;
  participants: (EventParticipant & { user?: User | null })[];
};

export type TransactionWithRelations = Transaction & {
  user: User;
  income?: Income | null;
  expense?: Expense | null;
  event?: Event | null;
  budget?: Budget | null;
};
