import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";

import type * as pgSchema from "./../database/schemas";
import type * as sqliteSchema from "./../database/schemas.sqlite";

export enum DatabaseType {
	Postgres = "postgres",
	PGLite = "pglite",
	SQLite = "sqlite",
}

export type LavaDatabase =
	| PgliteDatabase<typeof pgSchema>
	| NodePgDatabase<typeof pgSchema>
	| BunSQLiteDatabase<typeof sqliteSchema>;
