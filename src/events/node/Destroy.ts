import type { DestroyReasonsType, LavalinkNode } from "lavalink-client";
import { Event, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { sendLog } from "../../utils/BotLog";
export default class Destroy extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			name: "destroy",
		});
	}

	public async run(
		node: LavalinkNode,
		destroyReason?: DestroyReasonsType,
	): Promise<void> {
		logger.success(`Node ${node.id} is destroyed!`);
		sendLog(
			this.client,
			`Node ${node.id} is destroyed: ${destroyReason}`,
			"warn",
		);
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
