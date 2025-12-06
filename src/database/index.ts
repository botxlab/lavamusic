import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../env';
import * as schema from "./schemas";

const client = createClient({ url: env.DATABASE_URL ?? 'file:./lavamusic.db' });
export const db = drizzle({ client, schema });

export { schema };