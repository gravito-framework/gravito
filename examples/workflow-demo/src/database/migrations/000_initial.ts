import { sql } from 'drizzle-orm'

export async function up() {
  await sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT, created_at TEXT)`
}

export async function down() {
  await sql`DROP TABLE IF EXISTS users`
}
