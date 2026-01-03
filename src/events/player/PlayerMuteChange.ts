import type { Player } from "lavalink-client";
import { Event, type Lavamusic } from "../../structures/index";

export default class PlayerMuteChange extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			name: "playerMuteChange",
		});
	}

	public async run(player: Player, _selfMuted: boolean, serverMuted: boolean): Promise<void> {
		if (!player) return;

		if (serverMuted && player.playing && !player.paused) {
			player.pause();
		} else if (!serverMuted && player.paused) {
			player.resume();
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
