import type { TextChannel } from "discord.js";
import type { Player } from "lavalink-client";
import { Event, type Lavamusic } from "../../structures/index";
import { LavamusicEventType } from "../../types/events";
import { updateSetup } from "../../utils/SetupSystem";

export default class PlayerDisconnect extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			type: LavamusicEventType.Player,
			name: "playerDisconnect",
		});
	}

	public async run(player: Player, voiceChannelId: string): Promise<void> {
		const guild = this.client.guilds.cache.get(player.guildId);
		if (!guild) return;
		const locale = await this.client.db.getLanguage(player.guildId);
		await updateSetup(this.client, guild, locale);

		if (voiceChannelId) {
			await this.client.utils.setVoiceStatus(this.client, voiceChannelId, "");
		}

		const messageId = player.get<string | undefined>("messageId");
		if (!messageId) return;

		const channel = guild.channels.cache.get(player.textChannelId!) as TextChannel;
		if (!channel) return;

		const message = await channel.messages.fetch(messageId).catch(() => {
			null;
		});
		if (!message) return;

		if (message.editable) {
			await message.edit({ components: [] }).catch(() => {
				null;
			});
		}
	}
}
