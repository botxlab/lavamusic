import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Move extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "move",
			description: {
				content: I18N.commands.move.description,
				examples: ["move 2 to 1"],
				usage: "move <from> to <to>",
			},
			category: "music",
			aliases: ["mv"],
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
					name: "from",
					description: I18N.commands.move.options.from,
					type: 4,
					required: true,
				},
				{
					name: "to",
					description: I18N.commands.move.options.to,
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
		if (player.queue.tracks.length === 0) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.move.errors.no_tracks)),
				],
			});
		}

		let from: number;
		let to: number;

		if (args.length === 3 && args[1].toLowerCase() === "to") {
			// 'move 2 to 1' - args = ['2', 'to', '1']
			from = Number(args[0]);
			to = Number(args[2]);
		} else if (args.length === 2) {
			// 'move 2 1' - args = ['2', '1']
			from = Number(args[0]);
			to = Number(args[1]);
		} else {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.move.errors.invalid_usage)),
				],
			});
		}

		if (Number.isNaN(from) || Number.isNaN(to)) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.move.errors.invalid_numbers)),
				],
			});
		}

		// Adjust to 0-based indexing
		const fromIndex = from - 1;
		const toIndex = to - 1;

		if (
			fromIndex < 0 ||
			fromIndex >= player.queue.tracks.length ||
			toIndex < 0 ||
			toIndex >= player.queue.tracks.length + 1
		) {
			// Allow toIndex up to length for inserting at end
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.move.errors.invalid_positions)),
				],
			});
		}

		if (fromIndex === toIndex) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.main)
						.setDescription(ctx.locale(I18N.commands.move.errors.same_position)),
				],
			});
		}

		// Move the track
		const track = player.queue.tracks.splice(fromIndex, 1)[0];
		player.queue.tracks.splice(toIndex, 0, track);

		return await ctx.sendMessage({
			embeds: [
				embed.setColor(this.client.color.main).setDescription(
					ctx.locale(I18N.commands.move.messages.moved, {
						from: from,
						to: to,
						title: track.info.title,
					}),
				),
			],
		});
	}
}
