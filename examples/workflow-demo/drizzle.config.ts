export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  driver: 'sqlite',
  dbCredentials: {
    url: 'sqlite:./demo.db',
  },
}
