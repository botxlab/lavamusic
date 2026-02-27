import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	StringSelectMenuBuilder,
	type VoiceChannel,
} from "discord.js";
import type { SearchResult, Track } from "lavalink-client";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import {
	AttachFiles,
	EmbedLinks,
	ReadMessageHistory,
	SendMessages,
	ViewChannel,
} from "../../utils/Permissions";

const TRACKS_PER_PAGE = 5;

export default class Search extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "search",
			description: {
				content: I18N.commands.search.description,
				examples: ["search example"],
				usage: "search <song>",
			},
			category: "music",
			aliases: ["sc"],
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
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks, AttachFiles],
				user: [],
			},
			slashCommand: true,
			options: [
				{
					name: "song",
					description: I18N.commands.search.options.song,
					type: 3,
					required: true,
				},
			],
		});
	}

	private formatTrackDisplay(track: Track, index: number, client: Lavamusic): string {
		return (
			`**${index + 1}. [${track.info.title}](${track.info.uri})**\n` +
			`*${track.info.author || "Unknown Artist"}*\n` +
			`\`${track.info.duration ? client.utils.formatTime(track.info.duration) : "N/A"}\``
		);
	}

	private generatePageComponents(
		client: Lavamusic,
		ctx: Context,
		tracks: Track[],
		currentPage: number,
		maxPages: number,
		isDisabled: boolean = false, // Now takes an optional isDisabled parameter
	) {
		const startIndex = currentPage * TRACKS_PER_PAGE;
		const endIndex = startIndex + TRACKS_PER_PAGE;
		const tracksOnPage = tracks.slice(startIndex, Math.min(endIndex, tracks.length));

		const resultsContainer = new ContainerBuilder()
			.setAccentColor(client.color.main)
			.addTextDisplayComponents((textDisplay) =>
				textDisplay.setContent(
					`**${ctx.locale(I18N.commands.search.messages.results_found, {
						count: tracks.length,
					})}**\n*${ctx.locale(I18N.commands.search.messages.select_prompt)}*` +
						`\n\n**${ctx.locale(I18N.commands.search.messages.page_info, {
							currentPage: currentPage + 1,
							maxPages: maxPages,
						})}**`,
				),
			);

		tracksOnPage.forEach((track: Track, index: number) => {
			const globalIndex = startIndex + index;
			const section = new SectionBuilder().addTextDisplayComponents((textDisplay) =>
				textDisplay.setContent(this.formatTrackDisplay(track, globalIndex, client)),
			);

			if (track.info.artworkUrl) {
				section.setThumbnailAccessory((thumbnail) =>
					thumbnail
						.setURL(track.info.artworkUrl!)
						.setDescription(`Artwork for ${track.info.title}`),
				);
			}
			resultsContainer.addSectionComponents(section);
		});

		if (tracksOnPage.length > 0) {
			resultsContainer.addSeparatorComponents(new SeparatorBuilder());
		}

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("select-track")
			.setPlaceholder(ctx.locale(I18N.commands.search.select))
			.addOptions(
				tracksOnPage.map((track: Track, index: number) => ({
					label: `${startIndex + index + 1}. ${track.info.title.slice(0, 50)}${track.info.title.length > 50 ? "..." : ""}`,
					description: (track.info.author || "Unknown Artist").slice(0, 100),
					value: (startIndex + index).toString(),
				})),
			)
			.setDisabled(isDisabled);
		const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

		const previousButton = new ButtonBuilder()
			.setCustomId("previous-page")
			.setLabel(ctx.locale(I18N.buttons.previous))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === 0 || isDisabled); // Apply disabled state

		const nextButton = new ButtonBuilder()
			.setCustomId("next-page")
			.setLabel(ctx.locale(I18N.buttons.next))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === maxPages - 1 || isDisabled); // Apply disabled state

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			previousButton,
			nextButton,
		);

		return {
			components: [resultsContainer, selectRow, buttonRow],
			flags: MessageFlags.IsComponentsV2,
		};
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const query = args.join(" ");
		const memberVoiceChannel = (ctx.member as any).voice.channel as VoiceChannel;

		let player = client.manager.getPlayer(ctx.guild.id);

		if (!player) {
			player = client.manager.createPlayer({
				guildId: ctx.guild.id,
				voiceChannelId: memberVoiceChannel.id,
				textChannelId: ctx.channel.id,
				selfMute: false,
				selfDeaf: true,
				vcRegion: memberVoiceChannel.rtcRegion!,
			});
		}

		if (!player.connected) {
			try {
				await player.connect();
			} catch (error) {
				console.error("Failed to connect to voice channel:", error);
				await player.destroy(); // Clean up the player if connection fails
				const connectErrorContainer = new ContainerBuilder()
					.setAccentColor(this.client.color.red)
					.addTextDisplayComponents((textDisplay) =>
						textDisplay.setContent(
							`**${ctx.locale(
								I18N.commands.search.errors.vc_connect_fail_title, // Changed key
							)}**\n${ctx.locale(I18N.commands.search.errors.vc_connect_fail_description)}`, // Changed key
						),
					);
				return await ctx.sendMessage({
					components: [connectErrorContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		const response = (await player.search({ query: query }, ctx.author)) as SearchResult;

		if (!response || response.tracks?.length === 0) {
			const noResultsContainer = new ContainerBuilder()
				.setAccentColor(this.client.color.red)
				.addTextDisplayComponents((textDisplay) =>
					textDisplay.setContent(
						`**${ctx.locale(
							I18N.commands.search.errors.no_results_title,
						)}**\n\n${ctx.locale(I18N.commands.search.errors.no_results_description)}`,
					),
				);

			return await ctx.sendMessage({
				components: [noResultsContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let currentPage = 0;
		const maxPages = Math.ceil(response.tracks.length / TRACKS_PER_PAGE);

		const initialComponents = this.generatePageComponents(
			client,
			ctx,
			response.tracks,
			currentPage,
			maxPages,
		);
		// @ts-expect-error
		const sentMessage = await ctx.sendMessage(initialComponents);

		const collector = sentMessage.createMessageComponentCollector({
			filter: (f: any) => f.user.id === ctx.author?.id,
			time: 120000,
			idle: 60000,
		});

		collector.on("collect", async (int: any) => {
			if (int.customId === "select-track") {
				const selectedIndex = Number.parseInt(int.values[0], 10);
				const track = response.tracks[selectedIndex];

				await int.deferUpdate();

				if (!track) {
					const errorContainer = new ContainerBuilder()
						.setAccentColor(this.client.color.red)
						.addTextDisplayComponents((textDisplay) =>
							textDisplay.setContent(
								`**${ctx.locale(
									I18N.commands.search.errors.invalid_selection_title,
								)}**\n${ctx.locale(I18N.commands.search.errors.invalid_selection_description)}`,
							),
						);
					return await int.sendMessage({
						components: [errorContainer],
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}

				player.queue.add(track);
				if (!player.playing && player.queue.tracks.length > 0) await player.play({ paused: false });

				const confirmationContainer = new ContainerBuilder()
					.setAccentColor(this.client.color.green)
					.addTextDisplayComponents((textDisplay) =>
						textDisplay.setContent(
							ctx.locale(I18N.commands.search.messages.added_to_queue, {
								title: track.info.title,
								uri: track.info.uri,
							}),
						),
					);

				// Disable all components after track selection
				const disabledComponents = this.generatePageComponents(
					client,
					ctx,
					response.tracks,
					currentPage,
					maxPages,
					true, // Pass true to disable components
				);

				await ctx.editMessage(
					filterFlagsForEditMessage({
						components: [confirmationContainer, ...disabledComponents.components.slice(1)],
						flags: MessageFlags.IsComponentsV2,
					}),
				);

				collector.stop("trackSelected");
			} else if (int.customId === "previous-page") {
				if (currentPage > 0) {
					currentPage--;
					await int.deferUpdate();
					const newComponents = this.generatePageComponents(
						client,
						ctx,
						response.tracks,
						currentPage,
						maxPages,
					);
					await ctx.editMessage(filterFlagsForEditMessage(newComponents));
				} else {
					await int.deferUpdate();
				}
			} else if (int.customId === "next-page") {
				if (currentPage < maxPages - 1) {
					currentPage++;
					await int.deferUpdate();
					const newComponents = this.generatePageComponents(
						client,
						ctx,
						response.tracks,
						currentPage,
						maxPages,
					);
					const newComponentsFiltered = filterFlagsForEditMessage(newComponents);
					await ctx.editMessage(newComponentsFiltered);
				} else {
					await int.deferUpdate();
				}
			}
			collector.resetTimer();
		});

		collector.on("end", async (_collected, reason) => {
			if (reason === "time" || reason === "idle") {
				try {
					const timeoutContainer = new ContainerBuilder()
						.setAccentColor(this.client.color.red)
						.addTextDisplayComponents((textDisplay) =>
							textDisplay.setContent(
								`**${ctx.locale(
									I18N.commands.search.messages.selection_timed_out_title,
								)}**\n${ctx.locale(I18N.commands.search.messages.selection_timed_out_description)}`,
							),
						);

					await ctx.editMessage(
						filterFlagsForEditMessage({
							components: [timeoutContainer],
							flags: MessageFlags.IsComponentsV2,
						}),
					);
				} catch (error) {
					console.error("Failed to edit message on collector timeout:", error);
					const fallbackTimeoutContainer = new ContainerBuilder()
						.setAccentColor(this.client.color.red)
						.addTextDisplayComponents((textDisplay) =>
							textDisplay.setContent(
								ctx.locale(I18N.commands.search.messages.selection_timed_out_short),
							),
						);
					await ctx.sendMessage({
						components: [fallbackTimeoutContainer],
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}
			} else if (reason === "trackSelected") {
				// Do nothing, components are already disabled and message edited.
			}
		});
	}
}

// Helper function to filter out 'flags' for editMessage
function filterFlagsForEditMessage(options: any) {
	const { flags, ...rest } = options;
	return rest;
}
