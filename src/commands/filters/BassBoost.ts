import { ApplicationCommandOptionType } from "discord.js";
import { EQList } from "lavalink-client";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index.js";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class BassBoost extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "bassboost",
			description: {
				content: I18N.commands.bassboost.description,
				examples: ["bassboost high", "bassboost medium", "bassboost low", "bassboost off"],
				usage: "bassboost [level]",
			},
			category: "filters",
			aliases: ["bb"],
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
					name: "level",
					description: I18N.commands.bassboost.options.level,
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{ name: "high", value: "high" },
						{ name: "medium", value: "medium" },
						{ name: "low", value: "low" },
						{ name: "off", value: "off" },
					],
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		const player = client.manager.getPlayer(ctx.guild.id);
		if (!player) return await ctx.sendMessage(ctx.locale(I18N.events.message.no_music_playing));
		switch (ctx.args[0]?.toLowerCase()) {
			case "high": {
				await player.filterManager.setEQ(EQList.BassboostHigh);
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.bassboost.messages.high),
							color: this.client.color.main,
						},
					],
				});
				break;
			}
			case "medium": {
				await player.filterManager.setEQ(EQList.BassboostMedium);
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.bassboost.messages.medium),
							color: this.client.color.main,
						},
					],
				});
				break;
			}
			case "low": {
				await player.filterManager.setEQ(EQList.BassboostLow);
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.bassboost.messages.low),
							color: this.client.color.main,
						},
					],
				});
				break;
			}
			case "off": {
				await player.filterManager.clearEQ();
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.bassboost.messages.off),
							color: this.client.color.main,
						},
					],
				});
				break;
			}
			default: {
				await ctx.sendMessage(
					ctx.locale(I18N.commands.bassboost.messages.invalid_level, {
						level: ctx.args[0] ?? "undefined",
					}),
				);
				break;
			}
		}
	}
}
