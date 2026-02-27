import { ChannelType, type TextChannel } from "discord.js";
import { env } from "../../env";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class GuildLeave extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "guildleave",
			description: {
				content: I18N.dev.guilds.description,
				examples: ["guildleave <guildId>"],
				usage: "guildleave <guildId>",
			},
			category: "dev",
			aliases: ["gl"],
			cooldown: 3,
			args: true,
			player: {
				voice: false,
				dj: false,
				active: false,
				djPerm: null,
			},
			permissions: {
				dev: true,
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks],
				user: [],
			},
			slashCommand: false,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const guildId = args[0];

		const guild = await client.shard
			?.broadcastEval(
				(c, { guildId }) => {
					const guild = c.guilds.cache.get(guildId);
					return guild ? { id: guild.id, name: guild.name } : null;
				},
				{ context: { guildId } },
			)
			.then((results) => results.find((g) => g !== null));

		if (!guild) {
			return await ctx.sendMessage(ctx.locale(I18N.dev.guilds.not_found));
		}

		try {
			await client.shard?.broadcastEval(
				async (c, { guildId }) => {
					const guild = c.guilds.cache.get(guildId);
					if (guild) {
						await guild.leave();
					}
				},
				{ context: { guildId } },
			);
			await ctx.sendMessage(ctx.locale(I18N.dev.guilds.leave.success, { name: guild.name }));
		} catch {
			await ctx.sendMessage(ctx.locale(I18N.dev.guilds.leave.fail, { name: guild.name }));
		}

		const logChannelId = env.LOG_CHANNEL_ID;
		if (logChannelId) {
			const logChannel = client.channels.cache.get(logChannelId) as TextChannel;
			if (logChannel && logChannel.type === ChannelType.GuildText) {
				await logChannel.send(
					ctx.locale(I18N.dev.guilds.leave.fail, { name: guild.name, id: guild.id }),
				);
			}
		}
	}
}
