import { integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const bot = pgTable("Bot", {
	botId: text("botId").primaryKey(),
	totalPlaySong: integer("totalPlaySong").default(0),
});

export const guild = pgTable("Guild", {
	guildId: text("guildId").primaryKey(),
	prefix: text("prefix").notNull(),
	language: text("language").default("EnglishUS"),
	defaultVolume: integer("defaultVolume").default(50),
});

export const stay = pgTable("Stay", {
	guildId: text("guildId").primaryKey(),
	textId: text("textId").notNull(),
	voiceId: text("voiceId").notNull(),
});

export const dj = pgTable("Dj", {
	guildId: text("guildId").primaryKey(),
	mode: integer("mode").notNull(),
});

export const role = pgTable(
	"Role",
	{
		guildId: text("guildId")
			.notNull()
			.references(() => guild.guildId),
		roleId: text("roleId").notNull(),
	},
	(table) => [uniqueIndex("guild_role_unique").on(table.guildId, table.roleId)],
);

export const playlist = pgTable(
	"Playlist",
	{
		id: text("id").primaryKey(),
		userId: text("userId").notNull(),
		name: text("name").notNull(),
		tracks: text("tracks"),
	},
	(table) => [uniqueIndex("user_playlist_unique").on(table.userId, table.name)],
);

export const setup = pgTable("Setup", {
	guildId: text("guildId").primaryKey(),
	textId: text("textId").notNull(),
	messageId: text("messageId").notNull(),
});
