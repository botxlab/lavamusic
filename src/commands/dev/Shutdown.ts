import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Shutdown extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "shutdown",
			description: {
				content: I18N.dev.shutdown.description,
				examples: ["shutdown"],
				usage: "shutdown",
			},
			category: "dev",
			aliases: ["turnoff"],
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
		const button = new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel(I18N.dev.shutdown.prompt)
			.setCustomId("confirm-shutdown");
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
		const shutdownEmbed = embed
			.setColor(this.client.color.red)
			.setDescription(`**Are you sure you want to shutdown the bot **\`${client.user?.username}\`?`)
			.setTimestamp();

		const msg = await ctx.sendMessage({
			embeds: [shutdownEmbed],
			components: [row],
		});

		const filter = (i: any) => i.customId === "confirm-shutdown" && i.user.id === ctx.author?.id;
		const collector = msg.createMessageComponentCollector({
			time: 30000,
			filter,
		});

		collector.on("collect", async (i) => {
			await i.deferUpdate();

			await msg.edit({
				content: I18N.dev.shutdown.status,
				embeds: [],
				components: [],
			});

			await client.destroy();
			process.exit(0);
		});

		collector.on("end", async () => {
			if (collector.collected.size === 0) {
				await msg.edit({
					content: I18N.dev.shutdown.canceled,
					components: [],
				});
			}
		});
	}
}
