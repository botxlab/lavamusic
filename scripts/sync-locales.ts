import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import logger from "../src/structures/Logger";

const LOCALES_DIR = join(import.meta.dir, "..", "locales");
const BASE_LANG = "en-US";
const LOG_PREFIX = "🔄 [SYNC]";

function syncObjects(base: any, target: any): { updated: any; changes: number } {
	let changes = 0;
	const updated = { ...target };

	for (const key in base) {
		const baseValue = base[key];
		const targetValue = target[key];

		if (targetValue === undefined) {
			// Missing key: add
			updated[key] = baseValue; // `__MISSING: ${baseValue}`
			changes++;
		} else if (
			typeof baseValue === "object" &&
			baseValue !== null &&
			typeof targetValue === "object" &&
			targetValue !== null
		) {
			const result = syncObjects(baseValue, targetValue);
			updated[key] = result.updated;
			changes += result.changes;
		}
	}

	// Cleanup target keys if unknown on base
	/* 
    for (const key in target) {
        if (!(key in base)) {
            delete updated[key];
            changes++;
        }
    }
    */

	return { updated, changes };
}

function runSync() {
	logger.info(`${LOG_PREFIX} Starting synchronization using base: ${BASE_LANG}`);

	const baseDir = join(LOCALES_DIR, BASE_LANG);
	const languages = readdirSync(LOCALES_DIR).filter(
		(f) => f !== BASE_LANG && statSync(join(LOCALES_DIR, f)).isDirectory(),
	);

	const namespaces = readdirSync(baseDir).filter((f) => f.endsWith(".json"));

	for (const lang of languages) {
		let totalChanges = 0;
		logger.info(`${LOG_PREFIX} Processing language: ${lang}`);
		const targetDir = join(LOCALES_DIR, lang);

		if (!existsSync(targetDir)) mkdirSync(targetDir);

		for (const file of namespaces) {
			const BasePath = join(baseDir, file);
			const TargetPath = join(targetDir, file);

			const baseContent = JSON.parse(readFileSync(BasePath, "utf-8"));
			let targetContent = {};

			if (existsSync(TargetPath)) {
				try {
					targetContent = JSON.parse(readFileSync(TargetPath, "utf-8"));
				} catch {
					logger.error(`❌ Error parsing ${lang}/${file}. Using empty object.`);
				}
			} else {
				logger.info(`   ➕ Created new file: ${file}`);
			}

			const { updated, changes } = syncObjects(baseContent, targetContent);

			if (changes > 0) {
				writeFileSync(TargetPath, JSON.stringify(updated, null, "\t"));
				logger.info(`   ✏️  Updated ${file}: ${changes} keys added/restored.`);
				totalChanges += changes;
			}
		}

		if (totalChanges === 0) logger.success(`   ✅ Up to date.`);
	}

	logger.star(`\n✨ Synchronization complete.`);
}

runSync();
