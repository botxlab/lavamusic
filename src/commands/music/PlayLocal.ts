import { ApplicationCommandOptionType, type Attachment, type GuildMember } from "discord.js";
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

export default class PlayLocal extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "playlocal",
			description: {
				content: I18N.commands.playlocal.description,
				examples: ["playlocal <file>"],
				usage: "playlocal <file>",
			},
			category: "music",
			aliases: ["pf", "pl"],
			cooldown: 3,
			args: false,
			vote: true,
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
					name: "file",
					description: I18N.commands.playlocal.options.file,
					type: ApplicationCommandOptionType.Attachment,
					required: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		const attachment = ctx.isInteraction
			? (ctx.interaction!.options.get("file")?.attachment as Attachment)
			: ctx.message?.attachments.first();

		if (!attachment) {
			return ctx.sendMessage({
				embeds: [
					this.client
						.embed()
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.playlocal.errors.empty_query)),
				],
			});
		}

		const contentType = attachment.contentType || "";
		if (!contentType.startsWith("audio/") && !contentType.startsWith("video/")) {
			return ctx.sendMessage({
				embeds: [
					this.client
						.embed()
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.playlocal.errors.invalid_format)),
				],
			});
		}

		await ctx.sendDeferMessage(ctx.locale(I18N.commands.playlocal.loading));

		let player = client.manager.getPlayer(ctx.guild.id);
		if (!player) {
			const memberVoiceChannel = (ctx.member as GuildMember)?.voice.channel;
			if (!memberVoiceChannel) {
				return ctx.sendMessage({
					embeds: [
						this.client
							.embed()
							.setColor(this.client.color.red)
							.setDescription(ctx.locale(I18N.player.errors.user_not_in_voice_channel)),
					],
				});
			}
			player = client.manager.createPlayer({
				guildId: ctx.guild.id,
				voiceChannelId: memberVoiceChannel.id,
				textChannelId: ctx.channel.id,
				selfMute: false,
				selfDeaf: true,
				vcRegion: memberVoiceChannel.rtcRegion ?? undefined,
			});
		}

		if (!player.connected) await player.connect();

		const response = (await player
			.search(
				{
					query: attachment.url,
					source: "local",
				},
				ctx.author,
			)
			.catch(() => null)) as SearchResult | null;

		if (!response || !response.tracks?.length) {
			return ctx.editMessage({
				content: " ",
				embeds: [
					this.client
						.embed()
						.setColor(this.client.color.red)
						.setDescription(ctx.locale(I18N.commands.playlocal.errors.no_results)),
				],
			});
		}

		await player.queue.add(response.tracks[0]);

		await ctx.editMessage({
			content: "",
			embeds: [
				this.client
					.embed()
					.setColor(this.client.color.main)
					.setDescription(
						ctx.locale(I18N.commands.playlocal.added_to_queue, {
							title: attachment.name,
							url: attachment.url,
						}),
					),
			],
		});

		if (!player.playing && player.queue.tracks.length > 0) await player.play();
	}
}
