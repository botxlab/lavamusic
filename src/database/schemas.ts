import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const bot = sqliteTable("Bot", {
    botId: text("botId").primaryKey(),
    totalPlaySong: int("totalPlaySong").default(0),
});

export const guild = sqliteTable("Guild", {
    guildId: text("guildId").primaryKey(),
    prefix: text("prefix").notNull(),
    language: text("language").default("EnglishUS"),
});

export const stay = sqliteTable("Stay", {
    guildId: text("guildId").primaryKey(),
    textId: text("textId").notNull(),
    voiceId: text("voiceId").notNull(),
});

export const dj = sqliteTable("Dj", {
    guildId: text("guildId").primaryKey(),
    mode: int("mode").notNull(),
});

export const role = sqliteTable(
    "Role",
    {
        guildId: text("guildId").notNull().references(() => guild.guildId),
        roleId: text("roleId").notNull(),
    },
    (table) => [
        uniqueIndex("guild_role_unique").on(table.guildId, table.roleId),
    ]
);

export const playlist = sqliteTable("Playlist", {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    tracks: text("tracks"),
}, (table) => [
    uniqueIndex("user_playlist_unique").on(table.userId, table.name),
]);


export const setup = sqliteTable("Setup", {
    guildId: text("guildId").primaryKey(),
    textId: text("textId").notNull(),
    messageId: text("messageId").notNull(),
});
