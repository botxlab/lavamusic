import http from "node:http";
import { env } from "../../env";
import type { Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import type { BotPlugin } from "../../types/botPlugin";
const keepAlive: BotPlugin = {
	name: "KeepAlive Plugin",
	version: "1.0.0",
	author: "Appu",
	initialize: (client: Lavamusic) => {
		if (env.KEEP_ALIVE) {
			const server = http.createServer((_req, res) => {
				res.writeHead(200, { "Content-Type": "text/plain" });
				res.end(`I'm alive! Currently serving ${client.guilds.cache.size} guilds.`);
			});
			server.listen(3000, () => {
				logger.info("Keep-Alive server is running on port 3000");
			});
		}
	},
};

export default keepAlive;

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
