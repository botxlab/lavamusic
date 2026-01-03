/** A utility to transform locales/languages into flag emojis. */

/** **Regional Indicator Symbols** (🇦-🇿) start at `U+1F1E6`. */
const REGIONAL_INDICATOR_BASE = 0x1f1e6;
/** **Latin Capital Letter** `A` is `U+0041`. */
const LATIN_CAPITAL_BASE = 0x0041;
const OFFSET = REGIONAL_INDICATOR_BASE - LATIN_CAPITAL_BASE;

const FALLBACK_EMOJI = "🌐";
const ISO_REGION_REGEX = /^[A-Z]{2}$/;

/**
 * Domain-specific overrides.
 * Maps non-standard region codes or naked languages to country codes.
 */
const OVERRIDES: Readonly<Record<string, string>> = {
	"es-419": "🌎", // Latin America
	da: "DK", // Danish -> Denmark
	vi: "VN", // Vietnamese -> Vietnam
	cs: "CZ", // Czech -> Czechia
	el: "GR", // Greek -> Greece
	uk: "UA", // Ukrainian -> Ukraine
	hi: "IN", // Hindi -> India
	ja: "JP", // Japanese -> Japan
	ko: "KR", // Korean -> South Korea
	zh: "CN", // Chinese -> China
} as const;

/** Memoization cache to avoid redundant calculations */
const CACHE = new Map<string, string>();
const MAX_CACHE_SIZE = 80;

/**
 * Converts a validated 2-letter ISO country code to an emoji flag.
 * Spread `[...]` is safer for unicode than `split('')`.
 */
function getFlag(countryCode: string): string {
	const code = countryCode.toUpperCase();

	if (!ISO_REGION_REGEX.test(code)) return FALLBACK_EMOJI;

	const codePoints = [...code].map((char) => (char.codePointAt(0) ?? 0) + OFFSET);
	return String.fromCodePoint(...codePoints);
}

/**
 * Normalizes input to a 2-letter country code (ISO 3166-1 alpha-2).
 *
 * Handles "en-US" (IETF/BCP47), "en_US" (POSIX), or raw "BR".
 */
function parseInput(input: string): string | null {
	const sanitized = input.trim().replace("_", "-").toLowerCase();

	// Check overrides
	if (OVERRIDES[sanitized]) return OVERRIDES[sanitized];

	try {
		/**
		 * Use Intl.Locale to parse BCP 47 language tags.
		 *
		 * .maximize() turns "ru" into "ru-Cyrl-RU" or "da" into "da-Latn-DK".
		 *
		 * This automatically resolves the primary region for "naked" language codes.
		 */
		const locale = new Intl.Locale(sanitized).maximize();
		// If locale has a region (e.g., "US"), use it.
		if (locale.region && ISO_REGION_REGEX.test(locale.region.toUpperCase())) {
			return locale.region.toUpperCase();
		}
	} catch {
		// Fallback for raw ISO codes if Intl.Locale fails
		const rawCode = sanitized.toUpperCase();
		if (ISO_REGION_REGEX.test(rawCode)) return rawCode;
	}

	return null;
}

/**
 * Converts a locale or country code into an emoji flag.
 * @param input - Locale string (en-US, pt_BR) or country code (US, BR)
 */
export function getEmojiFlag(input: string | null | undefined): string {
	if (!input) return FALLBACK_EMOJI;

	const key = input.trim();
	const cached = CACHE.get(key);
	if (cached) return cached;

	const countryCode = parseInput(key);

	if (!countryCode) return FALLBACK_EMOJI;

	/**
	 * Check if the resolved value is already an emoji (like 🌎)
	 * or a standard 2-letter country code (like US)
	 */
	const flag = countryCode.length > 2 ? countryCode : getFlag(countryCode);

	if (CACHE.size >= MAX_CACHE_SIZE) {
		const firstKey = CACHE.keys().next().value;
		if (firstKey !== undefined) CACHE.delete(firstKey);
	}

	CACHE.set(key, flag);

	return flag;
}

/**
 * Converts a flag emoji to ISO country code.
 * @param emoji - The flag emoji (e.g., "🇧🇷").
 * @returns ISO 3166-1 alpha-2 country code (e.g., "BR") or null if invalid/special emoji.
 */
export function getCountryCode(emoji: string): string | null {
	if (!emoji || [...emoji].length !== 2) return null;

	try {
		const codePoints = [...emoji].map((char) => (char.codePointAt(0) ?? 0) - OFFSET);
		const code = String.fromCodePoint(...codePoints);

		return ISO_REGION_REGEX.test(code) ? code : null;
	} catch {
		return null;
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
