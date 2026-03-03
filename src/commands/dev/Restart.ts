import { spawn } from "node:child_process";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Restart extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "restart",
			description: {
				content: I18N.dev.restart.description,
				examples: ["restart"],
				usage: "restart",
			},
			category: "dev",
			aliases: ["reboot"],
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
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks],
				user: [],
			},
			slashCommand: false,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<void> {
		const embed = this.client.embed();
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("confirm-restart")
				.setLabel(ctx.locale(I18N.common.ui.confirm))
				.setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setCustomId("cancel-restart")
				.setLabel(ctx.locale(I18N.common.ui.cancel))
				.setStyle(ButtonStyle.Secondary),
		);

		const restartEmbed = embed
			.setColor(this.client.color.red)
			.setTitle(`🔄 ${ctx.locale(I18N.dev.restart.description)}`)
			.setDescription(ctx.locale(I18N.dev.restart.prompt, { client: client.user?.username }))
			.setTimestamp();

		const msg = await ctx.sendMessage({
			embeds: [restartEmbed],
			components: [row],
		});

		if (!msg) return;

		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30000,
			filter: (interaction) => interaction.user.id === ctx.author?.id,
		});

		collector.on("collect", async (interaction) => {
			await interaction.deferUpdate();

			if (interaction.customId === "cancel-restart") {
				await ctx.editMessage({
					content: `❌ ${ctx.locale(I18N.dev.restart.status.canceled)}`,
					embeds: [],
					components: [],
				});
				return collector.stop("canceled");
			}

			// Proceed with restart
			await ctx.editMessage({
				content: `⏳ ${ctx.locale(I18N.dev.restart.status.restarting)}`,
				embeds: [],
				components: [],
			});

			try {
				logger.info(ctx.locale(I18N.dev.restart.restart_by, { user: ctx.author?.username }));

				// Destroy client connection
				await client.destroy();

				// Restart logic
				const child = spawn("bun", ["run", "start"], {
					detached: true,
					stdio: "ignore",
					cwd: process.cwd(),
					env: process.env,
				});

				child.unref();
				process.exit(0);
			} catch (error) {
				logger.error(`${ctx.locale(I18N.dev.restart.status.error)} :`, error);
				await ctx.editMessage({
					content: `⚠️ ${ctx.locale(I18N.dev.restart.status.error)}`,
					components: [],
				});
			}
		});

		collector.on("end", async (_, reason) => {
			if (reason === "time") {
				await ctx
					.editMessage({
						content: `⌛ ${ctx.locale(I18N.dev.restart.status.canceled)}`,
						embeds: [],
						components: [],
					})
					.catch(() => null);
			}
		});
	}
}
