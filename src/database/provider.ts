import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";

import { env } from "../env";
import type * as pgSchema from "./schemas";
import type * as sqliteSchema from "./schemas.sqlite";
import type {
	DatabaseType,
	Dj,
	Guild,
	IDatabaseProvider,
	IDjRepository,
	IGuildRepository,
	IPlaylistRepository,
	IRoleRepository,
	ISetupRepository,
	IStayRepository,
	Playlist,
	Role,
	Setup,
	Stay,
} from "./types";

type PgLikeDB = NodePgDatabase<typeof pgSchema> | PgliteDatabase<typeof pgSchema>;
type SqliteDB = BunSQLiteDatabase<typeof sqliteSchema>;

export class PostgresProvider implements IDatabaseProvider {
	readonly type: DatabaseType;
	readonly db: PgLikeDB;
	private readonly schema: typeof pgSchema;

	private _guilds?: IGuildRepository;
	private _setups?: ISetupRepository;
	private _stays?: IStayRepository;
	private _djs?: IDjRepository;
	private _roles?: IRoleRepository;
	private _playlists?: IPlaylistRepository;

	constructor(type: DatabaseType, db: PgLikeDB, schema: typeof pgSchema) {
		this.type = type;
		this.db = db;
		this.schema = schema;
	}

	get guilds(): IGuildRepository {
		if (!this._guilds) {
			this._guilds = this.createGuildRepository();
		}
		return this._guilds;
	}

	get setups(): ISetupRepository {
		if (!this._setups) {
			this._setups = this.createSetupRepository();
		}
		return this._setups;
	}

	get stays(): IStayRepository {
		if (!this._stays) {
			this._stays = this.createStayRepository();
		}
		return this._stays;
	}

	get djs(): IDjRepository {
		if (!this._djs) {
			this._djs = this.createDjRepository();
		}
		return this._djs;
	}

	get roles(): IRoleRepository {
		if (!this._roles) {
			this._roles = this.createRoleRepository();
		}
		return this._roles;
	}

	get playlists(): IPlaylistRepository {
		if (!this._playlists) {
			this._playlists = this.createPlaylistRepository();
		}
		return this._playlists;
	}

	async connect(): Promise<void> {}

	async disconnect(): Promise<void> {}

	private createGuildRepository(): IGuildRepository {
		const db = this.db;
		const { guild } = this.schema;

		const repo: IGuildRepository = {
			async get(guildId: string): Promise<Guild> {
				const result = await db.select().from(guild).where(eq(guild.guildId, guildId));

				if (result.length > 0) return result[0] as Guild;

				await db
					.insert(guild)
					.values({
						guildId,
						prefix: env.PREFIX,
						language: env.DEFAULT_LANGUAGE,
					})
					.onConflictDoNothing();

				const created = await db.select().from(guild).where(eq(guild.guildId, guildId));
				return created[0] as Guild;
			},

			async setPrefix(guildId: string, prefix: string): Promise<void> {
				await repo.get(guildId);
				await db.update(guild).set({ prefix }).where(eq(guild.guildId, guildId));
			},

			async getPrefix(guildId: string): Promise<string> {
				const g = await repo.get(guildId);
				return g?.prefix ?? env.PREFIX;
			},

			async updateLanguage(guildId: string, language: string): Promise<void> {
				await repo.get(guildId);
				await db.update(guild).set({ language }).where(eq(guild.guildId, guildId));
			},

			async getLanguage(guildId: string): Promise<string> {
				const g = await repo.get(guildId);
				return g?.language ?? env.DEFAULT_LANGUAGE;
			},

			async setDefaultVolume(guildId: string, volume: number): Promise<void> {
				await repo.get(guildId);
				await db.update(guild).set({ defaultVolume: volume }).where(eq(guild.guildId, guildId));
			},

			async getDefaultVolume(guildId: string): Promise<number> {
				const g = await repo.get(guildId);
				return g?.defaultVolume ?? 50;
			},
		};

		return repo;
	}

	private createSetupRepository(): ISetupRepository {
		const db = this.db;
		const { setup } = this.schema;
		const guilds = this.guilds;

		const repo: ISetupRepository = {
			async get(guildId: string): Promise<Setup | null> {
				const r = await db.select().from(setup).where(eq(setup.guildId, guildId));
				return (r[0] as Setup) ?? null;
			},

			async set(guildId: string, textId: string, messageId: string): Promise<void> {
				await guilds.get(guildId);
				const existing = await repo.get(guildId);

				if (existing) {
					await db.update(setup).set({ textId, messageId }).where(eq(setup.guildId, guildId));
				} else {
					await db.insert(setup).values({ guildId, textId, messageId });
				}
			},

			async delete(guildId: string): Promise<void> {
				await db.delete(setup).where(eq(setup.guildId, guildId));
			},
		};

		return repo;
	}

	private createStayRepository(): IStayRepository {
		const db = this.db;
		const { stay } = this.schema;
		const guilds = this.guilds;

		const repo: IStayRepository = {
			async get(guildId?: string): Promise<Stay | Stay[] | null> {
				if (guildId) {
					const r = await db.select().from(stay).where(eq(stay.guildId, guildId));
					return (r[0] as Stay) ?? null;
				}
				return (await db.select().from(stay)) as Stay[];
			},

			async set(guildId: string, textId: string, voiceId: string): Promise<void> {
				await guilds.get(guildId);
				const existing = await repo.get(guildId);

				if (existing && !Array.isArray(existing)) {
					await db.update(stay).set({ textId, voiceId }).where(eq(stay.guildId, guildId));
				} else {
					await db.insert(stay).values({ guildId, textId, voiceId });
				}
			},

			async delete(guildId: string): Promise<void> {
				await db.delete(stay).where(eq(stay.guildId, guildId));
			},
		};

		return repo;
	}

	private createDjRepository(): IDjRepository {
		const db = this.db;
		const { dj } = this.schema;
		const guilds = this.guilds;

		const repo: IDjRepository = {
			async get(guildId: string): Promise<Dj | null> {
				const r = await db.select().from(dj).where(eq(dj.guildId, guildId));
				return (r[0] as Dj) ?? null;
			},

			async setMode(guildId: string, mode: boolean): Promise<void> {
				await guilds.get(guildId);
				const existing = await repo.get(guildId);

				if (existing) {
					await db
						.update(dj)
						.set({ mode: mode ? 1 : 0 })
						.where(eq(dj.guildId, guildId));
				} else {
					await db.insert(dj).values({ guildId, mode: mode ? 1 : 0 });
				}
			},
		};

		return repo;
	}

	private createRoleRepository(): IRoleRepository {
		const db = this.db;
		const { role } = this.schema;
		const guilds = this.guilds;

		return {
			async getAll(guildId: string): Promise<Role[]> {
				return (await db.select().from(role).where(eq(role.guildId, guildId))) as Role[];
			},

			async add(guildId: string, roleId: string): Promise<void> {
				await guilds.get(guildId);
				await db.insert(role).values({ guildId, roleId }).onConflictDoNothing();
			},

			async remove(guildId: string, roleId: string): Promise<void> {
				await db.delete(role).where(and(eq(role.guildId, guildId), eq(role.roleId, roleId)));
			},

			async clear(guildId: string): Promise<void> {
				await db.delete(role).where(eq(role.guildId, guildId));
			},
		};
	}

	private createPlaylistRepository(): IPlaylistRepository {
		const db = this.db;
		const { playlist } = this.schema;

		const repo: IPlaylistRepository = {
			async get(userId: string, name: string): Promise<Playlist | null> {
				const r = await db
					.select()
					.from(playlist)
					.where(and(eq(playlist.userId, userId), eq(playlist.name, name)));
				return (r[0] as Playlist) ?? null;
			},

			async getUserPlaylists(userId: string): Promise<Playlist[]> {
				return (await db.select().from(playlist).where(eq(playlist.userId, userId))) as Playlist[];
			},

			async create(userId: string, name: string): Promise<void> {
				await db
					.insert(playlist)
					.values({
						id: randomUUID(),
						userId,
						name,
						tracks: JSON.stringify([]),
					})
					.onConflictDoNothing();
			},

			async createWithTracks(userId: string, name: string, tracks: string[]): Promise<void> {
				await db
					.insert(playlist)
					.values({
						id: randomUUID(),
						userId,
						name,
						tracks: JSON.stringify(tracks),
					})
					.onConflictDoNothing();
			},

			async delete(userId: string, name: string): Promise<void> {
				await db.delete(playlist).where(and(eq(playlist.userId, userId), eq(playlist.name, name)));
			},

			async clearTracks(userId: string, playlistName: string): Promise<void> {
				await db
					.update(playlist)
					.set({ tracks: JSON.stringify([]) })
					.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
			},

			async addTracks(userId: string, playlistName: string, tracks: string[]): Promise<void> {
				const p = await repo.get(userId, playlistName);

				if (!p) {
					await repo.createWithTracks(userId, playlistName, tracks);
					return;
				}

				const existing = p.tracks ? JSON.parse(p.tracks) : [];
				const updated = [...existing, ...tracks];

				await db
					.update(playlist)
					.set({ tracks: JSON.stringify(updated) })
					.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
			},

			async removeTrack(userId: string, playlistName: string, encodedSong: string): Promise<void> {
				const p = await repo.get(userId, playlistName);
				if (!p) return;

				const tracks: string[] = JSON.parse(p.tracks ?? "[]");
				const idx = tracks.indexOf(encodedSong);
				if (idx !== -1) tracks.splice(idx, 1);

				await db
					.update(playlist)
					.set({ tracks: JSON.stringify(tracks) })
					.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
			},

			async getTracks(userId: string, playlistName: string): Promise<string[] | null> {
				const p = await repo.get(userId, playlistName);
				if (!p) return null;
				return JSON.parse(p.tracks ?? "[]");
			},
		};

		return repo;
	}
}

export class SQLiteProvider implements IDatabaseProvider {
	readonly type: DatabaseType;
	readonly db: SqliteDB;
	private readonly schema: typeof sqliteSchema;

	private _guilds?: IGuildRepository;
	private _setups?: ISetupRepository;
	private _stays?: IStayRepository;
	private _djs?: IDjRepository;
	private _roles?: IRoleRepository;
	private _playlists?: IPlaylistRepository;

	constructor(type: DatabaseType, db: SqliteDB, schema: typeof sqliteSchema) {
		this.type = type;
		this.db = db;
		this.schema = schema;
	}

	get guilds(): IGuildRepository {
		if (!this._guilds) {
			this._guilds = this.createGuildRepository();
		}
		return this._guilds;
	}

	get setups(): ISetupRepository {
		if (!this._setups) {
			this._setups = this.createSetupRepository();
		}
		return this._setups;
	}

	get stays(): IStayRepository {
		if (!this._stays) {
			this._stays = this.createStayRepository();
		}
		return this._stays;
	}

	get djs(): IDjRepository {
		if (!this._djs) {
			this._djs = this.createDjRepository();
		}
		return this._djs;
	}

	get roles(): IRoleRepository {
		if (!this._roles) {
			this._roles = this.createRoleRepository();
		}
		return this._roles;
	}

	get playlists(): IPlaylistRepository {
		if (!this._playlists) {
			this._playlists = this.createPlaylistRepository();
		}
		return this._playlists;
	}

	async connect(): Promise<void> {}

	async disconnect(): Promise<void> {}

	private createGuildRepository(): IGuildRepository {
		const db = this.db;
		const { guild } = this.schema;

		const repo: IGuildRepository = {
			async get(guildId: string): Promise<Guild> {
				const result = await db.select().from(guild).where(eq(guild.guildId, guildId));

				if (result.length > 0) return result[0] as unknown as Guild;

				await db
					.insert(guild)
					.values({
						guildId,
						prefix: env.PREFIX,
						language: env.DEFAULT_LANGUAGE,
					})
					.onConflictDoNothing();

				const created = await db.select().from(guild).where(eq(guild.guildId, guildId));
				return created[0] as unknown as Guild;
			},

			async setPrefix(guildId: string, prefix: string): Promise<void> {
				await repo.get(guildId);
				await db.update(guild).set({ prefix }).where(eq(guild.guildId, guildId));
			},

			async getPrefix(guildId: string): Promise<string> {
				const g = await repo.get(guildId);
				return g?.prefix ?? env.PREFIX;
			},

			async updateLanguage(guildId: string, language: string): Promise<void> {
				await repo.get(guildId);
				await db.update(guild).set({ language }).where(eq(guild.guildId, guildId));
			},

			async getLanguage(guildId: string): Promise<string> {
				const g = await repo.get(guildId);
				return g?.language ?? env.DEFAULT_LANGUAGE;
			},

			async setDefaultVolume(guildId: string, volume: number): Promise<void> {
				await repo.get(guildId);
				await db.update(guild).set({ defaultVolume: volume }).where(eq(guild.guildId, guildId));
			},

			async getDefaultVolume(guildId: string): Promise<number> {
				const g = await repo.get(guildId);
				return g?.defaultVolume ?? 50;
			},
		};

		return repo;
	}

	private createSetupRepository(): ISetupRepository {
		const db = this.db;
		const { setup } = this.schema;
		const guilds = this.guilds;

		const repo: ISetupRepository = {
			async get(guildId: string): Promise<Setup | null> {
				const r = await db.select().from(setup).where(eq(setup.guildId, guildId));
				return (r[0] as unknown as Setup) ?? null;
			},

			async set(guildId: string, textId: string, messageId: string): Promise<void> {
				await guilds.get(guildId);
				const existing = await repo.get(guildId);

				if (existing) {
					await db.update(setup).set({ textId, messageId }).where(eq(setup.guildId, guildId));
				} else {
					await db.insert(setup).values({ guildId, textId, messageId });
				}
			},

			async delete(guildId: string): Promise<void> {
				await db.delete(setup).where(eq(setup.guildId, guildId));
			},
		};

		return repo;
	}

	private createStayRepository(): IStayRepository {
		const db = this.db;
		const { stay } = this.schema;
		const guilds = this.guilds;

		const repo: IStayRepository = {
			async get(guildId?: string): Promise<Stay | Stay[] | null> {
				if (guildId) {
					const r = await db.select().from(stay).where(eq(stay.guildId, guildId));
					return (r[0] as unknown as Stay) ?? null;
				}
				return (await db.select().from(stay)) as unknown as Stay[];
			},

			async set(guildId: string, textId: string, voiceId: string): Promise<void> {
				await guilds.get(guildId);
				const existing = await repo.get(guildId);

				if (existing && !Array.isArray(existing)) {
					await db.update(stay).set({ textId, voiceId }).where(eq(stay.guildId, guildId));
				} else {
					await db.insert(stay).values({ guildId, textId, voiceId });
				}
			},

			async delete(guildId: string): Promise<void> {
				await db.delete(stay).where(eq(stay.guildId, guildId));
			},
		};

		return repo;
	}

	private createDjRepository(): IDjRepository {
		const db = this.db;
		const { dj } = this.schema;
		const guilds = this.guilds;

		const repo: IDjRepository = {
			async get(guildId: string): Promise<Dj | null> {
				const r = await db.select().from(dj).where(eq(dj.guildId, guildId));
				return (r[0] as unknown as Dj) ?? null;
			},

			async setMode(guildId: string, mode: boolean): Promise<void> {
				await guilds.get(guildId);
				const existing = await repo.get(guildId);

				if (existing) {
					await db
						.update(dj)
						.set({ mode: mode ? 1 : 0 })
						.where(eq(dj.guildId, guildId));
				} else {
					await db.insert(dj).values({ guildId, mode: mode ? 1 : 0 });
				}
			},
		};

		return repo;
	}

	private createRoleRepository(): IRoleRepository {
		const db = this.db;
		const { role } = this.schema;
		const guilds = this.guilds;

		return {
			async getAll(guildId: string): Promise<Role[]> {
				return (await db.select().from(role).where(eq(role.guildId, guildId))) as unknown as Role[];
			},

			async add(guildId: string, roleId: string): Promise<void> {
				await guilds.get(guildId);
				await db.insert(role).values({ guildId, roleId }).onConflictDoNothing();
			},

			async remove(guildId: string, roleId: string): Promise<void> {
				await db.delete(role).where(and(eq(role.guildId, guildId), eq(role.roleId, roleId)));
			},

			async clear(guildId: string): Promise<void> {
				await db.delete(role).where(eq(role.guildId, guildId));
			},
		};
	}

	private createPlaylistRepository(): IPlaylistRepository {
		const db = this.db;
		const { playlist } = this.schema;

		const repo: IPlaylistRepository = {
			async get(userId: string, name: string): Promise<Playlist | null> {
				const r = await db
					.select()
					.from(playlist)
					.where(and(eq(playlist.userId, userId), eq(playlist.name, name)));
				return (r[0] as unknown as Playlist) ?? null;
			},

			async getUserPlaylists(userId: string): Promise<Playlist[]> {
				return (await db
					.select()
					.from(playlist)
					.where(eq(playlist.userId, userId))) as unknown as Playlist[];
			},

			async create(userId: string, name: string): Promise<void> {
				await db
					.insert(playlist)
					.values({
						id: randomUUID(),
						userId,
						name,
						tracks: JSON.stringify([]),
					})
					.onConflictDoNothing();
			},

			async createWithTracks(userId: string, name: string, tracks: string[]): Promise<void> {
				await db
					.insert(playlist)
					.values({
						id: randomUUID(),
						userId,
						name,
						tracks: JSON.stringify(tracks),
					})
					.onConflictDoNothing();
			},

			async delete(userId: string, name: string): Promise<void> {
				await db.delete(playlist).where(and(eq(playlist.userId, userId), eq(playlist.name, name)));
			},

			async clearTracks(userId: string, playlistName: string): Promise<void> {
				await db
					.update(playlist)
					.set({ tracks: JSON.stringify([]) })
					.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
			},

			async addTracks(userId: string, playlistName: string, tracks: string[]): Promise<void> {
				const p = await repo.get(userId, playlistName);

				if (!p) {
					await repo.createWithTracks(userId, playlistName, tracks);
					return;
				}

				const existing = p.tracks ? JSON.parse(p.tracks) : [];
				const updated = [...existing, ...tracks];

				await db
					.update(playlist)
					.set({ tracks: JSON.stringify(updated) })
					.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
			},

			async removeTrack(userId: string, playlistName: string, encodedSong: string): Promise<void> {
				const p = await repo.get(userId, playlistName);
				if (!p) return;

				const tracks: string[] = JSON.parse(p.tracks ?? "[]");
				const idx = tracks.indexOf(encodedSong);
				if (idx !== -1) tracks.splice(idx, 1);

				await db
					.update(playlist)
					.set({ tracks: JSON.stringify(tracks) })
					.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
			},

			async getTracks(userId: string, playlistName: string): Promise<string[] | null> {
				const p = await repo.get(userId, playlistName);
				if (!p) return null;
				return JSON.parse(p.tracks ?? "[]");
			},
		};

		return repo;
	}
}
