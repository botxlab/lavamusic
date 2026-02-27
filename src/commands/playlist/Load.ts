import type { AutocompleteInteraction, GuildMember } from "discord.js";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class LoadPlaylist extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "load",
			description: {
				content: I18N.commands.load.description,
				examples: ["load <playlist>"],
				usage: "load <playlist>",
			},
			category: "playlist",
			aliases: ["lo"],
			cooldown: 3,
			args: true,
			vote: true,
			player: {
				voice: true,
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
					name: "playlist",
					description: I18N.commands.load.options.playlist,
					type: 3,
					required: true,
					autocomplete: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		let player = client.manager.getPlayer(ctx.guild.id);
		const playlistName = args.join(" ").trim();
		const playlistData = await client.db.getPlaylist(ctx.author?.id ?? "", playlistName);
		if (!playlistData) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.load.messages.playlist_not_exist),
						color: this.client.color.red,
					},
				],
			});
		}

		const songs = await client.db.getTracksFromPlaylist(ctx.author?.id ?? "", playlistName);
		if (!songs) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.load.messages.playlist_not_exist),
						color: client.color.red,
					},
				],
			});
		}
		if (songs.length === 0) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.load.messages.playlist_empty),
						color: client.color.red,
					},
				],
			});
		}

		const member = ctx.member as GuildMember;
		if (!player) {
			player = client.manager.createPlayer({
				guildId: ctx.guild.id,
				voiceChannelId: member.voice.channelId!,
				textChannelId: ctx.channel.id,
				selfMute: false,
				selfDeaf: true,
				vcRegion: member.voice.channel?.rtcRegion ?? undefined,
			});
			if (!player.connected) await player.connect();
		}

		const nodes = client.manager.nodeManager.leastUsedNodes();
		if (!nodes || nodes.length === 0) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.load.messages.no_lavalink_nodes),
						color: client.color.red,
					},
				],
			});
		}
		const node = nodes[Math.floor(Math.random() * nodes.length)];
		const tracks = await node.decode.multipleTracks(songs as any, ctx.author);
		if (tracks.length === 0) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.load.messages.playlist_empty),
						color: client.color.red,
					},
				],
			});
		}
		player.queue.add(tracks);

		if (!player.playing && player.queue.tracks.length > 0) await player.play({ paused: false });

		return await ctx.sendMessage({
			embeds: [
				{
					description: ctx.locale(I18N.commands.load.messages.playlist_loaded, {
						name: playlistData.name,
						count: songs.length,
					}),
					color: this.client.color.main,
				},
			],
		});
	}

	public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const focusedValue = interaction.options.getFocused();
		const userId = interaction.user.id;

		const playlists = await this.client.db.getUserPlaylists(userId);

		const filtered = playlists.filter((playlist) =>
			playlist.name.toLowerCase().startsWith(focusedValue.toLowerCase()),
		);

		await interaction.respond(
			filtered.map((playlist) => ({
				name: playlist.name,
				value: playlist.name,
			})),
		);
	}
}
