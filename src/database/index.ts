import { Database } from "bun:sqlite";
import { env } from "../env";
import logger from "../structures/Logger";
import { DatabaseType, type LavaDatabase } from "../types/database";
import * as pgSchema from "./schemas";
import * as sqliteSchema from "./schemas.sqlite";

const getDatabaseType = (url?: string): DatabaseType => {
	if (!url) return DatabaseType.PGLite;

	if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
		return DatabaseType.Postgres;
	}
	if (
		url.startsWith("sqlite:") ||
		url.endsWith(".db") ||
		url.endsWith(".sqlite") ||
		url.endsWith(".sqlite3")
	) {
		return DatabaseType.SQLite;
	}
	if (url.startsWith("file:")) {
		// If it has query parameters (e.g., ?mode=ro), it is a valid SQLite URI
		if (url.includes("?")) return DatabaseType.SQLite;

		// If it has a file extension, it is likely a SQLite file
		if (/\.(db|sqlite3?)$/i.test(url)) return DatabaseType.SQLite;

		// If it starts with 'file:' but has no extension or query, assume it's a PGLite directory
		return DatabaseType.PGLite;
	}

	return DatabaseType.PGLite;
};

let db: LavaDatabase;
let schema: typeof pgSchema | typeof sqliteSchema;

const currentDbType = getDatabaseType(env.DATABASE_URL);

switch (currentDbType) {
	case DatabaseType.Postgres: {
		const { drizzle } = await import("drizzle-orm/node-postgres");
		const { Pool } = await import("pg");

		const pool = new Pool({ connectionString: env.DATABASE_URL });
		db = drizzle(pool, { schema: pgSchema });
		schema = pgSchema;

		logger.success("[DB] Connected to PostgreSQL");
		break;
	}
	case DatabaseType.PGLite: {
		const { drizzle } = await import("drizzle-orm/pglite");

		const dataDir = env.DATABASE_URL?.replace("file:", "") || "./lavamusic-pgdata";
		db = drizzle(dataDir, { schema: pgSchema });
		schema = pgSchema;

		logger.success("[DB] Connected to PGLite");
		break;
	}
	case DatabaseType.SQLite: {
		const { drizzle } = await import("drizzle-orm/bun-sqlite");

		let path = env.DATABASE_URL?.replace("file:", "") || "./lavamusic.db";
		if (path.startsWith("sqlite:")) {
			path = path.replace("sqlite:", "");
		}

		const sqlite = new Database(path);

		db = drizzle(sqlite, { schema: sqliteSchema });
		schema = sqliteSchema;

		logger.success(`[DB] Connected to SQLite at ${path}`);
		break;
	}
}

export { db, schema };
