import { Database } from "bun:sqlite";
import { env } from "../env";
import logger from "../structures/Logger";
import { PostgresProvider, SQLiteProvider } from "./provider";
import * as pgSchema from "./schemas";
import * as sqliteSchema from "./schemas.sqlite";
import { DatabaseType, type IDatabaseProvider } from "./types";

export function detectDatabaseType(url?: string): DatabaseType {
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
		if (url.includes("?")) return DatabaseType.SQLite;

		if (/\.(db|sqlite3?)$/i.test(url)) return DatabaseType.SQLite;

		return DatabaseType.PGLite;
	}

	return DatabaseType.PGLite;
}

export async function createDatabaseProvider(): Promise<IDatabaseProvider> {
	const dbType = detectDatabaseType(env.DATABASE_URL);

	switch (dbType) {
		case DatabaseType.Postgres: {
			const { drizzle } = await import("drizzle-orm/node-postgres");
			const { Pool } = await import("pg");

			const pool = new Pool({ connectionString: env.DATABASE_URL });
			const db = drizzle(pool, { schema: pgSchema });

			logger.success("[DB] Connected to PostgreSQL");
			return new PostgresProvider(dbType, db, pgSchema);
		}

		case DatabaseType.PGLite: {
			const { drizzle } = await import("drizzle-orm/pglite");
			const dataDir = env.DATABASE_URL?.replace("file:", "") || "./lavamusic-pgdata";

			let client: any;

			if (process.env.NODE_ENV === "production") {
				try {
					const { createPGlite } = await import("./pglite-wrapper");
					client = await createPGlite(dataDir);
					logger.info("[DB] Using bundled PGlite");
				} catch (err) {
					logger.error("Failed to load bundled PGlite, falling back to standard:", err);
					const { PGlite } = await import("@electric-sql/pglite");
					client = new PGlite(dataDir);
				}
			} else {
				const { PGlite } = await import("@electric-sql/pglite");
				client = new PGlite(dataDir);
			}

			const db = drizzle(client, { schema: pgSchema });

			logger.success("[DB] Connected to PGLite");
			return new PostgresProvider(dbType, db, pgSchema);
		}

		case DatabaseType.SQLite: {
			const { drizzle } = await import("drizzle-orm/bun-sqlite");

			let path = env.DATABASE_URL?.replace("file:", "") || "./lavamusic.db";
			if (path.startsWith("sqlite:")) {
				path = path.replace("sqlite:", "");
			}

			const sqlite = new Database(path);
			const db = drizzle(sqlite, { schema: sqliteSchema });

			logger.success(`[DB] Connected to SQLite at ${path}`);
			return new SQLiteProvider(dbType, db, sqliteSchema);
		}

		default: {
			throw new Error(`Unsupported database type: ${dbType}`);
		}
	}
}

let _provider: IDatabaseProvider | null = null;

export async function getDatabase(): Promise<IDatabaseProvider> {
	if (!_provider) {
		_provider = await createDatabaseProvider();
	}
	return _provider;
}

export function resetDatabase(): void {
	_provider = null;
}
