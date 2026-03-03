import type { Lavamusic } from "../structures/index";
import logger from "../structures/Logger";

/**
 * AntiCrash handler to prevent the bot from crashing on unhandled errors.
 */
export function setupAntiCrash(client: Lavamusic): void {
	process.on("unhandledRejection", (reason, promise) => {
		logger.error("Unhandled Rejection at:", promise, "reason:", reason);
	});

	process.on("uncaughtException", (err) => {
		logger.error("Uncaught Exception thrown:", err);
	});

	const handleExit = async (): Promise<void> => {
		if (client) {
			logger.star("Disconnecting from Discord...");
			await client.destroy();
			logger.success("Successfully disconnected from Discord!");
		}
		process.exit(0);
	};

	process.on("SIGINT", handleExit);
	process.on("SIGTERM", handleExit);
	process.on("SIGQUIT", handleExit);
}
