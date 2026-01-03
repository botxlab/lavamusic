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

try {
	console.clear();
	// Set a custom title for the console window
	setConsoleTitle("Lavamusic");
	console.log(theme.purpleNeon(LAVAMUSIC_BANNER));
	start();
} catch (err) {
	logger.error("[CLIENT] An error has occurred:", err);
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
