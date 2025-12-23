import type { LavalinkNode } from "lavalink-client";
import { Event, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { sendLog } from "../../utils/BotLog";
export default class ErrorEvent extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			name: "error",
		});
	}

	public async run(node: LavalinkNode, error: Error): Promise<void> {
		logger.error(
			`Node ${node.id} error: ${error.stack || error.message}`,
		);
		sendLog(
			this.client,
			`Node ${node.id} encountered an error: ${error.stack || error.message}`,
			"error",
		);
	}
}
