import { ChannelType, type TextChannel } from "discord.js";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import {
	CreateInstantInvite,
	EmbedLinks,
	ReadMessageHistory,
	SendMessages,
	ViewChannel,
} from "../../utils/Permissions";

export default class CreateInvite extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "createinvite",
			description: {
				content: I18N.dev.invite.create.description,
				examples: ["createinvite 0000000000000000000"],
				usage: "createinvite <guildId>",
			},
			category: "dev",
			aliases: ["ci", "gi", "ginvite", "guildinvite"],
			cooldown: 3,
			args: true,
			player: { voice: false, dj: false, active: false, djPerm: null },
			permissions: {
				dev: true,
				client: [SendMessages, CreateInstantInvite, ReadMessageHistory, EmbedLinks, ViewChannel],
				user: [],
			},
			slashCommand: false,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const guild = client.guilds.cache.get(args[0]);

		if (!guild) {
			return await ctx.sendMessage({
				embeds: [
					client
						.embed()
						.setColor(client.color.red)
						.setDescription(ctx.locale(I18N.dev.invite.create.errors.guild_not_found)),
				],
			});
		}

		const textChannel = guild.channels.cache.find(
			(channel) =>
				channel.type === ChannelType.GuildText &&
				channel
					.permissionsFor(guild.members.me!)
					?.has(["CreateInstantInvite", "SendMessages", "ViewChannel"]),
		) as TextChannel | undefined;

		if (!textChannel) {
			return await ctx.sendMessage({
				embeds: [
					client
						.embed()
						.setColor(client.color.red)
						.setDescription(ctx.locale(I18N.dev.invite.create.errors.no_suitable_channel)),
				],
			});
		}

		const invite = await textChannel.createInvite({
			maxAge: 3600,
			maxUses: 0,
			reason: `Requested by developer: ${ctx.author?.username}`,
		});

		return await ctx.sendMessage({
			embeds: [
				client
					.embed()
					.setColor(client.color.main)
					.setDescription(
						ctx.locale(I18N.dev.invite.create.success, {
							guildName: guild.name,
							url: invite.url,
						}),
					),
			],
		});
	}
}
