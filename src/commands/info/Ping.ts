import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Ping extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "ping",
			description: {
				content: I18N.commands.ping.description,
				examples: ["ping"],
				usage: "ping",
			},
			category: "general",
			aliases: ["pong"],
			cooldown: 3,
			args: false,
			vote: false,
			player: {
				voice: false,
				dj: false,
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
		// Send a deferred message
		const startTime = Date.now();
		await ctx.sendDeferMessage(ctx.locale(I18N.commands.ping.content));

		// Calculate latencies
		const botLatency = Date.now() - startTime;
		const apiLatency = Math.round(ctx.client.ws.ping);

		// Embed styling
		const embed = this.client
			.embed()
			.setAuthor({
				name: "Pong!",
				iconURL: client.user?.displayAvatarURL(),
			})
			.setColor(this.client.color.main)
			.addFields([
				{
					name: ctx.locale(I18N.commands.ping.bot_latency),
					value: `\`\`\`diff\n+ ${botLatency}ms\n\`\`\``, // Always positive latency
					inline: true,
				},
				{
					name: ctx.locale(I18N.commands.ping.api_latency),
					value: `\`\`\`diff\n+ ${apiLatency}ms\n\`\`\``, // Always positive latency
					inline: true,
				},
			])
			.setFooter({
				text: ctx.locale(I18N.commands.ping.requested_by, { author: ctx.author?.tag }),
				iconURL: ctx.author?.displayAvatarURL({}),
			})
			.setTimestamp();

		// Send back the result
		return await ctx.editMessage({ content: "", embeds: [embed] });
	}
}
