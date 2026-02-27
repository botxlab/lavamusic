import { launch } from "./LavaClient";
import { start } from "./shard";
import logger from "./structures/Logger";
import { LAVAMUSIC_BANNER } from "./utils/LavaLogo";
import { ThemeSelector } from "./utils/ThemeSelector";

const theme = new ThemeSelector();

function setConsoleTitle(title: string): void {
	process.stdout.write(`\x1b]0;${title}\x07`);
}

if (process.env.SHARDING_MANAGER) {
	launch().catch((err) => {
		logger.error("[CLIENT] Critical error in shard:", err);
		process.exit(1);
	});
} else {
	try {
		console.clear();
		setConsoleTitle("Lavamusic");
		console.log(theme.purpleNeon(LAVAMUSIC_BANNER));
		start();
	} catch (err) {
		logger.error("[MANAGER] An error has occurred:", err);
	}
}
