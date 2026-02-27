import type { Locale } from "discord.js";

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
