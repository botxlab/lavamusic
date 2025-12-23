import type { LavalinkNode } from "lavalink-client";
import { Event, type Lavamusic } from "../../structures/index";
import { sendLog } from "../../utils/BotLog";
import logger from "../../structures/Logger";
export default class Connect extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			name: "connect",
		});
	}

	public async run(node: LavalinkNode): Promise<void> {
		logger.success(`Node ${node.id} is ready!`);

		let data = await this.client.db.get_247();
		if (!data) return;

		if (!Array.isArray(data)) {
			data = [data];
		}

		data.forEach(
			(
				main: { guildId: string; textId: string; voiceId: string },
				index: number,
			) => {
				setTimeout(async () => {
					const guild = this.client.guilds.cache.get(main.guildId);
					if (!guild) return;

					const channel = guild.channels.cache.get(main.textId);
					const vc = guild.channels.cache.get(main.voiceId);

					if (channel && vc) {
						try {
							const player = this.client.manager.createPlayer({
								guildId: guild.id,
								voiceChannelId: vc.id,
								textChannelId: channel.id,
								selfDeaf: true,
								selfMute: false,
							});
							if (!player.connected) await player.connect();
						} catch (error) {
							logger.error(
								`Failed to create queue for guild ${guild.id}: ${error}`,
							);
						}
					} else {
						logger.warn(
							`Missing channels for guild ${guild.id}. Text channel: ${main.textId}, Voice channel: ${main.voiceId}`,
						);
					}
				}, index * 1000);
			},
		);

		sendLog(this.client, `Node ${node.id} is ready!`, "success");
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
