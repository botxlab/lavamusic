import { ShardEvents, ShardingManager } from "discord.js";
import path from "node:path";
import { env } from "./env";
import logger from "./structures/Logger";

/**
 * Starts the Sharding Manager
 */
export async function start() {
	/**
	 * Determine the file extension based on the current environment
	 *
	 * If this file is running as .ts, we assume the bot file is also .ts
	 */
	const fileExtension = __filename.endsWith(".ts") ? "ts" : "js";

	/**
	 * Resolve the absolute path to the shard entry point
	 *
	 * This constant removes the dependency on relative paths like "./dist"
	 */
	const shardPath = path.join(__dirname, `LavaClient.${fileExtension}`);

	const manager = new ShardingManager(shardPath, {
		respawn: true,
		token: env.TOKEN,
		totalShards: "auto",
		shardList: "auto",
	});

	manager.on("shardCreate", (shard) => {
		logger.info(`[CLIENT] Launching Shard ${shard.id}...`);

		shard.on(ShardEvents.Ready, () => {
			logger.start(`[CLIENT] Shard ${shard.id} connected to Discord's Gateway.`);
		});

		shard.on(ShardEvents.Death, () => {
			logger.error(`[CLIENT] Shard ${shard.id} died unexpectedly.`);
		});
	});

	try {
		await manager.spawn();
		const totalShards = manager.shards.size;
		logger.start(
			`[CLIENT] ${totalShards} shard${totalShards > 1 ? "s" : ""} spawned successfully.`,
		);
	} catch (error) {
		logger.error("[CLIENT] Failed to spawn shards:", error);
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
