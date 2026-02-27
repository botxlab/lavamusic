import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} from "discord.js";
import { I18N, t } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

const deployStatus = {
	deploy: {
		global: { key: I18N.dev.deploy.status.deployed_global, emoji: "🚀" },
		guild: { key: I18N.dev.deploy.status.deployed_guild, emoji: "✅" },
	},
	undeploy: {
		global: { key: I18N.dev.deploy.status.removed_global, emoji: "🗑️" },
		guild: { key: I18N.dev.deploy.status.removed_guild, emoji: "❌" },
	},
} as const;

type ActionType = "deploy" | "undeploy";
type ScopeType = "global" | "guild";

export default class Deploy extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "deploy",
			description: {
				content: `🔁 ${I18N.dev.deploy.description}`,
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
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks],
				user: [],
			},
			slashCommand: false,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context, _args: string[]): Promise<any> {
		const buildButton = (id: string, labelKey: string, style: ButtonStyle) =>
			new ButtonBuilder()
				.setCustomId(id)
				.setLabel(t(labelKey, { lng: ctx.guildLocale }))
				.setStyle(style);

		const deployRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			buildButton("deploy-global", I18N.dev.deploy.buttons.deploy_global, ButtonStyle.Success),
			buildButton("deploy-guild", I18N.dev.deploy.buttons.deploy_guild, ButtonStyle.Primary),
		);

		const undeployRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			buildButton("undeploy-global", I18N.dev.deploy.buttons.remove_global, ButtonStyle.Danger),
			buildButton("undeploy-guild", I18N.dev.deploy.buttons.remove_guild, ButtonStyle.Secondary),
		);

		const msg = await ctx.sendMessage({
			content: `⚠️ ${ctx.locale(I18N.dev.deploy.prompt)}`,
			components: [deployRow, undeployRow],
			flags: MessageFlags.Ephemeral,
		});

		if (!msg) return;

		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 45000,
			filter: (i) => i.user.id === ctx.author?.id,
		});

		collector.on("collect", async (interaction: ButtonInteraction) => {
			if (interaction.user.id !== ctx.author?.id) {
				return await interaction.reply({
					content: ctx.locale(I18N.common.errors.no_permissions),
					flags: MessageFlags.Ephemeral,
				});
			}

			await interaction.deferUpdate();

			const [action, scope] = interaction.customId.split("-") as [ActionType, ScopeType];
			const isClear = action === "undeploy";
			const guildId = scope === "guild" ? interaction.guildId! : undefined;

			try {
				await client.syncCommands(guildId, isClear);

				const { key, emoji } = deployStatus[action][scope];

				await ctx.editMessage({
					content: `${emoji} ${ctx.locale(key)}`,
					components: [],
				});

				collector.stop("success");
				return;
			} catch (error) {
				logger.error(`[DEPLOY] ${ctx.locale(I18N.dev.deploy.status.failed, { error: error })} `);

				await ctx.editMessage({
					content: ctx.locale(I18N.common.errors.generic, { error: error }),
					components: [],
				});
				return;
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
