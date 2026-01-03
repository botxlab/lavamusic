/**
 * Base time constants in milliseconds.
 * Used for strict arithmetic calculations throughout the application.
 */
export const SECOND_MS = 1_000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

/**
 * Mapping of time unit abbreviations to their millisecond values.
 *
 * Used primarily by the parser to convert strings like "10m" into numbers.
 */
export const TIME_UNITS_MS = {
	d: DAY_MS,
	h: HOUR_MS,
	m: MINUTE_MS,
	s: SECOND_MS,
} as const;

/**
 * Represents valid time unit suffixes extracted from input strings.
 *
 * Derived directly from the keys of {@link TIME_UNITS_MS}.
 *
 * @example 'd' | 'h' | 'm' | 's'
 */
export type TimeUnit = keyof typeof TIME_UNITS_MS;
