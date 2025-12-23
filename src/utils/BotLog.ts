import { ChannelType } from "discord.js";
import type { Lavamusic } from "../structures/index";
import { LOG_COLORS, type DCLogLevel } from "../types/log";

/**
 * Sends a log message to the configured log channel.
 *
 * @param client - The bot client instance.
 * @param message - The message content to log.
 * @param level - The severity level of the log.
 */
export async function sendLog(client: Lavamusic, message: string, level: DCLogLevel) {
	const logChannelId = client?.env?.LOG_CHANNEL_ID;

	if (!client.channels.cache || !logChannelId) return;

	const channel = client.channels.cache.get(logChannelId);

	// Ensure channel exists and is a text channel
	if (!channel || channel.type !== ChannelType.GuildText) return;

	const color = LOG_COLORS[level] || LOG_COLORS.INFO;
	const embed = client.embed().setColor(color).setDescription(message).setTimestamp();

	await channel.send({ embeds: [embed] }).catch(() => null);
}

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
