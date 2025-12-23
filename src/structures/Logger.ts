import { Signale, type SignaleOptions } from "signale";
import config from "../config";
import { CONSOLE_LOG_COLORS, getLogBadge, LOG_LEVEL, LogBadgeStyle } from "../types/log";

/**
 * Custom Logger class extending Signale.
 *
 * All configurations are from @see {module:types.log}.
 */
class Logger extends Signale {
	constructor(scope = "Lavamusic") {
		const options: SignaleOptions = {
			disabled: false,
			interactive: false,
			logLevel: LOG_LEVEL.INFO,
			scope: scope,
			types: Logger.buildTypes(),
		};

		super(options);
	}

	/**
	 * Constructs the Signale configuration dynamically.
	 */
	private static buildTypes(): SignaleOptions["types"] {
		const types: any = {};

		for (const level of Object.values(LOG_LEVEL)) {
			const key = level.toLowerCase();

			types[key] = {
				...(!config.logBadgeStyle.match(LogBadgeStyle.default) && { badge: getLogBadge(level, config.logBadgeStyle) }),
				color: CONSOLE_LOG_COLORS[level],
				label: level,
			};
		}

		return types;
	}
}

const logger = new Logger();

export default logger;

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
