import { serial, text, pgTable, pgEnum, timestamp } from 'drizzle-orm/pg-core';

/**
 * Defines the possible account types using a PostgreSQL enum.
 * Using an enum is better for data integrity than a plain text field.
 */
export const accountTypeEnum = pgEnum('account_type', ['FO', 'HK', 'T', "H"]);

/**
 * Defines the 'accounts' table schema using Drizzle ORM.
 */
export const accounts = pgTable('accounts', {
  // id: An auto-incrementing integer that serves as the primary key.
  id: serial('id').primaryKey(),

  // accountType: The type of the account, constrained by the values in accountTypeEnum.
  // It defaults to 'user' if not specified.
  accountType: accountTypeEnum('account_type').notNull(),

  // username: A unique, required text field for the user's login name.
  username: text('username').notNull().unique(),

  // passwordHash: A required text field to store the user's hashed password.
  // It's named 'passwordHash' to make it clear we should not store plain text passwords.
  passwordHash: text('password_hash').notNull(),

  // email: A unique, required text field for the user's email address.
  email: text('email').notNull().unique(),
  
  // phoneNumber: An optional text field for the user's phone number.
  phoneNumber: text('phone_number'),

  // createdAt: A timestamp that automatically records when the account was created.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});