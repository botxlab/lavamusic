import type { Config } from "drizzle-kit";
import { env } from "./src/env";

if (!env.DATABASE_URL) env.DATABASE_URL = "file:./lavamusic-pgdata";

const isPgLite =
  !env.DATABASE_URL.startsWith("postgres://") &&
  !env.DATABASE_URL.startsWith("postgresql://");

const config: Config = {
  out: "./drizzle/postgres",
  schema: "./src/database/schemas.ts",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
};

// Only add driver for PGLite
if (isPgLite) {
  config.driver = "pglite";
}

export default config;
