import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";

import type * as pgSchema from "./schemas";
import type * as sqliteSchema from "./schemas.sqlite";

export enum DatabaseType {
	Postgres = "postgres",
	PGLite = "pglite",
	SQLite = "sqlite",
}

export type PostgresDB = NodePgDatabase<typeof pgSchema>;
export type PGLiteDB = PgliteDatabase<typeof pgSchema>;
export type SQLiteDB = BunSQLiteDatabase<typeof sqliteSchema>;

export type AnyDatabase = PostgresDB | PGLiteDB | SQLiteDB;

export type Guild = InferSelectModel<typeof pgSchema.guild>;
export type NewGuild = InferInsertModel<typeof pgSchema.guild>;

export type Setup = InferSelectModel<typeof pgSchema.setup>;
export type NewSetup = InferInsertModel<typeof pgSchema.setup>;

export type Stay = InferSelectModel<typeof pgSchema.stay>;
export type NewStay = InferInsertModel<typeof pgSchema.stay>;

export type Dj = InferSelectModel<typeof pgSchema.dj>;
export type NewDj = InferInsertModel<typeof pgSchema.dj>;

export type Role = InferSelectModel<typeof pgSchema.role>;
export type NewRole = InferInsertModel<typeof pgSchema.role>;

export type Playlist = InferSelectModel<typeof pgSchema.playlist>;
export type NewPlaylist = InferInsertModel<typeof pgSchema.playlist>;

export type Bot = InferSelectModel<typeof pgSchema.bot>;
export type NewBot = InferInsertModel<typeof pgSchema.bot>;

export interface DatabaseConfig {
	type: DatabaseType;
	url?: string;
}

export interface IGuildRepository {
	get(guildId: string): Promise<Guild>;
	setPrefix(guildId: string, prefix: string): Promise<void>;
	getPrefix(guildId: string): Promise<string>;
	updateLanguage(guildId: string, language: string): Promise<void>;
	getLanguage(guildId: string): Promise<string>;
	setDefaultVolume(guildId: string, volume: number): Promise<void>;
	getDefaultVolume(guildId: string): Promise<number>;
}

export interface ISetupRepository {
	get(guildId: string): Promise<Setup | null>;
	set(guildId: string, textId: string, messageId: string): Promise<void>;
	delete(guildId: string): Promise<void>;
}

export interface IStayRepository {
	get(guildId?: string): Promise<Stay | Stay[] | null>;
	set(guildId: string, textId: string, voiceId: string): Promise<void>;
	delete(guildId: string): Promise<void>;
}

export interface IDjRepository {
	get(guildId: string): Promise<Dj | null>;
	setMode(guildId: string, mode: boolean): Promise<void>;
}

export interface IRoleRepository {
	getAll(guildId: string): Promise<Role[]>;
	add(guildId: string, roleId: string): Promise<void>;
	remove(guildId: string, roleId: string): Promise<void>;
	clear(guildId: string): Promise<void>;
}

export interface IPlaylistRepository {
	get(userId: string, name: string): Promise<Playlist | null>;
	getUserPlaylists(userId: string): Promise<Playlist[]>;
	create(userId: string, name: string): Promise<void>;
	createWithTracks(userId: string, name: string, tracks: string[]): Promise<void>;
	delete(userId: string, name: string): Promise<void>;
	clearTracks(userId: string, playlistName: string): Promise<void>;
	addTracks(userId: string, playlistName: string, tracks: string[]): Promise<void>;
	removeTrack(userId: string, playlistName: string, encodedSong: string): Promise<void>;
	getTracks(userId: string, playlistName: string): Promise<string[] | null>;
}

export interface IDatabaseProvider {
	readonly type: DatabaseType;
	readonly db: AnyDatabase;

	readonly guilds: IGuildRepository;
	readonly setups: ISetupRepository;
	readonly stays: IStayRepository;
	readonly djs: IDjRepository;
	readonly roles: IRoleRepository;
	readonly playlists: IPlaylistRepository;

	connect(): Promise<void>;
	disconnect(): Promise<void>;
}
