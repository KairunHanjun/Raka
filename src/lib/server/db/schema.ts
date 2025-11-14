import { text, pgTable, pgEnum, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

export const accountTypeEnum = pgEnum('account_type', ['FO', 'HK', 'T', 'H']);

export const unitState = pgEnum('unit_state', ['Ready', 'StandBy', 'Working', 'Closed']);

export const accounts = pgTable('accounts', {
    id: text('id').primaryKey(),
    accountType: accountTypeEnum('account_type').notNull(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    email: text('email').notNull().unique(),
    phoneNumber: text('phone_number'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
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
	id: text('id').primaryKey().$defaultFn(() => uuidv4()).notNull(),
    nameUnit: text('name').unique().notNull(),
    unitState: unitState('unit_state').default('Ready'),
    fromTime: timestamp('from_time', {mode: 'date', withTimezone: false}), // REKOMENDASI: Gunakan time()
    toTime: timestamp('to_time', {mode: 'date', withTimezone: false}), // REKOMENDASI: Gunakan time()
    createdByWho: text('created_by_who'),
    pending: boolean('pending').default(false),
    kebersihan: text('kebersihan_id').references(() => kebersihan.id)
});

export const customers = pgTable('customers', {
    idCostumers: text('uuid').primaryKey().$defaultFn(() => uuidv4()),
    hostName: text('host_name').notNull().references(() => accounts.username),
    agent: text('agent').notNull().references(() => agents.id),
    unitId: text('unit_id').references(() => units.id),
    customersName: text('name').notNull(),
    duration: integer('duration').notNull(), // REKOMENDASI: Gunakan integer (untuk menit/detik)
    fromTime: timestamp('from_time', {mode: 'string'}).notNull().defaultNow(), // REKOMENDASI: Gunakan time()
    toTime: timestamp('to_time', {mode: 'string'}).notNull().defaultNow(), // REKOMENDASI: Gunakan time()
    price: integer('price').notNull(),
    komisi: integer('komisi').notNull(),
    fotoKTP: text('url_fotoKtp'),
    durationDays: boolean('isDurationDays').notNull().default(false)
}); 

export const absensi = pgTable('absen', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    name: text('who').notNull(). references(() => accounts.username),
    accountType: accountTypeEnum('type').notNull(),
    whenEntry: timestamp('whenEntry').defaultNow().notNull(), // REKOMENDASI: Gunakan timestamp()
    fotoUrl: text('url_foto').notNull(),
});

export const masalah = pgTable('masalah', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    unitId: text('unit_id').references(() => units.id),
    name: text('who').notNull(). references(() => accounts.username),
    accountType: accountTypeEnum('type').notNull(),
    imageUrl: text('img_url').notNull(),
    desc: text('description').notNull(),
    when: timestamp('when').defaultNow().notNull(), // REKOMENDASI: Gunakan timestamp()
    berat: boolean('berat').default(false),
    done: boolean('aman').default(false)
});

export const kebersihan = pgTable('kebersihan', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    name: text('who').notNull(). references(() => accounts.username),
    accountType: accountTypeEnum('type').notNull(),
    when: timestamp('when').defaultNow().notNull(),
    gambarRuangan: text('img_ruang').notNull(),
    gambarKamarMandi: text('img_mandi').notNull(),
    approve: boolean('approve'),
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

export type kebersihan = typeof kebersihan.$inferSelect;
