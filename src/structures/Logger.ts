import { Signale, type SignaleOptions } from "signale";
import { CONSOLE_LOG_COLORS, LOG_LEVEL } from "../types/log";

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
				color: CONSOLE_LOG_COLORS[level],
				label: level,
			};
		}

		return types;
	}
}

const logger = new Logger();

export default logger;
