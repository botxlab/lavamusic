import type { Message } from "discord.js";
import { I18N, t } from "../../structures/I18n";
import { Event, type Lavamusic } from "../../structures/index";
import type { Requester } from "../../types";
import { getButtons } from "../../utils/Buttons";
import { buttonReply } from "../../utils/SetupSystem";
import { checkDj } from "../player/TrackStart";

export default class SetupButtons extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			name: "setupButtons",
		});
	}

	public async run(interaction: any): Promise<void> {
		const locale = await this.client.db.getLanguage(interaction.guildId);

		if (!interaction.replied)
			await interaction.deferReply().catch(() => {
				null;
			});
		if (!interaction.member.voice.channel) {
			return await buttonReply(
				interaction,
				t(I18N.events.setupButton.no_voice_channel_button),
				this.client.color.red,
			);
		}
		const clientMember = interaction.guild.members.cache.get(this.client.user?.id);
		if (
			clientMember.voice.channel &&
			clientMember.voice.channelId !== interaction.member.voice.channelId
		) {
			return await buttonReply(
				interaction,
				t(I18N.events.setupButton.different_voice_channel_button, {
					lng: locale,
					channel: clientMember.voice.channel,
				}),
				this.client.color.red,
			);
		}
		const player = this.client.manager.getPlayer(interaction.guildId);
		if (!player)
			return await buttonReply(
				interaction,
				t(I18N.events.setupButton.no_music_playing),
				this.client.color.red,
			);
		if (!player.queue)
			return await buttonReply(
				interaction,
				t(I18N.events.setupButton.no_music_playing),
				this.client.color.red,
			);
		if (!player.queue.current)
			return await buttonReply(
				interaction,
				t(I18N.events.setupButton.no_music_playing),
				this.client.color.red,
			);
		const data = await this.client.db.getSetup(interaction.guildId);
		const { title, uri, duration, artworkUrl, sourceName, isStream } = player.queue.current.info;
		let message: Message | undefined;
		try {
			message = await interaction.channel.messages.fetch(data?.messageId, {
				cache: true,
			});
		} catch (_e) {
			null;
		}

		const iconUrl =
			this.client.config.icons[sourceName] ||
			this.client.user?.displayAvatarURL({ extension: "png" });
		const embed = this.client
			.embed()
			.setAuthor({
				name: t(I18N.events.setupButton.now_playing),
				iconURL: iconUrl,
			})
			.setColor(this.client.color.main)
			.setDescription(
				`[${title}](${uri}) - ${isStream ? t(I18N.events.setupButton.live) : this.client.utils.formatTime(duration)} - ${t(I18N.events.setupButton.requested_by, { lng: locale, requester: (player.queue.current.requester as Requester).id })}`,
			)
			.setImage((artworkUrl || this.client.user?.displayAvatarURL({ extension: "png" })) ?? "");

		if (!interaction.isButton()) return;
		if (!(await checkDj(this.client, interaction))) {
			return await buttonReply(
				interaction,
				t(I18N.events.setupButton.no_dj_permission),
				this.client.color.red,
			);
		}
		if (message) {
			const handleVolumeChange = async (change: number) => {
				const vol = player.volume + change;
				player.setVolume(vol);
				await buttonReply(
					interaction,
					t(I18N.events.setupButton.volume_set, { lng: locale, vol }),
					this.client.color.main,
				);
				await message.edit({
					embeds: [
						embed.setFooter({
							text: t(I18N.events.setupButton.volume_footer, {
								lng: locale,
								vol,
								displayName: interaction.member.displayName,
							}),
							iconURL: interaction.member.displayAvatarURL({}),
						}),
					],
				});
			};
			switch (interaction.customId) {
				case "PREV_BUT": {
					if (!player.queue.previous) {
						return await buttonReply(
							interaction,
							t(I18N.events.setupButton.no_previous_track),
							this.client.color.main,
						);
					}
					player.play({
						track: player.queue.previous[0],
					});
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.playing_previous),
						this.client.color.main,
					);
					await message.edit({
						embeds: [
							embed.setFooter({
								text: t(I18N.events.setupButton.previous_footer, {
									lng: locale,
									displayName: interaction.member.displayName,
								}),
								iconURL: interaction.member.displayAvatarURL({}),
							}),
						],
					});
					break;
				}
				case "REWIND_BUT": {
					const time = player.position - 10000;
					if (time < 0) {
						player.seek(0);
					} else {
						player.seek(time);
					}
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.rewinded),
						this.client.color.main,
					);
					await message.edit({
						embeds: [
							embed.setFooter({
								text: t(I18N.events.setupButton.rewind_footer, {
									lng: locale,
									displayName: interaction.member.displayName,
								}),
								iconURL: interaction.member.displayAvatarURL({}),
							}),
						],
					});
					break;
				}
				case "PAUSE_BUT": {
					const name = player.paused
						? t(I18N.events.setupButton.resumed)
						: t(I18N.events.setupButton.paused);
					if (player.paused) {
						player.resume();
					} else {
						player.pause();
					}
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.pause_resume, { lng: locale, name }),
						this.client.color.main,
					);
					await message.edit({
						embeds: [
							embed.setFooter({
								text: t(I18N.events.setupButton.pause_resume_footer, {
									lng: locale,
									name,
									displayName: interaction.member.displayName,
								}),
								iconURL: interaction.member.displayAvatarURL({}),
							}),
						],
						components: getButtons(player, this.client),
					});
					break;
				}
				case "FORWARD_BUT": {
					const time = player.position + 10000;
					if (time > player.queue.current.info.duration) {
						return await buttonReply(
							interaction,
							t(I18N.events.setupButton.forward_limit),
							this.client.color.main,
						);
					}
					player.seek(time);
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.forwarded),
						this.client.color.main,
					);
					await message.edit({
						embeds: [
							embed.setFooter({
								text: t(I18N.events.setupButton.forward_footer, {
									lng: locale,
									displayName: interaction.member.displayName,
								}),
								iconURL: interaction.member.displayAvatarURL({}),
							}),
						],
					});
					break;
				}
				case "SKIP_BUT": {
					if (player.queue.tracks.length === 0) {
						return await buttonReply(
							interaction,
							t(I18N.events.setupButton.no_music_to_skip),
							this.client.color.main,
						);
					}

					player.skip();
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.skipped),
						this.client.color.main,
					);

					const newTrack = player.queue.current?.info;
					const newEmbed = this.client
						.embed()
						.setAuthor({
							name: t(I18N.events.setupButton.now_playing),
							iconURL:
								this.client.config.icons[newTrack?.sourceName || ""] ||
								this.client.user?.displayAvatarURL({ extension: "png" }),
						})
						.setColor(this.client.color.main)
						.setDescription(
							`[${newTrack?.title}](${newTrack?.uri}) - ${newTrack?.isStream ? t(I18N.events.setupButton.live) : this.client.utils.formatTime(newTrack?.duration)} - ${t(I18N.events.setupButton.requested_by, { lng: locale, requester: (player.queue.current?.requester as Requester).id })}`,
						)
						.setImage(
							(newTrack?.artworkUrl || this.client.user?.displayAvatarURL({ extension: "png" })) ??
								"",
						);

					if (message) {
						await message.edit({
							embeds: [newEmbed],
							components: getButtons(player, this.client),
						});
					}
					break;
				}
				case "LOW_VOL_BUT":
					await handleVolumeChange(-10);
					break;
				case "LOOP_BUT": {
					const loopOptions: Array<"off" | "queue" | "track"> = ["off", "queue", "track"];
					const newLoop =
						loopOptions[(loopOptions.indexOf(player.repeatMode) + 1) % loopOptions.length];
					player.setRepeatMode(newLoop);
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.loop_set, {
							lng: locale,
							loop: newLoop,
						}),
						this.client.color.main,
					);
					await message.edit({
						embeds: [
							embed.setFooter({
								text: t(I18N.events.setupButton.loop_footer, {
									lng: locale,
									loop: newLoop,
									displayName: interaction.member.displayName,
								}),
								iconURL: interaction.member.displayAvatarURL({}),
							}),
						],
					});
					break;
				}
				case "STOP_BUT": {
					player.stopPlaying(true, false);
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.stopped),
						this.client.color.main,
					);
					await message.edit({
						embeds: [
							embed
								.setFooter({
									text: t(I18N.events.setupButton.stopped_footer, {
										lng: locale,
										displayName: interaction.member.displayName,
									}),
									iconURL: interaction.member.displayAvatarURL({}),
								})
								.setDescription(t(I18N.events.setupButton.nothing_playing))
								.setImage(this.client.config.links.img)
								.setAuthor({
									name: this.client.user?.username ?? "",
									iconURL:
										this.client.user?.displayAvatarURL({
											extension: "png",
										}) ?? "",
								}),
						],
					});
					break;
				}
				case "SHUFFLE_BUT": {
					player.queue.shuffle();
					await buttonReply(
						interaction,
						t(I18N.events.setupButton.shuffled),
						this.client.color.main,
					);
					break;
				}
				case "HIGH_VOL_BUT":
					await handleVolumeChange(10);
					break;
			}
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
