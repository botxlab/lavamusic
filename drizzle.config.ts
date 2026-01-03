import { defineConfig } from 'drizzle-kit';
import { env } from "./src/env";

if (!env.DATABASE_URL) {
  env.DATABASE_URL = "file:./lavamusic.db";
}

export default defineConfig({
  out: './drizzle/postgres',
  schema: './src/database/schemas.ts',
  dialect: 'postgresql',
  driver: "pglite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});