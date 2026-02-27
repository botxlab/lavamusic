import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, parse } from "node:path";
import { Locale, type LocalizationMap } from "discord.js";
import i18next from "i18next";
import type { I18nResourceSchema } from "../@types/i18next";
import { LOCALE_SUB_KEYS, type LocaleSubKeys } from "../types/locales";
import logger from "./Logger";

const LOCALES_PATH = join(import.meta.dirname, "..", "..", "locales");

const UNSUPPORTED_LOCALES = ["pt-PT"];

export async function initI18n() {
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
			const namespace = parse(file).name;
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

export const t = (key: any, options?: any): string => i18next.t(String(key), options);

export function resolveLocalizations(key: any, type: LocaleSubKeys): LocalizationMap {
	const map: LocalizationMap = {};
	const rawKey = String(key);
	const isNameType = type === LOCALE_SUB_KEYS.name;
	const isOption = rawKey.includes(".options.");

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
				translated = result;
			} else {
				map[lng] = fallbackName;
				continue;
			}
		} else {
			if (isOption) {
				const result = t(basePath, { lng: lang });
				if (isValidTranslation(result, basePath)) {
					translated = result;
				}
			} else {
				const descPath = `${basePath}.description`;
				const res = t(descPath, { lng: lang });
				if (isValidTranslation(res, descPath)) {
					translated = res;
				}
			}
		}

		if (!translated) continue;

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

export function getSupportedLanguages(): string[] {
	return ((i18next.options.supportedLngs as string[]) || []).filter((l) => l !== "cimode");
}

const buildPath = (path: string[]) =>
	path.length > 1 ? `${path[0]}:${path.slice(1).join(".")}` : path[0] || "";

const createProxy = (path: string[] = []): any =>
	new Proxy(() => {}, {
		get: (_, prop) => {
			if (prop === "toString" || prop === Symbol.toPrimitive) return () => buildPath(path);
			if (typeof prop !== "string" || prop === "then") return undefined;
			return createProxy([...path, prop]);
		},
		apply: () => buildPath(path),
	});

export const I18N = createProxy() as I18nResourceSchema;
