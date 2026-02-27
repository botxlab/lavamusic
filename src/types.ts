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
