import type { AutocompleteInteraction } from "discord.js";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class StealPlaylist extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "steal",
			description: {
				content: I18N.commands.steal.description,
				examples: ["steal <@user> <playlist_name>"],
				usage: "steal <@user> <playlist_name>",
			},
			category: "playlist",
			aliases: ["st"],
			cooldown: 3,
			args: true,
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
			options: [
				{
					name: "user",
					description: I18N.commands.steal.options.user,
					type: 6,
					required: true,
				},
				{
					name: "playlist",
					description: I18N.commands.steal.options.playlist,
					type: 3,
					required: true,
					autocomplete: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		let targetUser = ctx.args[0];
		const playlistName = ctx.args[1];
		let targetUserId: string | null = null;

		if (targetUser?.startsWith("<@") && targetUser.endsWith(">")) {
			targetUser = targetUser.slice(2, -1);
			if (targetUser.startsWith("!")) {
				targetUser = targetUser.slice(1);
			}
			targetUser = await client.users.fetch(targetUser);
			targetUserId = targetUser.id;
		} else if (targetUser) {
			try {
				targetUser = await client.users.fetch(targetUser);
				targetUserId = targetUser.id;
			} catch (_error) {
				const users = client.users.cache.filter(
					(user) => user.username.toLowerCase() === targetUser.toLowerCase(),
				);

				if (users.size > 0) {
					targetUser = users.first();
					targetUserId = targetUser.id;
				} else {
					return await ctx.sendMessage({
						embeds: [
							{
								description: "Invalid username or user not found.",
								color: this.client.color.red,
							},
						],
					});
				}
			}
		}

		if (!playlistName) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.steal.messages.provide_playlist),
						color: this.client.color.red,
					},
				],
			});
		}

		if (!targetUserId) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.steal.messages.provide_user),
						color: this.client.color.red,
					},
				],
			});
		}

		try {
			const targetPlaylist = await client.db.getPlaylist(targetUserId, playlistName);

			if (!targetPlaylist) {
				return await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.steal.messages.playlist_not_exist),
							color: this.client.color.red,
						},
					],
				});
			}

			const targetSongs = await client.db.getTracksFromPlaylist(targetUserId, playlistName);
			if (!targetSongs) {
				return await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.steal.messages.playlist_not_exist),
							color: this.client.color.red,
						},
					],
				});
			}
			const existingPlaylist = await client.db.getPlaylist(ctx.author?.id ?? "", playlistName);
			if (existingPlaylist) {
				return await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.steal.messages.playlist_exists, {
								playlist: playlistName,
							}),
							color: this.client.color.red,
						},
					],
				});
			}

			await client.db.createPlaylistWithTracks(ctx.author?.id ?? "", playlistName, targetSongs);

			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.steal.messages.playlist_stolen, {
							playlist: playlistName,
							user: targetUser.username,
						}),
						color: this.client.color.main,
					},
				],
			});
		} catch (error) {
			logger.error(error);
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.steal.messages.error_occurred),
						color: this.client.color.red,
					},
				],
			});
		}
	}

	public async autocomplete(interaction: AutocompleteInteraction) {
		try {
			const focusedValue = interaction.options.getFocused();
			const userOptionId = interaction.options.get("user")?.value as string;

			if (!userOptionId) {
				await interaction
					.respond([
						{
							name: "Please specify a user to search their playlists.",
							value: "NoUser",
						},
					])
					.catch(console.error);
				return;
			}

			const user = await interaction.client.users.fetch(userOptionId);
			if (!user) {
				await interaction
					.respond([{ name: "User not found.", value: "NoUserFound" }])
					.catch(console.error);
				return;
			}

			const playlists = await this.client.db.getUserPlaylists(user.id);

			if (!playlists || playlists.length === 0) {
				await interaction
					.respond([{ name: "No playlists found for this user.", value: "NoPlaylists" }])
					.catch(console.error);
				return;
			}

			const filtered = playlists.filter((playlist) =>
				playlist.name.toLowerCase().startsWith(focusedValue.toLowerCase()),
			);

			return await interaction
				.respond(
					filtered.map((playlist) => ({
						name: playlist.name,
						value: playlist.name,
					})),
				)
				.catch(console.error);
		} catch (_error) {
			return await interaction
				.respond([
					{
						name: "An error occurred while fetching playlists.",
						value: "Error",
					},
				])
				.catch(console.error);
		}
	}
}
