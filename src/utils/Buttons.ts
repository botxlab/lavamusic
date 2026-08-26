import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { Player } from "lavalink-client";
import { I18N, t } from "../structures/I18n";

function getButtons(player: Player): ActionRowBuilder<ButtonBuilder>[] {
	const buttonData = [
		{
			customId: "previous",
			style: ButtonStyle.Secondary,
			emoji: "⏮️",
		},
		{
			customId: "rewind",
			style: ButtonStyle.Secondary,
			emoji: "⏪",
		},
		{
			customId: "resume",
			style: player?.paused ? ButtonStyle.Success : ButtonStyle.Secondary,
			emoji: player?.paused ? "▶️" : "⏸️",
		},
		{
			customId: "forward",
			style: ButtonStyle.Secondary,
			emoji: "⏩",
		},
		{
			customId: "skip",
			label: t(I18N.buttons.skip),
			style: ButtonStyle.Secondary,
			emoji: "⏭️",
		},
		{
			customId: "vol_down",
			style: ButtonStyle.Secondary,
			emoji: "🔉",
		},
		{
			customId: "loop",
			style: player?.repeatMode !== "off" ? ButtonStyle.Success : ButtonStyle.Secondary,
			emoji: "🔁",
		},
		{
			customId: "stop",
			style: ButtonStyle.Danger,
			emoji: "⏹️",
		},
		{
			customId: "shuffle",
			label: t(I18N.buttons.shuffle),
			style: ButtonStyle.Secondary,
			emoji: "🔀",
		},
		{
			customId: "vol_up",
			style: ButtonStyle.Secondary,
			emoji: "🔊",
		},
	];

	return buttonData.reduce((rows, { customId, label, style, emoji }, index) => {
		if (index % 5 === 0) rows.push(new ActionRowBuilder<ButtonBuilder>());

		const button = new ButtonBuilder().setCustomId(customId).setStyle(style).setEmoji(emoji);
		if (label) button.setLabel(label);
		rows[rows.length - 1].addComponents(button);
		return rows;
	}, [] as ActionRowBuilder<ButtonBuilder>[]);
}

export { getButtons };
