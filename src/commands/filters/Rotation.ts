import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Rotation extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "rotation",
			description: {
				content: I18N.commands.rotation.description,
				examples: ["rotation"],
				usage: "rotation",
			},
			category: "filters",
			aliases: ["rt"],
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
		if (player.filterManager.filters.rotation) {
			player.filterManager.toggleRotation();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.rotation.messages.disabled),
						color: this.client.color.main,
					},
				],
			});
		} else {
			player.filterManager.toggleRotation();
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.rotation.messages.enabled),
						color: this.client.color.main,
					},
				],
			});
		}
	}
}
