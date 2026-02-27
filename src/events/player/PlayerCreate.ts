import type { Player } from "lavalink-client";
import { Event, type Lavamusic } from "../../structures/index";
import { LavamusicEventType } from "../../types/events";

export default class PlayerCreate extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			type: LavamusicEventType.Player,
			name: "playerCreate",
		});
	}

	public async run(player: Player): Promise<void> {
		const guild = this.client.guilds.cache.get(player.guildId);
		if (!guild) return;

		const defaultVolume = await this.client.db.getDefaultVolume(player.guildId);
		if (defaultVolume !== null && defaultVolume > 0) {
			await player.setVolume(defaultVolume);
		}
	}
}
