import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, parse } from "node:path";
import { Locale, type LocalizationMap } from "discord.js";
import i18next from "i18next";
import type { I18nResourceSchema } from "../@types/i18next";
import { LOCALE_SUB_KEYS, type LocaleSubKeys } from "../types/locales";
import logger from "./Logger";

// Resolve path relative to this file's location
const LOCALES_PATH = join(import.meta.dirname, "..", "..", "locales");

const UNSUPPORTED_LOCALES = ["pt-PT"];

/**
 * Initializes i18next by scanning the locales directory.
 * Directories are treated as language codes, and JSON files as namespaces.
 */
export async function initI18n() {
	// Detect available files to build the supported languages list
	const languages = existsSync(LOCALES_PATH)
		? readdirSync(LOCALES_PATH).filter((lang) => {
				const fullPath = join(LOCALES_PATH, lang);

				if (!lstatSync(fullPath).isDirectory()) return false;

				if (lang.startsWith(".") || lang.startsWith("_")) return false;
				if (UNSUPPORTED_LOCALES.includes(lang)) return false;

				return true;
			})
		: [];

	await i18next.init({
		fallbackLng: Locale.EnglishUS,
		supportedLngs: languages,
		interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
		nsSeparator: ":",
		keySeparator: ".",
		initImmediate: false,
	});

	for (const locale of languages) {
		const langPath = join(LOCALES_PATH, locale);
		const files = readdirSync(langPath).filter((file) => file.endsWith(".json"));

		for (const file of files) {
			const namespace = parse(file).name; // e.g., "commands" from "commands.json"
			try {
				const content = JSON.parse(readFileSync(join(langPath, file), "utf8"));
				i18next.addResourceBundle(locale, namespace, content, true, true);
			} catch (err) {
				logger.error(`[i18n] Failed to load ${namespace} in ${locale}: ${err}`);
			}
		}
	}

	logger.info(`I18n initialized with ${languages.length} languages.`);
}

/**
 * Global translation function.
 * Coerces keys (including proxy objects) to strings before lookup.
 */
export const t = (key: any, options?: any): string => i18next.t(String(key), options);

/**
 * Resolves a translation key into a LocalizationMap for Discord API.
 * Handles Discord's strict naming conventions (lowercase, no spaces, length limits).
 *
 * @param key - The translation accessor (e.g., I18N.commands.ping)
 * @param type - Target field: `name` or `description`
 */
export function resolveLocalizations(key: any, type: LocaleSubKeys): LocalizationMap {
	const map: LocalizationMap = {};
	const rawKey = String(key);
	const isNameType = type === LOCALE_SUB_KEYS.name;
	const isOption = rawKey.includes(".options.");

	/** Normalize path: remove existing suffix if provided */
	const basePath = rawKey.endsWith(`.${type}`) ? rawKey.slice(0, -(type.length + 1)) : rawKey;

	const fallbackName = basePath
		.split(/[.:]/)
		.pop()!
		.toLowerCase()
		.replace(/[^a-z0-9_-]/g, "")
		.slice(0, 32);

	for (const lang of getSupportedLanguages()) {
		const lng = lang as keyof LocalizationMap;
		let translated: string | undefined;

		if (isNameType) {
			if (isOption) {
				map[lng] = fallbackName;
				continue;
			}

			const result = t(basePath, { lng: lang });

			if (isValidTranslation(result, basePath)) {
				/** Found a specific translation for the name */
				translated = result;
			} else {
				/** No translation or it's an object -> Use the key itself as the name */
				map[lng] = fallbackName;
				continue;
			}
		} else {
			if (isOption) {
				// Options are flat strings: "commands:dj.options.add"
				const result = t(basePath, { lng: lang });
				if (isValidTranslation(result, basePath)) {
					translated = result;
				}
			} else {
				// Commands are objects: "commands:ping.description"
				const descPath = `${basePath}.description`;
				const res = t(descPath, { lng: lang });
				if (isValidTranslation(res, descPath)) {
					translated = res;
				}
			}
		}

		if (!translated) continue;

		/**
		 * Discord limitations
		 * `names` must be lowercase, kebab-case, max 32 chars
		 * `descriptions` max 100 chars
		 */
		if (isNameType) {
			const sanitized = translated
				.toLowerCase()
				.trim()
				.replace(/\s+/g, "-")
				.replace(/[^a-z0-9_-]/g, "")
				.slice(0, 32);
			map[lng] = sanitized || fallbackName;
		} else {
			map[lng] = translated.trim().slice(0, 100);
		}
	}
	return map;
}

function isValidTranslation(val: string, key: string): boolean {
	return (
		!!val && val !== key && val !== key.split(":").pop() && !val.includes("returned an object")
	);
}

/** Returns all registered languages except i18next's internal `cimode`. */
export function getSupportedLanguages(): string[] {
	return ((i18next.options.supportedLngs as string[]) || []).filter((l) => l !== "cimode");
}

/** Formats an array of keys into an i18next path (ns:key.subKey). */
const buildPath = (path: string[]) =>
	path.length > 1 ? `${path[0]}:${path.slice(1).join(".")}` : path[0] || "";

/**
 * Creates a recursive proxy to provide type-safe translation keys via the I18N object.
 * Converts access like I18N.cmd.ping into "cmd:ping".
 */
const createProxy = (path: string[] = []): any =>
	new Proxy(() => {}, {
		get: (_, prop) => {
			if (prop === "toString" || prop === Symbol.toPrimitive) return () => buildPath(path);
			if (typeof prop !== "string" || prop === "then") return undefined;
			return createProxy([...path, prop]);
		},
		apply: () => buildPath(path),
	});

/**
 * Type-safe translation accessor.
 * @example I18N.commands.ping.name -> "commands:ping.name"
 */
export const I18N = createProxy() as I18nResourceSchema;
