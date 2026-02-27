import { ChannelType } from "discord.js";
import type { Lavamusic } from "../structures/index";
import { type EmbedLogLevel, LOG_COLORS } from "../types/log";

export async function sendLog(client: Lavamusic, message: string, level: EmbedLogLevel) {
	const logChannelId = client?.env?.LOG_CHANNEL_ID;

	if (!client.channels.cache || !logChannelId) return;

	const channel = client.channels.cache.get(logChannelId);

	if (!channel || channel.type !== ChannelType.GuildText) return;

	const color = LOG_COLORS[level] || LOG_COLORS.INFO;
	const embed = client.embed().setColor(color).setDescription(message).setTimestamp();

	await channel.send({ embeds: [embed] }).catch(() => null);
}
