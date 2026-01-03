import { config } from "dotenv";
import { defineConfig } from 'drizzle-kit';

config();

let { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  DATABASE_URL = "file:./lavamusic.db";
}

export default defineConfig({
  out: './drizzle/sqlite',
  schema: './src/database/schemas.sqlite.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: DATABASE_URL
  },
});