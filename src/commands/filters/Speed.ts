import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Speed extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "speed",
			description: {
				content: I18N.commands.speed.description,
				examples: ["speed 1.5", "speed 1,5"],
				usage: "speed <number>",
			},
			category: "filters",
			aliases: ["spd"],
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
					name: "speed",
					description: I18N.commands.speed.options.speed,
					type: 3,
					required: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const player = client.manager.getPlayer(ctx.guild.id);
		if (!player) return await ctx.sendMessage(ctx.locale(I18N.events.message.no_music_playing));
		const speedString = args[0].replace(",", ".");
		const isValidNumber = /^[0-9]*\.?[0-9]+$/.test(speedString);
		const speed = Number.parseFloat(speedString);

		if (!isValidNumber || Number.isNaN(speed) || speed < 0.5 || speed > 5) {
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.speed.messages.invalid_number),
						color: this.client.color.red,
					},
				],
			});
			return;
		}

		player.filterManager.setSpeed(speed);
		await ctx.sendMessage({
			embeds: [
				{
					description: ctx.locale(I18N.commands.speed.messages.set_speed, {
						speed,
					}),
					color: this.client.color.main,
				},
			],
		});
	}
}
