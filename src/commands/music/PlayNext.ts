import type {
	ApplicationCommandOptionChoiceData,
	AutocompleteInteraction,
	VoiceChannel,
} from "discord.js";
import type { SearchResult } from "lavalink-client";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import {
	Connect,
	EmbedLinks,
	ReadMessageHistory,
	SendMessages,
	Speak,
	ViewChannel,
} from "../../utils/Permissions";

export default class PlayNext extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "playnext",
			description: {
				content: I18N.commands.playnext.description,
				examples: [
					"playnext example",
					"playnext https://www.youtube.com/watch?v=example",
					"playnext https://open.spotify.com/track/example",
					"playnext http://www.example.com/example.mp3",
				],
				usage: "playnext <song>",
			},
			category: "music",
			aliases: ["pn"],
			cooldown: 3,
			args: true,
			vote: false,
			player: {
				voice: true,
				dj: false,
				active: false,
				djPerm: null,
			},
			permissions: {
				dev: false,
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks, Connect, Speak],
				user: [],
			},
			slashCommand: true,
			options: [
				{
					name: "song",
					description: I18N.commands.playnext.options.song,
					type: 3,
					required: true,
					autocomplete: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const query = args.join(" ");
		let player = client.manager.getPlayer(ctx.guild.id);
		const memberVoiceChannel = (ctx.member as any).voice?.channel as VoiceChannel | undefined;

		if (!memberVoiceChannel) {
			return await ctx.editMessage({
				content: ctx.locale(I18N.player.errors.user_not_in_voice_channel),
			});
		}

		if (!player)
			player = client.manager.createPlayer({
				guildId: ctx.guild.id,
				voiceChannelId: memberVoiceChannel.id,
				textChannelId: ctx.channel.id,
				selfMute: false,
				selfDeaf: true,
				vcRegion: memberVoiceChannel.rtcRegion!,
			});
		if (!player.connected) await player.connect();

		await ctx.sendDeferMessage(ctx.locale(I18N.commands.playnext.loading));

		let response: SearchResult;
		try {
			response = (await player.search({ query }, ctx.author)) as SearchResult;
		} catch (_error) {
			return await ctx.editMessage({
				content: "",
				embeds: [
					this.client
						.embed()
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.play.errors.search_error)),
				],
			});
		}

		const embed = this.client.embed();

		if (!response || response.tracks?.length === 0) {
			return await ctx.editMessage({
				content: "",
				embeds: [
					embed
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.play.errors.search_error)),
				],
			});
		}
		await player.queue.splice(
			0,
			0,
			...(response.loadType === "playlist" ? response.tracks : [response.tracks[0]]),
		);

		if (response.loadType === "playlist") {
			await ctx.editMessage({
				content: "",
				embeds: [
					embed.setColor(this.client.color.main).setDescription(
						ctx.locale(I18N.commands.playnext.added_playlist_to_play_next, {
							length: response.tracks.length,
						}),
					),
				],
			});
		} else {
			await ctx.editMessage({
				content: "",
				embeds: [
					embed.setColor(this.client.color.main).setDescription(
						ctx.locale(I18N.commands.playnext.added_to_play_next, {
							title: response.tracks[0].info.title,
							uri: response.tracks[0].info.uri,
						}),
					),
				],
			});
		}
		if (!player.playing && player.queue.tracks.length > 0) await player.play({ paused: false });
	}
	public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const focusedValue = interaction.options.getFocused(true);

		if (!focusedValue?.value.trim()) {
			return interaction.respond([]);
		}

		const res = await this.client.manager.search(focusedValue.value.trim(), interaction.user);
		const songs: ApplicationCommandOptionChoiceData[] = [];

		if (res.loadType === "search") {
			res.tracks.slice(0, 10).forEach((track) => {
				const name = `${track.info.title} by ${track.info.author}`;
				songs.push({
					name: name.length > 100 ? `${name.substring(0, 97)}...` : name,
					value: track.info.uri,
				});
			});
		}

		return await interaction.respond(songs);
	}
}
