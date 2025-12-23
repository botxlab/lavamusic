import {
    EmbedBuilder,
    type Guild,
    type GuildMember,
    type TextChannel,
} from "discord.js";
import { Event, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";

export default class GuildCreate extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			name: "guildCreate",
		});
	}

	public async run(guild: Guild): Promise<void> {
		let owner: GuildMember | undefined;
		try {
			owner = await guild.members.fetch(guild.ownerId);
		} catch (e) {
			logger.error(
				`Error fetching owner for guild ${guild.id}: ${e}`,
			);
		}

		const embed = new EmbedBuilder()
			.setColor(this.client.config.color.green)
			.setAuthor({
				name: guild.name,
				iconURL: guild.iconURL({ extension: "jpeg" })!,
			})
			.setDescription(`**${guild.name}** has been added to my guilds!`)
			.setThumbnail(guild.iconURL({ extension: "jpeg" }))
			.addFields(
				{
					name: "Owner",
					value: owner ? owner.user.tag : "Unknown#0000",
					inline: true,
				},
				{
					name: "Members",
					value: guild.memberCount.toString(),
					inline: true,
				},
				{
					name: "Created At",
					value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
					inline: true,
				},
				{
					name: "Joined At",
					value: `<t:${Math.floor(guild.joinedTimestamp / 1000)}:F>`,
					inline: true,
				},
				{ name: "ID", value: guild.id, inline: true },
			)
			.setTimestamp();

		const logChannelId = this.client.env.LOG_CHANNEL_ID;
		if (!logChannelId) {
			logger.error("Log channel ID not found in configuration.");
			return;
		}

		try {
			const channel = (await this.client.channels.fetch(
				logChannelId,
			)) as TextChannel;
			if (!channel) {
				logger.error(
					`Log channel not found with ID ${logChannelId}. Please change the settings in .env or, if you have a channel, invite me to that guild.`,
				);
				return;
			}

			await channel.send({ embeds: [embed] });
		} catch (error) {
			logger.error(
				`Error sending message to log channel ${logChannelId}: ${error}`,
			);
		}
	}
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
