import { Colors } from "discord.js";

const LEVEL_KEYS = [
	"INFO",
	"WARN",
	"ERROR",
	"SUCCESS",
	"DEBUG",
	"LOG",
	"PAUSE",
	"START",
	"STAR",
] as const;

/**
 * Defines log levels derived directly from {@linkcode LEVEL_KEYS}.
 */
export type LogLevel = (typeof LEVEL_KEYS)[number];

export const LOG_LEVEL = Object.fromEntries(LEVEL_KEYS.map((key) => [key, key])) as {
	[K in LogLevel]: K;
};

/**
 * Discord Embed log colors.
 */
export const LOG_COLORS = {
	INFO: Colors.Blue,
	WARN: Colors.Yellow,
	ERROR: Colors.Red,
	SUCCESS: Colors.Green,
} as const;

/**
 * Type for log levels that support Discord Embeds.
 */
export type EmbedLogLevel = keyof typeof LOG_COLORS;

/**
 * Colors for console output.
 */
export const CONSOLE_LOG_COLORS: Record<LogLevel, string> = {
	INFO: "blue",
	WARN: "yellow",
	ERROR: "red",
	DEBUG: "magenta",
	SUCCESS: "green",
	LOG: "grey",
	PAUSE: "yellow",
	START: "green",
	STAR: "yellow",
};
