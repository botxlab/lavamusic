import { ShardEvents, ShardingManager } from "discord.js";
import { env } from "./env";
import logger from "./structures/Logger";

export async function start() {
	const shardPath = process.argv[1];

	const manager = new ShardingManager(shardPath, {
		respawn: true,
		token: env.TOKEN,
		totalShards: "auto",
		shardList: "auto",
		execArgv: ["--smol"],
	});

	manager.on("shardCreate", (shard) => {
		logger.info(`[MANAGER] Launching Shard ${shard.id}...`);

		shard.on(ShardEvents.Ready, () => {
			logger.start(`[MANAGER] Shard ${shard.id} connected to Discord's Gateway.`);
		});

		shard.on(ShardEvents.Death, () => {
			logger.error(`[MANAGER] Shard ${shard.id} died unexpectedly.`);
		});

		shard.on(ShardEvents.Error, (err) => {
			logger.error(`[MANAGER] Shard ${shard.id} error:`, err);
		});
	});

	try {
		await manager.spawn({ timeout: -1 });
		const totalShards = manager.shards.size;
		logger.start(
			`[MANAGER] ${totalShards} shard${totalShards > 1 ? "s" : ""} spawned successfully.`,
		);
	} catch (error) {
		logger.error("[MANAGER] Failed to spawn shards:", error);
	}
}
