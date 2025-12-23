import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageFlags,
	type ButtonInteraction,
	type Message,
} from "discord.js";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";

export default class Deploy extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "deploy",
			description: {
				content: "Deploy commands",
				examples: ["deploy"],
				usage: "deploy",
			},
			category: "dev",
			aliases: ["deploy-commands"],
			cooldown: 3,
			args: false,
			player: {
				voice: false,
				dj: false,
				active: false,
				djPerm: null,
			},
			permissions: {
				dev: true,
				client: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
				user: [],
			},
			slashCommand: false,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context, _args: string[]): Promise<any> {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("deploy-global")
				.setLabel("Global")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId("deploy-guild")
				.setLabel("Guild")
				.setStyle(ButtonStyle.Secondary),
		);

		let msg: Message | undefined;
		try {
			msg = await ctx.sendMessage({
				content: "Where do you want to deploy the commands?",
				components: [row],
			});
		} catch (error) {
			logger.error("Failed to send the initial message:", error);
			return;
		}

		const filter = (interaction: ButtonInteraction) => {
			if (interaction.user.id !== ctx.author?.id) {
				interaction
					.reply({
						content: "You can't interact with this message",
						flags: MessageFlags.Ephemeral,
					})
					.catch(logger.error);
				return false;
			}
			return true;
		};

		const collector = msg!.createMessageComponentCollector({
			filter: (interaction) => {
				if (interaction.message.id !== msg!.id) return false;
				return filter(interaction);
			},
			componentType: ComponentType.Button,
			time: 30000,
		});

		collector.on("collect", async (interaction) => {
			try {
				if (interaction.customId === "deploy-global") {
					await interaction.deferUpdate(); // acknowledge first
					await client.deployCommands();
					await ctx.editMessage({
						content: "Commands deployed globally.",
						components: [],
					});
				} else if (interaction.customId === "deploy-guild") {
					await interaction.deferUpdate(); // acknowledge first
					await client.deployCommands(interaction.guild!.id);
					await ctx.editMessage({
						content: "Commands deployed in this guild.",
						components: [],
					});
				}
			} catch (error) {
				logger.error("Failed to handle interaction:", error);
			}
		});

		collector.on("end", async (_collected, reason) => {
			if (reason === "time" && msg) {
				try {
					await msg.delete();
				} catch (error) {
					logger.error("Failed to delete the message:", error);
				}
			}
		});
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
