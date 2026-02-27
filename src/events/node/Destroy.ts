import type { DestroyReasonsType, LavalinkNode } from "lavalink-client";
import { Event, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { LavamusicEventType } from "../../types/events";
import { LOG_LEVEL } from "../../types/log";
import { sendLog } from "../../utils/BotLog";
export default class Destroy extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			type: LavamusicEventType.Node,
			name: "destroy",
		});
	}

	public async run(node: LavalinkNode, destroyReason?: DestroyReasonsType): Promise<void> {
		logger.success(`Node ${node.id} is destroyed!`);
		sendLog(this.client, `Node ${node.id} is destroyed: ${destroyReason}`, LOG_LEVEL.WARN);
	}
}
