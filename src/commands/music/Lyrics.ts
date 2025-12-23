import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	ComponentType,
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
} from "discord.js";
import type { LyricsLine, LyricsResult } from "lavalink-client";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";

export default class Lyrics extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "lyrics",
			description: {
				content: "cmd.lyrics.description",
				examples: ["lyrics", "lyrics song:Imagine Dragons - Believer"],
				usage: "lyrics [song]",
			},
			category: "music",
			aliases: ["ly"],
			cooldown: 3,
			args: false,
			vote: false,
			player: {
				voice: true,
				dj: false,
				active: false,
				djPerm: null,
			},
			permissions: {
				dev: false,
				client: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks", "AttachFiles"],
				user: [],
			},
			slashCommand: true,
			options: [
				{
					name: "song",
					description: "cmd.lyrics.options.song.description",
					type: 3,
					required: false,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		// Get the song query from options or arguments
		let songQuery = "";
		if (ctx.options && typeof ctx.options.get === "function") {
			let songOpt = null;
			try {
				songOpt = ctx.options.get("song");
			} catch (e) {
				songOpt = null;
			}
			if (songOpt && typeof songOpt.value === "string") {
				songQuery = songOpt.value;
			}
		}
		if (!songQuery && ctx.args?.[0]) {
			songQuery = ctx.args[0];
		}

		const player = client.manager.getPlayer(ctx.guild!.id);

		// If there is no player and no song title is given, lyrics cannot be fetched
		if (!songQuery && !player) {
			const noMusicContainer = new ContainerBuilder()
				.setAccentColor(client.color.red)
				.addTextDisplayComponents((textDisplay) =>
					textDisplay.setContent(ctx.locale("event.message.no_music_playing")),
				);
			return ctx.sendMessage({
				components: [noMusicContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}
		// If songQuery is given, fetch lyrics for the specified song
		let trackTitle = "";
		let artistName = "";
		let trackUrl = "";
		let artworkUrl = "";
		let lyricsResult: LyricsResult | string = "";
		if (songQuery) {
			const result = await this.fetchTrackAndLyrics({
				client,
				ctx,
				songQuery,
				player,
			});
			if (!result) return;
			lyricsResult = result.lyricsResult;
			trackTitle = result.trackTitle;
			artistName = result.artistName;
			trackUrl = result.trackUrl;
			artworkUrl = result.artworkUrl;
		} else if (player && player.queue.current) {
			// If no songquery is given, fetch lyrics for the currently playing song
			lyricsResult = await player.getCurrentLyrics(false);
			const track = player.queue.current;
			trackTitle =
				(track.info.title?.replace(/\[.*?]|\(.*?\)|{.*?}/g, "").trim() as string) ||
				"Unknown Title";
			artistName =
				(track.info.author?.replace(/\[.*?]|\(.*?\)|{.*?}/g, "").trim() as string) ||
				"Unknown Artist";
			trackUrl = track.info.uri ?? "about:blank";
			artworkUrl = track.info.artworkUrl || "";
		}

		const searchingContainer = new ContainerBuilder()
			.setAccentColor(client.color.main)
			.addTextDisplayComponents((textDisplay) =>
				textDisplay.setContent(ctx.locale("cmd.lyrics.searching", { trackTitle })),
			);

		await ctx.sendDeferMessage({
			components: [searchingContainer],
			flags: MessageFlags.IsComponentsV2,
		});

		try {
			// Handle lyricsResult as an object with lines (Musixmatch, Spotify, etc.)
			let lyricsText: string | null = null;
			if (
				lyricsResult &&
				typeof lyricsResult === "object" &&
				Array.isArray((lyricsResult as LyricsResult).lines)
			) {
				lyricsText = (lyricsResult as LyricsResult)
					.lines!.map((l: LyricsLine) => l.line)
					.join("\n");
			} else if (typeof lyricsResult === "string") {
				lyricsText = lyricsResult;
			}
			if (!lyricsText || lyricsText.length < 10) {
				const noResultsContainer = new ContainerBuilder()
					.setAccentColor(client.color.red)
					.addTextDisplayComponents((textDisplay) =>
						textDisplay.setContent(ctx.locale("cmd.lyrics.errors.no_results")),
					);
				await ctx.editMessage({
					components: [noResultsContainer],
					flags: MessageFlags.IsComponentsV2,
				});
				return;
			}
			const cleanedLyrics = this.cleanLyrics(lyricsText);

			if (cleanedLyrics && cleanedLyrics.length > 0) {
				const lyricsPages = this.paginateLyrics(cleanedLyrics, ctx);
				let currentPage = 0;

				const createLyricsContainer = (pageIndex: number, finalState: boolean = false) => {
					const currentLyricsPage =
						lyricsPages[pageIndex] || ctx.locale("cmd.lyrics.no_lyrics_on_page");

					let fullContent =
						ctx.locale("cmd.lyrics.lyrics_for_track", {
							trackTitle: trackTitle,
							trackUrl: trackUrl,
						}) +
						"\n" +
						(artistName ? `*${artistName}*\n\n` : "") +
						`${currentLyricsPage}`;

					if (!finalState) {
						fullContent += `\n\n${ctx.locale("cmd.lyrics.page_indicator", {
							current: pageIndex + 1,
							total: lyricsPages.length,
						})}`;
					} else {
						fullContent += `\n\n*${ctx.locale("cmd.lyrics.session_expired")}*`;
					}

					const mainLyricsSection = new SectionBuilder().addTextDisplayComponents((textDisplay) =>
						textDisplay.setContent(fullContent),
					);

					if (artworkUrl && artworkUrl.length > 0) {
						mainLyricsSection.setThumbnailAccessory((thumbnail) =>
							thumbnail
								.setURL(artworkUrl)
								.setDescription(ctx.locale("cmd.lyrics.artwork_description", { trackTitle })),
						);
					}

					return new ContainerBuilder()
						.setAccentColor(client.color.main)
						.addSectionComponents(mainLyricsSection);
				};

				const getNavigationRow = (current: number) => {
					return new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId("prev")
							.setEmoji(client.emoji.page.back)
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(current === 0),
						new ButtonBuilder()
							.setCustomId("stop")
							.setEmoji(client.emoji.page.cancel)
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId("next")
							.setEmoji(client.emoji.page.next)
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(current === lyricsPages.length - 1),
					);
				};

				// Add subscribe/unsubscribe buttons to lyrics
				const liveLyricsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("lyrics_subscribe")
						.setLabel(ctx.locale("cmd.lyrics.button_subscribe"))
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId("lyrics_unsubscribe")
						.setLabel(ctx.locale("cmd.lyrics.button_unsubscribe"))
						.setStyle(ButtonStyle.Danger),
				);

				await ctx.editMessage({
					components: [
						createLyricsContainer(currentPage),
						getNavigationRow(currentPage),
						liveLyricsRow,
					],
					flags: MessageFlags.IsComponentsV2,
				});

				const filter = (interaction: ButtonInteraction<"cached">) =>
					interaction.user.id === ctx.author?.id;
				let collectorActive = true;
				let running = false;
				let lyricsUpdater: Promise<void> | null = null;
				let lastLine = -1;
				let subscriptionActive = false;
				while (collectorActive) {
					try {
						const interaction = await ctx.channel.awaitMessageComponent({
							filter,
							componentType: ComponentType.Button,
							time: 60000,
						});
						if (interaction.customId === "lyrics_subscribe") {
							await interaction.reply({
								content: ctx.locale("cmd.lyrics.subscribed"),
								flags: MessageFlags.Ephemeral,
							});
							running = true;
							subscriptionActive = true;
							const maxTime = Date.now() + 3 * 60 * 1000;
							const lyricsLines = (lyricsResult as LyricsResult).lines!;
							lyricsUpdater = (async () => {
								while (running && Date.now() < maxTime) {
									if (!player || !player.playing) break;
									const position = player.position;
									let currentIdx = lyricsLines.findIndex((l) => {
										const time = (l as any).startTime ?? (l as any).time ?? (l as any).timestamp;
										return typeof time === "number" && time > position;
									});
									if (currentIdx === -1) currentIdx = lyricsLines.length - 1;
									else if (currentIdx > 0) currentIdx--;
									if (currentIdx !== lastLine) {
										lastLine = currentIdx;
										const formatted = lyricsLines
											.map((l, i) => (i === currentIdx ? `**${l.line}**` : l.line))
											.join("\n");
										const liveLyricsContainer = new ContainerBuilder()
											.setAccentColor(client.color.main)
											.addTextDisplayComponents((textDisplay) =>
												textDisplay.setContent(
													ctx.locale("cmd.lyrics.lyrics_for_track", {
														trackTitle,
														trackUrl,
													}) +
														"\n" +
														(artistName ? `*${artistName}*\n\n` : "") +
														formatted,
												),
											);
										await ctx.editMessage({
											components: [liveLyricsContainer, liveLyricsRow],
											flags: MessageFlags.IsComponentsV2,
										});
									}
									await new Promise((res) => setTimeout(res, 1000));
								}
							})();
							continue;
						}
						if (interaction.customId === "lyrics_unsubscribe") {
							running = false;
							subscriptionActive = false;
							const lyricsLines = (lyricsResult as any).lines as LyricsLine[];
							const formatted = lyricsLines.map((l) => l.line).join("\n");
							const unsubLyricsContainer = new ContainerBuilder()
								.setAccentColor(client.color.main)
								.addTextDisplayComponents((textDisplay) =>
									textDisplay.setContent(
										ctx.locale("cmd.lyrics.lyrics_for_track", {
											trackTitle,
											trackUrl,
										}) +
											"\n" +
											(artistName ? `*${artistName}*\n\n` : "") +
											formatted +
											`\n\n*${ctx.locale("cmd.lyrics.unsubscribed")}*`,
									),
								);
							await interaction.update({
								components: [unsubLyricsContainer, getNavigationRow(currentPage), liveLyricsRow],
							});
							await interaction.reply({
								content: ctx.locale("cmd.lyrics.unsubscribed"),
								flags: MessageFlags.Ephemeral,
							});
							if (lyricsUpdater) await lyricsUpdater;
							continue;
						}
						if (interaction.customId === "prev") {
							currentPage--;
						} else if (interaction.customId === "next") {
							currentPage++;
						} else if (interaction.customId === "stop") {
							collectorActive = false;
							running = false;
							await interaction.update({
								components: [
									createLyricsContainer(currentPage, true),
									getNavigationRow(currentPage),
								],
							});
							break;
						}
						// If subscription is active, do not show navigation buttons
						if (subscriptionActive) {
							await interaction.update({
								components: [createLyricsContainer(currentPage), liveLyricsRow],
							});
						} else {
							await interaction.update({
								components: [
									createLyricsContainer(currentPage),
									getNavigationRow(currentPage),
									liveLyricsRow,
								],
							});
						}
					} catch (e) {
						collectorActive = false;
					}
				}
				// After collecting is finished
				if (ctx.guild?.members.me?.permissionsIn(ctx.channelId).has("SendMessages")) {
					const finalContainer = createLyricsContainer(currentPage, true);
					// Deactivate subscription buttons after the song ends
					const disabledLiveLyricsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId("lyrics_subscribe")
							.setLabel(ctx.locale("cmd.lyrics.button_subscribe"))
							.setStyle(ButtonStyle.Success)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId("lyrics_unsubscribe")
							.setLabel(ctx.locale("cmd.lyrics.button_unsubscribe"))
							.setStyle(ButtonStyle.Danger)
							.setDisabled(true),
					);
					await ctx
						.editMessage({
							components: [finalContainer, disabledLiveLyricsRow],
							flags: MessageFlags.IsComponentsV2,
						})
						.catch((e) => {
							if (e?.code !== 10008) {
								logger.error("Failed to clear lyrics buttons:", e);
							}
						});
				}
			} else {
				const noResultsContainer = new ContainerBuilder()
					.setAccentColor(client.color.red)
					.addTextDisplayComponents((textDisplay) =>
						textDisplay.setContent(ctx.locale("cmd.lyrics.errors.no_results")),
					);
				await ctx.editMessage({
					components: [noResultsContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (error) {
			logger.error(error);
			const errorContainer = new ContainerBuilder()
				.setAccentColor(client.color.red)
				.addTextDisplayComponents((textDisplay) =>
					textDisplay.setContent(ctx.locale("cmd.lyrics.errors.lyrics_error")),
				);
			await ctx.editMessage({
				components: [errorContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}

	async fetchTrackAndLyrics({
		client,
		ctx,
		songQuery,
		player,
	}: {
		client: Lavamusic;
		ctx: Context;
		songQuery: string;
		player?: any; // Use proper player type from lavalink-client
	}) {
		let trackTitle = "";
		let artistName = "";
		let trackUrl = "";
		let artworkUrl = "";
		let lyricsResult: LyricsResult | string = "";

		const searchRes = await client.manager.search(songQuery, ctx.author, undefined);
		const track = searchRes.tracks[0];
		if (!track) {
			const noResultsContainer = new ContainerBuilder()
				.setAccentColor(client.color.red)
				.addTextDisplayComponents((textDisplay) =>
					textDisplay.setContent(ctx.locale("cmd.lyrics.errors.no_results")),
				);
			await ctx.editMessage({
				components: [noResultsContainer],
				flags: MessageFlags.IsComponentsV2,
			});
			return null;
		}
		try {
			if (!player) {
				const node = client.manager.nodeManager.leastUsedNodes()[0];
				const result = await node.lyrics.get(track, true);
				lyricsResult = result ?? "";
			} else {
				lyricsResult = await player.getLyrics(track, true);
			}
		} catch (err) {
			if (logger && typeof logger.error === "function") {
				logger.error(`[LYRICS] Error fetching lyrics: ${err}`);
			}
			throw err;
		}
		trackTitle = track.info.title;
		artistName = track.info.author;
		trackUrl = track.info.uri;
		artworkUrl = track.info.artworkUrl || "";

		return { lyricsResult, trackTitle, artistName, trackUrl, artworkUrl };
	}

	paginateLyrics(lyrics: string, ctx: Context): string[] {
		const lines = lyrics.split("\n");
		const pages: string[] = [];
		let currentPage = "";
		const MAX_CHARACTERS_PER_PAGE = 2800;

		for (const line of lines) {
			const lineWithNewline = `${line}\n`;

			if (currentPage.length + lineWithNewline.length > MAX_CHARACTERS_PER_PAGE) {
				if (currentPage.trim()) {
					pages.push(currentPage.trim());
				}
				currentPage = lineWithNewline;
			} else {
				currentPage += lineWithNewline;
			}
		}

		if (currentPage.trim()) {
			pages.push(currentPage.trim());
		}

		if (pages.length === 0) {
			pages.push(ctx.locale("cmd.lyrics.no_lyrics_available"));
		}

		return pages;
	}

	private cleanLyrics(lyrics: string): string {
		const cleaned = lyrics
			.replace(/^(\d+\s*Contributors.*?Lyrics|.*Contributors.*|Lyrics\s*|.*Lyrics\s*)$/gim, "")
			.replace(/^[\s\n\r]+/, "")
			.replace(/[\s\n\r]+$/, "")
			.replace(/\n{3,}/g, "\n\n");
		return cleaned.trim();
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
