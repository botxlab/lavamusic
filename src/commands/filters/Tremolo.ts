import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Tremolo extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "tremolo",
			description: {
				content: I18N.commands.tremolo.description,
				examples: ["tremolo"],
				usage: "tremolo",
			},
			category: "filters",
			aliases: ["tr"],
			cooldown: 3,
			args: false,
			vote: false,
			player: {
				voice: true,
				dj: true,
				active: true,
				djPerm: null,
			},
			permissions: {
				dev: false,
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks],
				user: [],
			},
			slashCommand: true,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		const player = client.manager.getPlayer(ctx.guild.id);
		if (!player) return await ctx.sendMessage(ctx.locale(I18N.events.message.no_music_playing));
		const tremoloEnabled = player.filterManager.filters.tremolo;

		if (tremoloEnabled) {
			player.filterManager.toggleTremolo();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.tremolo.messages.disabled),
						color: this.client.color.main,
					},
				],
			});
		} else {
			player.filterManager.toggleTremolo();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.tremolo.messages.enabled),
						color: this.client.color.main,
					},
				],
			});
		}
	}
}
