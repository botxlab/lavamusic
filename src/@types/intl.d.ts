/**
 * Official TypeScript definitions for Intl.DurationFormat are missing.
 *
 * {@link https://github.com/microsoft/TypeScript#60608}
 */

import type {
	DurationFormatOptions as _DurationFormatOptions,
	DurationInput as _DurationInput,
	DurationFormatConstructor,
} from "@formatjs/intl-durationformat/src/types";

declare global {
	namespace Intl {
		const DurationFormat: DurationFormatConstructor;
		type DurationFormatOptions = _DurationFormatOptions;
		type DurationInput = _DurationInput;
	}
}
