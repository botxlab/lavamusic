import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Pause extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "pause",
			description: {
				content: I18N.commands.pause.description,
				examples: ["pause"],
				usage: "pause",
			},
			category: "music",
			aliases: ["pu"],
			cooldown: 3,
			args: false,
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
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		const player = client.manager.getPlayer(ctx.guild.id);
		const embed = this.client.embed();

		if (player?.paused) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.player.errors.already_paused)),
				],
			});
		}

		player?.pause();

		return await ctx.sendMessage({
			embeds: [
				embed
					.setColor(this.client.color.main)
					.setDescription(ctx.locale(I18N.commands.pause.successfully_paused)),
			],
		});
	}
}
