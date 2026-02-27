import {
	type AnySelectMenuInteraction,
	type ButtonInteraction,
	EmbedBuilder,
	GuildMember,
	MessageFlags,
	type ModalSubmitInteraction,
} from "discord.js";
import type { Player } from "lavalink-client";
import { I18N, t } from "../structures/I18n";
import type { Lavamusic } from "../structures/index";
import { checkDj, createButtonRow } from "../events/player/TrackStart";
import { updateSetup } from "./SetupSystem";

export async function handlePlayerInteraction(
	client: Lavamusic,
	interaction: ButtonInteraction | AnySelectMenuInteraction | ModalSubmitInteraction,
) {
	const player = client.manager.getPlayer(interaction.guildId!);
	if (!player || !player.queue.current) return null;

	if (interaction.member instanceof GuildMember) {
		const isSameVoiceChannel =
			interaction.guild?.members.me?.voice.channelId === interaction.member.voice.channelId;
		if (!isSameVoiceChannel) {
			await interaction.reply({
				content: t(I18N.player.trackStart.not_connected_to_voice_channel, {
					channel: interaction.guild?.members.me?.voice.channelId ?? "None",
				}),
				flags: MessageFlags.Ephemeral,
			});
			return null;
		}
	}

	if (!(await checkDj(client, interaction as any))) {
		await interaction.reply({
			content: t(I18N.player.trackStart.need_dj_role),
			flags: MessageFlags.Ephemeral,
		});
		return null;
	}

	return player;
}

export async function updatePlayerMessage(
	client: Lavamusic,
	interaction: ButtonInteraction,
	player: Player,
	text: string,
) {
	const setup = await client.db.getSetup(interaction.guildId!);
	const locale = await client.db.getLanguage(interaction.guildId!);

	// If it's the setup channel, update use the setup system logic
	if (
		setup &&
		interaction.channelId === setup.textId &&
		interaction.message.id === setup.messageId
	) {
		await updateSetup(client, interaction.guild!, locale);
		return;
	}

	// Otherwise, edit the current message (normal player)
	const track = player.queue.current!;
	const embed = new EmbedBuilder()
		.setAuthor({
			name: t(I18N.player.trackStart.now_playing, { lng: locale }),
			iconURL: client.config.icons[track.info.sourceName] || client.user?.displayAvatarURL(),
		})
		.setDescription(
			`**[${track.info.title}](${track.info.uri})**\n` +
				`-# ${text}\n` +
				`${t(I18N.player.trackStart.author)}: ${track.info.author}\n` +
				`${t(I18N.player.trackStart.duration)}: ${track.info.isStream ? "LIVE" : client.utils.formatTime(track.info.duration)}`,
		)
		.setColor(client.color.main);

	if (track.info.artworkUrl) {
		embed.setThumbnail(track.info.artworkUrl);
	}

	await interaction.message.edit({
		embeds: [embed],
		components: [createButtonRow(player)],
	});
}
