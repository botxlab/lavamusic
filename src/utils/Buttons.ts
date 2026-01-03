import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type EmojiIdentifierResolvable,
} from "discord.js";
import type { Player } from "lavalink-client";
import type { Lavamusic } from "../structures/index";

function getButtons(player: Player, client: Lavamusic): ActionRowBuilder<ButtonBuilder>[] {
	const buttonData = [
		{
			customId: "PREV_BUT",
			emoji: client.emoji.previous,
			style: ButtonStyle.Secondary,
		},
		{
			customId: "REWIND_BUT",
			emoji: client.emoji.rewind,
			style: ButtonStyle.Secondary,
		},
		{
			customId: "PAUSE_BUT",
			emoji: player?.paused ? client.emoji.resume : client.emoji.pause,
			style: player?.paused ? ButtonStyle.Success : ButtonStyle.Secondary,
		},
		{
			customId: "FORWARD_BUT",
			emoji: client.emoji.forward,
			style: ButtonStyle.Secondary,
		},
		{
			customId: "SKIP_BUT",
			emoji: client.emoji.skip,
			style: ButtonStyle.Secondary,
		},
		{
			customId: "LOW_VOL_BUT",
			emoji: client.emoji.volume.down,
			style: ButtonStyle.Secondary,
		},
		{
			customId: "LOOP_BUT",
			emoji: client.emoji.loop.none,
			style: ButtonStyle.Secondary,
		},
		{
			customId: "STOP_BUT",
			emoji: client.emoji.stop,
			style: ButtonStyle.Danger,
		},
		{
			customId: "SHUFFLE_BUT",
			emoji: client.emoji.shuffle,
			style: ButtonStyle.Secondary,
		},
		{
			customId: "HIGH_VOL_BUT",
			emoji: client.emoji.volume.up,
			style: ButtonStyle.Secondary,
		},
	];

	return buttonData.reduce((rows, { customId, emoji, style }, index) => {
		if (index % 5 === 0) rows.push(new ActionRowBuilder<ButtonBuilder>());

		let emojiFormat: EmojiIdentifierResolvable;
		if (typeof emoji === "string" && emoji.startsWith("<:")) {
			const match = emoji.match(/^<:\w+:(\d+)>$/);
			emojiFormat = match ? match[1] : emoji;
		} else {
			emojiFormat = emoji;
		}

		const button = new ButtonBuilder().setCustomId(customId).setEmoji(emojiFormat).setStyle(style);
		rows[rows.length - 1].addComponents(button);
		return rows;
	}, [] as ActionRowBuilder<ButtonBuilder>[]);
}

export { getButtons };

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
