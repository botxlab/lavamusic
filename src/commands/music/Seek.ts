import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Seek extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "seek",
			description: {
				content: I18N.commands.seek.description,
				examples: ["seek 1m, seek 1h 30m", "seek 1h 30m 30s"],
				usage: "seek <duration>",
			},
			category: "music",
			aliases: ["s"],
			cooldown: 3,
			args: true,
			vote: false,
			player: {
				voice: true,
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
			options: [
				{
					name: "duration",
					description: I18N.commands.seek.options.duration,
					type: 3,
					required: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const player = client.manager.getPlayer(ctx.guild.id);
		if (!player) {
			return await ctx.sendMessage(ctx.locale(I18N.events.message.no_music_playing));
		}
		const current = player.queue.current?.info;
		const embed = this.client.embed();
		const durationInput =
			(args.length ? args.join(" ") : (ctx.options?.get("duration")?.value as string)) ?? "";
		const duration = client.utils.parseTime(durationInput);
		if (!duration) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.seek.errors.invalid_format)),
				],
			});
		}
		if (!current?.isSeekable || current.isStream) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.seek.errors.not_seekable)),
				],
			});
		}
		if (duration > current.duration) {
			return await ctx.sendMessage({
				embeds: [
					embed.setColor(this.client.color.red).setDescription(
						ctx.locale(I18N.commands.seek.errors.beyond_duration, {
							length: client.utils.formatTime(current.duration),
						}),
					),
				],
			});
		}
		player?.seek(duration);
		return await ctx.sendMessage({
			embeds: [
				embed.setColor(this.client.color.main).setDescription(
					ctx.locale(I18N.commands.seek.messages.seeked_to, {
						duration: client.utils.formatTime(duration),
					}),
				),
			],
		});
	}
}
