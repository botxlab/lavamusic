import type Lavamusic from "../structures/Lavamusic";

/**
 * Interface defining the structure of a valid Bot Plugin.
 */
export interface BotPlugin {
	name: string;
	version: string;
	author: string;
	description?: string;
	initialize: (client: Lavamusic) => void;
	shutdown?: (client: Lavamusic) => void;
}
