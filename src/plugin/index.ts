import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Lavamusic } from "../structures/index";
import logger from "../structures/Logger";
import type { BotPlugin } from "../types/botPlugin";

/**
 * Validate if a loaded module matches the BotPlugin interface at runtime.
 */
function isBotPlugin(obj: any): obj is BotPlugin {
	return obj && typeof obj.name === "string" && typeof obj.initialize === "function";
}

/**
 * Loads all plugins from `plugins` subdirectory.
 *
 * Designed to be fault-tolerant: if one plugin fails, others continue to load.
 *
 * @param client - The bot client instance.
 */
export default function loadPlugins(client: Lavamusic): void {
	const pluginsFolder = join(__dirname, "plugins");

	if (!existsSync(pluginsFolder)) {
		logger.warn(`[PLUGINS] Directory not found at: ${pluginsFolder}`);
		return;
	}

	// Filter for js/ts, ignoring definition files
	const pluginFiles = readdirSync(pluginsFolder).filter(
		(file) => (file.endsWith(".js") || file.endsWith(".ts")) && !file.endsWith(".d.ts"),
	);

	for (const file of pluginFiles) {
		try {
			const pluginPath = join(pluginsFolder, file);

			const rawModule = require(pluginPath);
			const plugin: BotPlugin = rawModule.default || rawModule;

			/**
			 * Validate structure before execution.
			 * Skip to the next plugin file to prevent crash
			 */
			if (!isBotPlugin(plugin)) {
				logger.warn(
					`[PLUGIN] Skipping invalid file: ${file} (Missing 'name' or 'initialize' method)`,
				);
				continue;
			}

			plugin.initialize(client);
			logger.info(`[PLUGIN] Loaded: ${plugin.name} v${plugin.version}`);
		} catch (error) {
			// Catch individual plugin errors to continues loading others
			logger.error(`[PLUGIN] Failed to load ${file}:`, error);
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
