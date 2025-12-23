import {
    type ColorResolvable,
    EmbedBuilder,
    type Guild,
    type Message,
    MessageFlags,
    type TextChannel,
} from "discord.js";
import type { Player, Track } from "lavalink-client";
import { T } from "../structures/I18n";
import type { Lavamusic } from "../structures/index";
import type { Requester } from "../types";
import { getButtons } from "./Buttons";
import logger from "../structures/Logger";

/**
 * A function that will generate an embed based on the player's current track.
 * @param embed The embed that will be modified.
 * @param player The player to get the current track from.
 * @param client The client to get the config from.
 * @param locale The locale to translate the strings.
 * @returns The modified embed.
 */
function neb(
	embed: EmbedBuilder,
	player: Player,
	client: Lavamusic,
	locale: string,
): EmbedBuilder {
	if (!player?.queue.current?.info) return embed;
	const iconUrl =
		client.config.icons[player.queue.current.info.sourceName] ||
		client.user!.displayAvatarURL({ extension: "png" });
	const icon = player.queue.current.info.artworkUrl || client.config.links.img;

	const description = T(locale, "player.setupStart.description", {
		title: player.queue.current.info.title,
		uri: player.queue.current.info.uri,
		author: player.queue.current.info.author,
		length: client.utils.formatTime(player.queue.current.info.duration),
		requester: (player.queue.current.requester as Requester).id,
	});
	return embed
		.setAuthor({
			name: T(locale, "player.setupStart.now_playing"),
			iconURL: iconUrl,
		})
		.setDescription(description)
		.setImage(icon)
		.setColor(client.color.main);
}

/**
 * A function that will generate a setup message or edit an existing one
 * with the current song playing.
 * @param client The client to get the config from.
 * @param query The query to search for.
 * @param player The player to get the current track from.
 * @param message The message to edit or send the setup message.
 * @returns A promise that resolves when the function is done.
 */
async function setupStart(
	client: Lavamusic,
	query: string,
	player: Player,
	message: Message,
): Promise<void> {
	let m: Message | undefined;
	const embed = client.embed();
	const n = client.embed().setColor(client.color.main);
	const data = await client.db.getSetup(message.guild!.id);
	const locale = await client.db.getLanguage(message.guildId!);
	try {
		if (data)
			m = await message.channel.messages.fetch({
				message: data.messageId,
				cache: true,
			});
	} catch (error) {
		logger.error(error);
	}
	if (m) {
		try {
			if (message.inGuild()) {
				const res = await player.search(query, message.author);

				switch (res.loadType) {
					case "empty":
					case "error":
						await message.channel
							.send({
								embeds: [
									embed
										.setColor(client.color.red)
										.setDescription(
											T(locale, "player.setupStart.error_searching"),
										),
								],
							})
							.then((msg) => setTimeout(() => msg.delete(), 5000));
						break;
					case "search":
					case "track": {
						player.queue.add(res.tracks[0]);
						await message.channel
							.send({
								embeds: [
									embed.setColor(client.color.main).setDescription(
										T(locale, "player.setupStart.added_to_queue", {
											title: res.tracks[0].info.title,
											uri: res.tracks[0].info.uri,
										}),
									),
								],
							})
							.then((msg) => setTimeout(() => msg.delete(), 5000));
						neb(n, player, client, locale);
						await m.edit({ embeds: [n] }).catch(() => {
							null;
						});
						break;
					}
					case "playlist": {
						player.queue.add(res.tracks);
						await message.channel
							.send({
								embeds: [
									embed.setColor(client.color.main).setDescription(
										T(locale, "player.setupStart.added_playlist_to_queue", {
											length: res.tracks.length,
										}),
									),
								],
							})
							.then((msg) => setTimeout(() => msg.delete(), 5000));
						neb(n, player, client, locale);
						await m.edit({ embeds: [n] }).catch(() => {
							null;
						});
						break;
					}
				}
				if (!player.playing && player.queue.tracks.length > 0)
					await player.play();
			}
		} catch (error) {
			logger.error(error);
		}
	}
}

/**
 * A function that will generate an embed based on the player's current track.
 * @param msgId The message ID of the setup message.
 * @param channel The channel to send the message in.
 * @param player The player to get the current track from.
 * @param track The track to generate the embed for.
 * @param client The client to get the config from.
 * @param locale The locale to translate the strings.
 * @returns A promise that resolves when the function is done.
 */
async function trackStart(
	msgId: any,
	channel: TextChannel,
	player: Player,
	track: Track,
	client: Lavamusic,
	locale: string,
): Promise<void> {
	const icon = player.queue.current
		? player.queue.current.info.artworkUrl
		: client.config.links.img;
	let m: Message | undefined;

	try {
		m = await channel.messages.fetch({ message: msgId, cache: true });
	} catch (error) {
		logger.error(error);
	}

	const iconUrl =
		client.config.icons[player.queue.current!.info.sourceName] ||
		client.user!.displayAvatarURL({ extension: "png" });
	const description = T(locale, "player.setupStart.description", {
		title: track.info.title,
		uri: track.info.uri,
		author: track.info.author,
		length: client.utils.formatTime(track.info.duration),
		requester: (player.queue.current!.requester as Requester).id,
	});

	const embed = client
		.embed()
		.setAuthor({
			name: T(locale, "player.setupStart.now_playing"),
			iconURL: iconUrl,
		})
		.setColor(client.color.main)
		.setDescription(description)
		.setImage(icon);

	if (m) {
		await m
			.edit({
				embeds: [embed],
				components: getButtons(player, client).map((b) => {
					b.components.forEach((c) => c.setDisabled(!player?.queue.current));
					return b;
				}),
			})
			.catch(() => {
				null;
			});
	} else {
		await channel
			.send({
				embeds: [embed],
				components: getButtons(player, client).map((b) => {
					b.components.forEach((c) => c.setDisabled(!player?.queue.current));
					return b;
				}),
			})
			.then((msg) => {
				client.db.setSetup(msg.guild.id, msg.id, msg.channel.id);
			})
			.catch(() => {
				null;
			});
	}
}

async function updateSetup(
	client: Lavamusic,
	guild: Guild,
	locale: string,
): Promise<void> {
	const setup = await client.db.getSetup(guild.id);
	let m: Message | undefined;
	if (setup?.textId) {
		const textChannel = guild.channels.cache.get(setup.textId) as TextChannel;
		if (!textChannel) return;
		try {
			m = await textChannel.messages.fetch({
				message: setup.messageId,
				cache: true,
			});
		} catch (error) {
			logger.error(error);
		}
	}
	if (m) {
		const player = client.manager.getPlayer(guild.id);
		if (player?.queue.current) {
			const iconUrl =
				client.config.icons[player.queue.current.info.sourceName] ||
				client.user!.displayAvatarURL({ extension: "png" });
			const description = T(locale, "player.setupStart.description", {
				title: player.queue.current.info.title,
				uri: player.queue.current.info.uri,
				author: player.queue.current.info.author,
				length: client.utils.formatTime(player.queue.current.info.duration),
				requester: (player.queue.current.requester as Requester).id,
			});

			const embed = client
				.embed()
				.setAuthor({
					name: T(locale, "player.setupStart.now_playing"),
					iconURL: iconUrl,
				})
				.setColor(client.color.main)
				.setDescription(description)
				.setImage(player.queue.current.info.artworkUrl);
			await m
				.edit({
					embeds: [embed],
					components: getButtons(player, client).map((b) => {
						b.components.forEach((c) => c.setDisabled(!player?.queue.current));
						return b;
					}),
				})
				.catch(() => {
					null;
				});
		} else {
			const embed = client
				.embed()
				.setColor(client.color.main)
				.setAuthor({
					name: client.user!.username,
					iconURL: client.user!.displayAvatarURL({ extension: "png" }),
				})
				.setDescription(T(locale, "player.setupStart.nothing_playing"))
				.setImage(client.config.links.img);
			await m
				.edit({
					embeds: [embed],
					components: getButtons(player!, client).map((b) => {
						b.components.forEach((c) => c.setDisabled(true));
						return b;
					}),
				})
				.catch(() => {
					null;
				});
		}
	}
}

async function buttonReply(
	int: any,
	args: string,
	color: ColorResolvable,
): Promise<void> {
	const embed = new EmbedBuilder();
	let m: Message;
	if (int.replied) {
		m = await int
			.editReply({ embeds: [embed.setColor(color).setDescription(args)] })
			.catch(() => {
				null;
			});
	} else {
		m = await int
			.followUp({ embeds: [embed.setColor(color).setDescription(args)] })
			.catch(() => {
				null;
			});
	}
	setTimeout(async () => {
		if (int && !int.flags?.has(MessageFlags.Ephemeral)) {
			await m.delete().catch(() => {
				null;
			});
		}
	}, 2000);
}

async function oops(channel: TextChannel, args: string): Promise<void> {
	try {
		const embed1 = new EmbedBuilder().setColor("Red").setDescription(`${args}`);
		const m = await channel.send({
			embeds: [embed1],
		});
		setTimeout(
			async () =>
				await m.delete().catch(() => {
					null;
				}),
			12000,
		);
	} catch (e) {
		return console.error(e);
	}
}
export { buttonReply, oops, setupStart, trackStart, updateSetup };

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
