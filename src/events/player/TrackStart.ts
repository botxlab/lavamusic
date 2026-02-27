import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChannelSelectMenuInteraction,
	EmbedBuilder,
	type MentionableSelectMenuInteraction,
	PermissionFlagsBits,
	type RoleSelectMenuInteraction,
	type StringSelectMenuInteraction,
	type TextChannel,
	type UserSelectMenuInteraction,
} from "discord.js";
import type { Player, Track, TrackStartEvent } from "lavalink-client";
import { I18N, t } from "../../structures/I18n";
import { Event, type Lavamusic } from "../../structures/index";
import type { Requester } from "../../types";
import { LavamusicEventType } from "../../types/events";
import { trackStart } from "../../utils/SetupSystem";

export default class TrackStart extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			type: LavamusicEventType.Player,
			name: "trackStart",
		});
	}

	public async run(player: Player, track: Track | null, _payload: TrackStartEvent): Promise<void> {
		const guild = this.client.guilds.cache.get(player.guildId);
		if (!guild) return;
		if (!player.textChannelId) return;
		if (!track) return;
		const channel = guild.channels.cache.get(player.textChannelId) as TextChannel;
		if (!channel) return;

		const locale = await this.client.db.getLanguage(guild.id);

		if (player.voiceChannelId) {
			await this.client.utils.setVoiceStatus(
				this.client,
				player.voiceChannelId,
				`♫ • ${track.info.title}`,
			);
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: t(I18N.player.trackStart.now_playing, { lng: locale }),
				iconURL:
					this.client.config.icons[track.info.sourceName] || this.client.user?.displayAvatarURL(),
			})
			.setDescription(
				`**[${track.info.title}](${track.info.uri})**\n` +
					`-# ${t(I18N.player.trackStart.author)}: ${track.info.author}\n` +
					`-# ${t(I18N.player.trackStart.duration)}: ${track.info.isStream ? "LIVE" : this.client.utils.formatTime(track.info.duration)}\n` +
					`-# ${t(I18N.player.trackStart.requested_by, { user: (track.requester as Requester).username })}`,
			)
			.setColor(this.client.color.main);

		if (track.info.artworkUrl) {
			embed.setThumbnail(track.info.artworkUrl);
		}

		const setup = await this.client.db.getSetup(guild.id);

		if (setup?.textId) {
			const textChannel = guild.channels.cache.get(setup.textId) as TextChannel;
			if (textChannel) {
				await trackStart(setup.messageId, textChannel, player, track, this.client, locale);
			}
		} else {
			const message = await channel.send({
				embeds: [embed],
				components: [createButtonRow(player)],
			});

			player.set("messageId", message.id);
		}
	}
}

export function createButtonRow(player: Player): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("resume")
			.setLabel(player.paused ? t(I18N.buttons.resume) : t(I18N.buttons.pause))
			.setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("previous")
			.setLabel(t(I18N.buttons.previous))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(!player.queue.previous || player.queue.previous.length === 0),
		new ButtonBuilder()
			.setCustomId("stop")
			.setLabel(t(I18N.buttons.stop))
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId("skip")
			.setLabel(t(I18N.buttons.skip))
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("loop")
			.setLabel(t(I18N.buttons.loop))
			.setStyle(player.repeatMode !== "off" ? ButtonStyle.Success : ButtonStyle.Secondary),
	);
}

export async function checkDj(
	client: Lavamusic,
	interaction:
		| ButtonInteraction<"cached">
		| StringSelectMenuInteraction<"cached">
		| UserSelectMenuInteraction<"cached">
		| RoleSelectMenuInteraction<"cached">
		| MentionableSelectMenuInteraction<"cached">
		| ChannelSelectMenuInteraction<"cached">,
): Promise<boolean> {
	const dj = await client.db.getDj(interaction.guildId);
	if (dj?.mode) {
		const djRole = await client.db.getRoles(interaction.guildId);
		if (!djRole) return false;
		const hasDjRole = interaction.member.roles.cache.some((role) =>
			djRole.map((r) => r.roleId).includes(role.id),
		);
		if (!(hasDjRole || interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))) {
			return false;
		}
	}
	return true;
}
