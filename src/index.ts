import { launch } from "./LavaClient";
import { start } from "./shard";
import logger from "./structures/Logger";
import { LAVAMUSIC_BANNER } from "./utils/LavaLogo";
import { ThemeSelector } from "./utils/ThemeSelector";

const theme = new ThemeSelector();

/**
 * Sets the console window title.
 * @param title - The new title for the console window.
 */
function setConsoleTitle(title: string): void {
	// Write the escape sequence to change the console title
	process.stdout.write(`\x1b]0;${title}\x07`);
}

// Determine if this process is a Shard or the Manager
if (process.env.SHARDING_MANAGER) {
	// Child process (Shard)
	launch().catch((err) => {
		logger.error("[CLIENT] Critical error in shard:", err);
		process.exit(1);
	});
} else {
	// Main process (Manager)
	try {
		console.clear();
		setConsoleTitle("Lavamusic");
		console.log(theme.purpleNeon(LAVAMUSIC_BANNER));
		start();
	} catch (err) {
		logger.error("[MANAGER] An error has occurred:", err);
	}
}
