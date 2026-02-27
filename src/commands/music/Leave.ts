import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Leave extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "leave",
			description: {
				content: I18N.commands.leave.description,
				examples: ["leave"],
				usage: "leave",
			},
			category: "music",
			aliases: ["l"],
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
		const embed = this.client.embed();

		if (player) {
			const channelId = player.voiceChannelId;
			player.destroy();
			return await ctx.sendMessage({
				embeds: [
					embed
						.setColor(this.client.color.main)
						.setDescription(ctx.locale(I18N.commands.leave.left, { channelId })),
				],
			});
		}
		return await ctx.sendMessage({
			embeds: [
				embed
					.setColor(this.client.color.red)
					.setDescription(ctx.locale(I18N.commands.leave.not_in_channel)),
			],
		});
	}
}
