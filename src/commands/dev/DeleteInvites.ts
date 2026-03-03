import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import {
	ManageGuild,
	ReadMessageHistory,
	SendMessages,
	ViewChannel,
} from "../../utils/Permissions";

export default class DestroyInvites extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "destroyinvites",
			description: {
				content: I18N.dev.invite.destroy.description,
				examples: ["destroyinvites 0000000000000000000"],
				usage: "destroyinvites <guildId>",
			},
			category: "dev",
			aliases: ["di"],
			cooldown: 3,
			args: true,
			player: { voice: false, dj: false, active: false, djPerm: null },
			permissions: {
				dev: true,
				client: [SendMessages, ManageGuild, ReadMessageHistory, ViewChannel],
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
						.setDescription(ctx.locale(I18N.dev.invite.destroy.errors.guild_not_found)),
				],
			});
		}

		try {
			// Fetch all invites and filter only those created by the bot
			const invites = await guild.invites.fetch();
			const botInvites = invites.filter((invite) => invite.inviterId === client.user?.id);

			if (botInvites.size === 0) {
				return await ctx.sendMessage({
					embeds: [
						client
							.embed()
							.setColor(client.color.main)
							.setDescription(ctx.locale(I18N.dev.invite.destroy.not_found)),
					],
				});
			}

			// Parallel deletion
			await Promise.all(botInvites.map((invite) => invite.delete("Developer Cleanup")));

			return await ctx.sendMessage({
				embeds: [
					client
						.embed()
						.setColor(client.color.main)
						.setDescription(
							ctx.locale(I18N.dev.invite.destroy.success, {
								count: botInvites.size,
								guildName: guild.name,
							}),
						),
				],
			});
		} catch (_error) {
			return await ctx.sendMessage({
				embeds: [
					client
						.embed()
						.setColor(client.color.red)
						.setDescription(ctx.locale(I18N.dev.invite.destroy.errors.generic)),
				],
			});
		}
	}
}
