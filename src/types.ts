export enum SearchEngine {
	YouTube = "ytsearch",
	YouTubeMusic = "ytmsearch",
	Spotify = "spsearch",
	Deezer = "dzsearch",
	Apple = "amsearch",
	SoundCloud = "scsearch",
	Yandex = "ymsearch",
	JioSaavn = "jssearch",
}

export interface Requester {
	id: string;
	username: string;
	discriminator?: string;
	avatarURL?: string;
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
