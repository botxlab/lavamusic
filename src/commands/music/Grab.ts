import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import type { Requester } from "../../types";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Grab extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "grab",
			description: {
				content: I18N.commands.grab.description,
				examples: ["grab"],
				usage: "grab",
			},
			category: "music",
			aliases: ["gr"],
			cooldown: 3,
			args: false,
			vote: false,
			player: {
				voice: false,
				dj: false,
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

		await ctx.sendDeferMessage(ctx.locale(I18N.commands.grab.loading));

		if (!player?.queue.current) {
			return await ctx.sendMessage({
				embeds: [
					this.client
						.embed()
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.player.errors.no_song)),
				],
			});
		}

		const song = player.queue.current;

		const songInfo = ctx.locale(I18N.commands.grab.content, {
			title: song.info.title,
			uri: song.info.uri,
			artworkUrl: song.info.artworkUrl,
			length: song.info.isStream ? "LIVE" : client.utils.formatTime(song.info.duration),
			requester: (song.requester as Requester).id,
		});

		try {
			await ctx.author?.send({
				embeds: [
					this.client
						.embed()
						.setTitle(`**${song.info.title}**`)
						.setURL(song.info.uri!)
						.setThumbnail(song.info.artworkUrl!)
						.setDescription(songInfo)
						.setColor(this.client.color.main),
				],
			});

			return await ctx.editMessage({
				embeds: [
					this.client
						.embed()
						.setDescription(ctx.locale(I18N.commands.grab.check_dm))
						.setColor(this.client.color.green),
				],
			});
		} catch (_e) {
			return await ctx.editMessage({
				embeds: [
					this.client
						.embed()
						.setDescription(ctx.locale(I18N.commands.grab.dm_failed))
						.setColor(this.client.color.red),
				],
			});
		}
	}
}
