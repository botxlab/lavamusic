import { type ClientOptions, GatewayIntentBits, Options } from "discord.js";
import { env } from "./env";
import Lavamusic from "./structures/Lavamusic";

const { MessageContent, GuildVoiceStates, GuildMessages, Guilds, GuildMessageTyping } =
	GatewayIntentBits;

const clientOptions: ClientOptions = {
	intents: [Guilds, GuildMessages, MessageContent, GuildVoiceStates, GuildMessageTyping],
	allowedMentions: { parse: ["users", "roles"], repliedUser: false },
	makeCache: Options.cacheWithLimits({
		...Options.DefaultMakeCacheSettings,
		ReactionManager: 0,
		GuildScheduledEventManager: 0,
		DMMessageManager: 0,
		StageInstanceManager: 0,
		GuildEmojiManager: 0,
		GuildStickerManager: 0,
		MessageManager: {
			maxSize: 100,
			keepOverLimit: (m) => m.author.id === m.client.user.id,
		},
		GuildMemberManager: {
			maxSize: 100,
			keepOverLimit: (m) => m.user.id === m.client.user.id,
		},
		UserManager: 100,
		PresenceManager: 0,
	}),
};

const client = new Lavamusic(clientOptions);
client.start(env.TOKEN);

/**
 * Project: lavamusic
 * Author: Appu
 * Main Contributor: LucasB25
 * Company: Coders
 * Copyright (c) 2024. All rights reserved.
 * This code is the property of Coder and may not be reproduced or
 * modified without permission. For more information, contact us at
 * https://discord.gg/YQsGbTwPBx
 */
