import { sqliteTable, text, timestamp } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
})
