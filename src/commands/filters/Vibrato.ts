import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Vibrato extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "vibrato",
			description: {
				content: I18N.commands.vibrato.description,
				examples: ["vibrato"],
				usage: "vibrato",
			},
			category: "filters",
			aliases: ["vb"],
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
		const vibratoEnabled = player.filterManager.filters.vibrato;

		if (vibratoEnabled) {
			player.filterManager.toggleVibrato();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.vibrato.messages.disabled),
						color: this.client.color.main,
					},
				],
			});
		} else {
			player.filterManager.toggleVibrato();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.vibrato.messages.enabled),
						color: this.client.color.main,
					},
				],
			});
		}
	}
}
