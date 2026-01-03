import type { Locale } from "discord.js";

/**
 * Languages defined from ISO codes compatible with Discord API
 * @see https://discord.com/developers/docs/reference#locales
 */

/**
 * Get the human-readable name of a locale.
 * @param target - The locale to get the name for.
 * @param displayIn - The language in which the name should be displayed (default: English).
 */
export function getLanguageName(target: Locale, displayIn: string = "en"): string {
	try {
		const displayNames = new Intl.DisplayNames([displayIn], { type: "language" });
		return displayNames.of(target) ?? target;
	} catch {
		return target;
	}
}

export const LOCALE_SUB_KEYS = {
	name: "name",
	description: "description",
	options: "options",
} as const;

export type LocaleSubKeys = keyof typeof LOCALE_SUB_KEYS;
