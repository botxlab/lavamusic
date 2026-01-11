import { type ClientOptions, GatewayIntentBits, Options, Sweepers } from "discord.js";
import { env } from "./env";
import Lavamusic from "./structures/Lavamusic";

const { MessageContent, GuildVoiceStates, GuildMessages, Guilds } =
	GatewayIntentBits;

export async function launch() {
	const clientOptions: ClientOptions = {
		intents: [Guilds, GuildMessages, MessageContent, GuildVoiceStates],
		allowedMentions: { parse: ["users", "roles"], repliedUser: false },
		makeCache: Options.cacheWithLimits({
			...Options.DefaultMakeCacheSettings,
			MessageManager: 0,
			ThreadManager: 0,
			ThreadMemberManager: 0,
			GuildMemberManager: { maxSize: 10, keepOverLimit: (m) => m.id === m.client.user.id },
			UserManager: { maxSize: 10, keepOverLimit: (u) => u.id === u.client.user.id },
			GuildEmojiManager: 0,
			GuildStickerManager: 0,
			GuildBanManager: 0,
			GuildInviteManager: 0,
			GuildScheduledEventManager: 0,
			ReactionManager: 0,
			PresenceManager: 0,
			StageInstanceManager: 0,
			AutoModerationRuleManager: 0,
			DMMessageManager: 0,
		}),
		sweepers: {
			...Options.DefaultSweeperSettings,
			messages: {
				interval: 3600,
				filter: Sweepers.outdatedMessageSweepFilter(1800),
			},
			threads: {
				interval: 3600,
				filter: Sweepers.archivedThreadSweepFilter(1800),
			},
			invites: {
				interval: 3600,
				filter: Sweepers.expiredInviteSweepFilter(),
			},
		},
	};

	const client = new Lavamusic(clientOptions);
	await client.start(env.TOKEN);
}

// Allow standalone execution in dev mode (when this file is the entry point)
if (import.meta.main) launch();

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
