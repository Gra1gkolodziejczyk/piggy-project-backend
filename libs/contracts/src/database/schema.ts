import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  age: integer('age'),
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

export const usersRelations = relations(users, ({ one }) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type UserWithAccount = User & {
  account?: Account | null;
};

export type AccountWithUser = Account & {
  user: User;
};
