CREATE TABLE "Bot" (
	"botId" text PRIMARY KEY NOT NULL,
	"totalPlaySong" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "Dj" (
	"guildId" text PRIMARY KEY NOT NULL,
	"mode" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Guild" (
	"guildId" text PRIMARY KEY NOT NULL,
	"prefix" text NOT NULL,
	"language" text DEFAULT 'EnglishUS',
	"defaultVolume" integer DEFAULT 50
);
--> statement-breakpoint
CREATE TABLE "Playlist" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"tracks" text
);
--> statement-breakpoint
CREATE TABLE "Role" (
	"guildId" text NOT NULL,
	"roleId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Setup" (
	"guildId" text PRIMARY KEY NOT NULL,
	"textId" text NOT NULL,
	"messageId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Stay" (
	"guildId" text PRIMARY KEY NOT NULL,
	"textId" text NOT NULL,
	"voiceId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Role" ADD CONSTRAINT "Role_guildId_Guild_guildId_fk" FOREIGN KEY ("guildId") REFERENCES "public"."Guild"("guildId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_playlist_unique" ON "Playlist" USING btree ("userId","name");--> statement-breakpoint
CREATE UNIQUE INDEX "guild_role_unique" ON "Role" USING btree ("guildId","roleId");