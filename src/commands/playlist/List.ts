import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";

export default class GetPlaylists extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "list",
			description: {
				content: "cmd.list.description",
				examples: ["list", "list @user"],
				usage: "list [@user]",
			},
			category: "playlist",
			aliases: ["lst"],
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
				client: [
					"SendMessages",
					"ReadMessageHistory",
					"ViewChannel",
					"EmbedLinks",
				],
				user: [],
			},
			slashCommand: true,
			options: [
				{
					name: "user",
					description: "cmd.list.options.user",
					type: 6,
					required: false,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		try {
			let userId: string | undefined;
			let targetUser = ctx.args[0];

			if (targetUser?.startsWith("<@") && targetUser.endsWith(">")) {
				targetUser = targetUser.slice(2, -1);

				if (targetUser.startsWith("!")) {
					targetUser = targetUser.slice(1);
				}

				targetUser = await client.users.fetch(targetUser);
				userId = targetUser.id;
			} else if (targetUser) {
				try {
					targetUser = await client.users.fetch(targetUser);
					userId = targetUser.id;
				} catch (_error) {
					const users = client.users.cache.filter(
						(user) => user.username.toLowerCase() === targetUser.toLowerCase(),
					);

					if (users.size > 0) {
						targetUser = users.first();
						userId = targetUser?.id ?? null;
					} else {
						return await ctx.sendMessage({
							embeds: [
								{
									description: ctx.locale("cmd.list.messages.invalid_username"),
									color: this.client.color.red,
								},
							],
						});
					}
				}
			} else {
				userId = ctx.author?.id;
				targetUser = ctx.author;
			}

			if (!userId) {
				return await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale("cmd.list.messages.invalid_userid"),
							color: this.client.color.red,
						},
					],
				});
			}

			const playlists = await client.db.getUserPlaylists(userId);

			if (!playlists || playlists.length === 0) {
				return await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale("cmd.list.messages.no_playlists"),
							color: this.client.color.red,
						},
					],
				});
			}

			const targetUsername = targetUser
				? targetUser.username
				: ctx.locale("cmd.list.messages.your");
			return await ctx.sendMessage({
				embeds: [
					{
						title: ctx.locale("cmd.list.messages.playlists_title", {
							username: targetUsername,
						}),
						description: playlists
							.map((playlist: any) => playlist.name)
							.join("\n"),
						color: this.client.color.main,
					},
				],
			});
		} catch (error) {
			logger.error(error);
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale("cmd.list.messages.error"),
						color: this.client.color.red,
					},
				],
			});
		}
	}
}

/**
 * Project: lavamusic
 * Author: Appu
 * Main Contributor: LucasB25
 * Company: Coders
 * Copyright (c) 2024. All rights reserved.
 * This code is the property of Coder and may not be reproduced or
 * modified without permission. For more information, contact us at
 * https://discord.gg/YQsGbTwPBx
 */
