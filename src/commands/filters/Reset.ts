import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Reset extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "reset",
			description: {
				content: I18N.commands.reset.description,
				examples: ["reset"],
				usage: "reset",
			},
			category: "filters",
			aliases: ["rs"],
			cooldown: 3,
			args: false,
			vote: false,
			player: {
				voice: true,
				dj: true,
				active: false,
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
		player.filterManager.resetFilters();
		player.filterManager.clearEQ();
		await ctx.sendMessage({
			embeds: [
				{
					description: ctx.locale(I18N.commands.reset.messages.filters_reset),
					color: this.client.color.main,
				},
			],
		});
	}
}
