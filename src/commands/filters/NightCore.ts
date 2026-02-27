import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class NightCore extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "nightcore",
			description: {
				content: I18N.commands.nightcore.description,
				examples: ["nightcore"],
				usage: "nightcore",
			},
			category: "filters",
			aliases: ["nc"],
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
		const filterEnabled = player.filterManager.filters.nightcore;

		if (filterEnabled) {
			await player.filterManager.toggleNightcore();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.nightcore.messages.filter_disabled),
						color: this.client.color.main,
					},
				],
			});
		} else {
			await player.filterManager.toggleNightcore();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.nightcore.messages.filter_enabled),
						color: this.client.color.main,
					},
				],
			});
		}
	}
}
