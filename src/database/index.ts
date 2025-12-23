import { env } from "../env";
import logger from "../structures/Logger";
import { DatabaseType, type LavaDatabase } from "../types/database";
import * as schema from "./schemas";

const getDatabaseType = (url?: string): DatabaseType => {
	if (!url) return DatabaseType.PGLite;
	if (url.startsWith("postgres://") || url.startsWith("postgresql://"))
		return DatabaseType.Postgres;
	if (url.startsWith("file:") || url.endsWith(".db")) return DatabaseType.PGLite;

	return DatabaseType.PGLite;
};

let db: LavaDatabase;

const currentDbType = getDatabaseType(env.DATABASE_URL);

switch (currentDbType) {
	case DatabaseType.Postgres: {
		const { drizzle } = await import("drizzle-orm/node-postgres");
		const { Pool } = await import("pg");

		const pool = new Pool({ connectionString: env.DATABASE_URL });
		db = drizzle(pool, { schema });

		logger.success("[DB] Connected to PostgreSQL");
		break;
	}
	case DatabaseType.PGLite: {
		const { drizzle } = await import("drizzle-orm/pglite");

		const dataDir = env.DATABASE_URL?.replace("file:", "") || "./lavamusic.db";
		db = drizzle(dataDir, { schema });

		logger.success("[DB] Connected to PGLite");
		break;
	}
}

export { db, schema };
