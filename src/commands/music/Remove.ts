import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Remove extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "remove",
			description: {
				content: I18N.commands.remove.description,
				examples: ["remove 1"],
				usage: "remove <song number>",
			},
			category: "music",
			aliases: ["rm"],
			cooldown: 3,
			args: true,
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
			options: [
				{
					name: "song",
					description: I18N.commands.remove.options.song,
					type: 4,
					required: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const player = client.manager.getPlayer(ctx.guild.id);
		const embed = this.client.embed();
		if (!player) return await ctx.sendMessage(ctx.locale(I18N.events.message.no_music_playing));
		if (player.queue.tracks.length === 0)
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.remove.errors.no_songs)),
				],
			});

		const songNumber = Number(args[0]);
		if (Number.isNaN(songNumber) || songNumber <= 0 || songNumber > player.queue.tracks.length)
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.remove.errors.invalid_number)),
				],
			});

		player.queue.remove(songNumber - 1);
		return await ctx.sendMessage({
			embeds: [
				embed.setColor(this.client.color.main).setDescription(
					ctx.locale(I18N.commands.remove.messages.removed, {
						songNumber,
					}),
				),
			],
		});
	}
}
