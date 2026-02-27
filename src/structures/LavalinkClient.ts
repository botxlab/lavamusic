import {
	LavalinkManager,
	type LavalinkNodeOptions,
	type SearchPlatform,
	type SearchResult,
} from "lavalink-client";
import { autoPlayFunction, requesterTransformer } from "../utils/functions/player";
import type Lavamusic from "./Lavamusic";

export default class LavalinkClient extends LavalinkManager {
	public client: Lavamusic;
	constructor(client: Lavamusic) {
		super({
			nodes: client.env.NODES as LavalinkNodeOptions[],
			sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
			autoSkip: true,
			client: {
				id: client.env.CLIENT_ID,
				username: "LavaMusic",
			},
			queueOptions: {
				maxPreviousTracks: 25,
			},
			playerOptions: {
				defaultSearchPlatform: client.env.SEARCH_ENGINE,
				onDisconnect: {
					autoReconnect: true,
					destroyPlayer: false,
				},
				requesterTransformer: requesterTransformer,
				onEmptyQueue: {
					autoPlayFunction,
				},
			},
			autoMove: true,
		});
		this.client = client;
	}
	/**
	 * Searches for a song and returns the tracks.
	 * @param query The query to search for.
	 * @param user The user who requested the search.
	 * @param source The source to search in. Defaults to youtube.
	 * @returns An array of tracks that match the query.
	 */
	public async search(
		query: string | { query: string; source?: SearchPlatform },
		user: unknown,
		source?: SearchPlatform,
	): Promise<SearchResult> {
		const node = this.nodeManager.leastUsedNodes()[0];
		return await node.search(typeof query === "string" ? { query, source } : query, user, false);
	}
}
