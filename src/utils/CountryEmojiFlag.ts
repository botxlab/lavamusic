const REGIONAL_INDICATOR_BASE = 0x1f1e6;

const LATIN_CAPITAL_BASE = 0x0041;
const OFFSET = REGIONAL_INDICATOR_BASE - LATIN_CAPITAL_BASE;

const FALLBACK_EMOJI = "🌐";
const ISO_REGION_REGEX = /^[A-Z]{2}$/;

const OVERRIDES: Readonly<Record<string, string>> = {
	"es-419": "🌎",
	da: "DK",
	vi: "VN",
	cs: "CZ",
	el: "GR",
	uk: "UA",
	hi: "IN",
	ja: "JP",
	ko: "KR",
	zh: "CN",
} as const;

const CACHE = new Map<string, string>();
const MAX_CACHE_SIZE = 80;

function getFlag(countryCode: string): string {
	const code = countryCode.toUpperCase();

	if (!ISO_REGION_REGEX.test(code)) return FALLBACK_EMOJI;

	const codePoints = [...code].map((char) => (char.codePointAt(0) ?? 0) + OFFSET);
	return String.fromCodePoint(...codePoints);
}

function parseInput(input: string): string | null {
	const sanitized = input.trim().replace("_", "-").toLowerCase();

	if (OVERRIDES[sanitized]) return OVERRIDES[sanitized];

	try {
		const locale = new Intl.Locale(sanitized).maximize();

		if (locale.region && ISO_REGION_REGEX.test(locale.region.toUpperCase())) {
			return locale.region.toUpperCase();
		}
	} catch {
		const rawCode = sanitized.toUpperCase();
		if (ISO_REGION_REGEX.test(rawCode)) return rawCode;
	}

	return null;
}

export function getEmojiFlag(input: string | null | undefined): string {
	if (!input) return FALLBACK_EMOJI;

	const key = input.trim();
	const cached = CACHE.get(key);
	if (cached) return cached;

	const countryCode = parseInput(key);

	if (!countryCode) return FALLBACK_EMOJI;

	const flag = countryCode.length > 2 ? countryCode : getFlag(countryCode);

	if (CACHE.size >= MAX_CACHE_SIZE) {
		const firstKey = CACHE.keys().next().value;
		if (firstKey !== undefined) CACHE.delete(firstKey);
	}

	CACHE.set(key, flag);

	return flag;
}
