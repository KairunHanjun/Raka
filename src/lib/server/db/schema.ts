
import { sql } from 'drizzle-orm';
import { text, pgTable, pgEnum, timestamp, integer } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

/**
 * Defines the possible account types using a PostgreSQL enum.
 * Using an enum is better for data integrity than a plain text field.
 */
export const accountTypeEnum = pgEnum('account_type', ['FO', 'HK', 'T', 'H']);

export const unitState = pgEnum('unit_state', ['Ready', 'StandBy', 'Working', 'Closed']);

/**
 * Defines the 'accounts' table schema using Drizzle ORM.
 */
export const accounts = pgTable('accounts', {
	// id: An auto-incrementing integer that serves as the primary key.
	id: text('id').primaryKey(),
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
	// whoCreatedThis: This indcate explain who create the account
	createdByWho: text('created_by_who').notNull()
});

export const agents = pgTable('agents', {
	id: text('id').primaryKey().$defaultFn(() => uuidv4()),
	nameAgent: text('agent_name').notNull().unique(),
	email: text('email').notNull().unique(),
	phoneNumber: text('phone_number'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	createdByWho: text('created_by_who').notNull()
});

export const units = pgTable('units', {
	nameUnit: text('name').primaryKey(),
	unitState: unitState('unit_state').default('Ready'),
	fromTime: text('from_time'),
	toTime: text('to_time'),
});

export const customers = pgTable('customers', {
	idCostumers: text('uuid').primaryKey().$defaultFn(() => uuidv4()),
	hostName: text('host_name').notNull().references(() => accounts.username),
	agent: text('agent').notNull().references(() => agents.nameAgent),
	unitName: text('unit_name').notNull().references(() => units.nameUnit),
	customersName: text('name').notNull(),
	duration: text('hour').notNull(),
	fromTime: text('from_time').notNull(),
	toTime: text('to_time').notNull(),
	price: integer('price').notNull()
}); 

export const absensi = pgTable('absen', {
	id: text('id').primaryKey().$defaultFn(() => uuidv4()),
	name: text('who').notNull(). references(() => accounts.username),
	accountType: accountTypeEnum('type').notNull(),
	whenEntry: text('whenEntry').notNull().default(sql`now()`)
});

export const masalah = pgTable('masalah', {
	id: text('id').primaryKey().$defaultFn(() => uuidv4()),
	name: text('who').notNull(). references(() => accounts.username),
	imageUrl: text('img_url').notNull(),
	desc: text('description').notNull(),
	when: text('whenEntry').notNull().default(sql`now()`)
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => accounts.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof accounts.$inferSelect;

export type Units = typeof units.$inferSelect;

export type Agents = typeof agents.$inferSelect;

export type Absensi = typeof absensi.$inferSelect;

export type Masalah = typeof masalah.$inferSelect;

export type Customers = typeof customers.$inferSelect;