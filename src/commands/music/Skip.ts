import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Skip extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "skip",
			description: {
				content: I18N.commands.skip.description,
				examples: ["skip"],
				usage: "skip",
			},
			category: "music",
			aliases: ["sk"],
			cooldown: 3,
			args: false,
			vote: true,
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
		const autoplay = player.get<boolean>("autoplay");
		const currentTrack = player.queue.current;
		if (!currentTrack && player.queue.tracks.length === 0) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.player.errors.no_song)),
				],
			});
		}
		if (player.queue.tracks.length === 0 && !autoplay) {
			await player.stopPlaying(false, false);
		} else {
			await player.skip();
		}
		if (ctx.isInteraction) {
			return await ctx.sendMessage({
				embeds: [
					embed.setColor(this.client.color.main).setDescription(
						ctx.locale(I18N.commands.skip.messages.skipped, {
							title: currentTrack?.info.title,
							uri: currentTrack?.info.uri,
						}),
					),
				],
			});
		}
		ctx.message?.react("👍");
	}
}
