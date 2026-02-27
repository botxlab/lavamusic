import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Loop extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "loop",
			description: {
				content: I18N.commands.loop.description,
				examples: ["loop off", "loop queue", "loop song"],
				usage: "loop",
			},
			category: "general",
			aliases: ["loop"],
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
			options: [
				{
					name: "mode",
					description: I18N.commands.loop.options.mode,
					type: 3,
					required: false,
					choices: [
						{
							name: "Off",
							value: "off",
						},
						{
							name: "Song",
							value: "song",
						},
						{
							name: "Queue",
							value: "queue",
						},
					],
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		const embed = this.client.embed().setColor(this.client.color.main);
		const player = client.manager.getPlayer(ctx.guild.id);
		let loopMessage = "";

		const args = ctx.args ? ctx.args[0]?.toLowerCase() : "";
		let mode: string | undefined;
		try {
			mode = ctx.options?.get("mode")?.value as string | undefined;
		} catch {
			mode = undefined;
		}

		const argument = mode || args;

		if (!player) {
			return await ctx.sendMessage({
				embeds: [embed.setDescription(ctx.locale(I18N.player.errors.no_player))],
			});
		}

		if (argument) {
			if (argument === "song" || argument === "track" || argument === "s") {
				player?.setRepeatMode("track");
				loopMessage = ctx.locale(I18N.commands.loop.messages.looping_song);
			} else if (argument === "queue" || argument === "q") {
				player?.setRepeatMode("queue");
				loopMessage = ctx.locale(I18N.commands.loop.messages.looping_queue);
			} else if (argument === "off" || argument === "o") {
				player?.setRepeatMode("off");
				loopMessage = ctx.locale(I18N.commands.loop.messages.looping_off);
			} else {
				loopMessage = ctx.locale(I18N.commands.loop.messages.invalid_mode);
			}
		} else {
			switch (player?.repeatMode) {
				case "off": {
					player.setRepeatMode("track");
					loopMessage = ctx.locale(I18N.commands.loop.messages.looping_song);
					break;
				}
				case "track": {
					player.setRepeatMode("queue");
					loopMessage = ctx.locale(I18N.commands.loop.messages.looping_queue);
					break;
				}
				case "queue": {
					player.setRepeatMode("off");
					loopMessage = ctx.locale(I18N.commands.loop.messages.looping_off);
					break;
				}
			}
		}

		return await ctx.sendMessage({
			embeds: [embed.setDescription(loopMessage)],
		});
	}
}
