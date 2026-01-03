CREATE TABLE `Bot` (
	`botId` text PRIMARY KEY NOT NULL,
	`totalPlaySong` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `Dj` (
	`guildId` text PRIMARY KEY NOT NULL,
	`mode` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Guild` (
	`guildId` text PRIMARY KEY NOT NULL,
	`prefix` text NOT NULL,
	`language` text DEFAULT 'EnglishUS'
);
--> statement-breakpoint
CREATE TABLE `Playlist` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`tracks` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_playlist_unique` ON `Playlist` (`userId`,`name`);--> statement-breakpoint
CREATE TABLE `Role` (
	`guildId` text NOT NULL,
	`roleId` text NOT NULL,
	FOREIGN KEY (`guildId`) REFERENCES `Guild`(`guildId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guild_role_unique` ON `Role` (`guildId`,`roleId`);--> statement-breakpoint
CREATE TABLE `Setup` (
	`guildId` text PRIMARY KEY NOT NULL,
	`textId` text NOT NULL,
	`messageId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Stay` (
	`guildId` text PRIMARY KEY NOT NULL,
	`textId` text NOT NULL,
	`voiceId` text NOT NULL
);
