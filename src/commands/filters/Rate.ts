import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Rate extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "rate",
			description: {
				content: I18N.commands.rate.description,
				examples: ["rate 1", "rate 1.5", "rate 1,5"],
				usage: "rate <number>",
			},
			category: "filters",
			aliases: ["rt"],
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
					name: "rate",
					description: I18N.commands.rate.options.rate,
					// 10 = ApplicationCommandOptionType.Number
					type: 10,
					required: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const player = client.manager.getPlayer(ctx.guild.id);
		if (!player) return await ctx.sendMessage(ctx.locale(I18N.events.message.no_music_playing));
		const rateString = String(args[0]).replace(",", ".");
		const isValidNumber = /^[0-9]*\.?[0-9]+$/.test(rateString);
		const rate = Number.parseFloat(rateString);

		if (!isValidNumber || Number.isNaN(rate) || rate < 0.5 || rate > 5) {
			await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.rate.errors.invalid_number),
						color: this.client.color.red,
					},
				],
			});
			return;
		}

		await player.filterManager.setRate(rate);
		await ctx.sendMessage({
			embeds: [
				{
					description: ctx.locale(I18N.commands.rate.messages.rate_set, {
						rate,
					}),
					color: this.client.color.main,
				},
			],
		});
	}
}
