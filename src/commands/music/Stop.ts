import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Stop extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "stop",
			description: {
				content: I18N.commands.stop.description,
				examples: ["stop"],
				usage: "stop",
			},
			category: "music",
			aliases: ["sp"],
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
		const embed = this.client.embed();
		if (!player) return await ctx.sendMessage(ctx.locale(I18N.events.message.no_music_playing));
		player.stopPlaying(true, false);

		return await ctx.sendMessage({
			embeds: [
				embed
					.setColor(this.client.color.main)
					.setDescription(ctx.locale(I18N.commands.stop.messages.stopped)),
			],
		});
	}
}
