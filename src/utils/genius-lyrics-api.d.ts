module "genius-lyrics-api" {
	interface SearchOptions {
		apiKey: string;
		title: string;
		artist?: string;
		optimizeQuery?: boolean;
	}
	interface Song {
		id: number;
		title: string;
		url: string;
	}
	interface LyricsOptions {
		title: string;
		artist: string;
	}
	interface AlbumArtOptions {
		title: string;
		artist: string;
	}
	interface SongByIdOptions {
		id: number;
		apiKey: string;
	}
	export function search(options: SearchOptions): Promise<Song[]>;
	export function getSong(options: { id: number; apiKey: string }): Promise<Song>;
	export function getLyrics(options: LyricsOptions): Promise<string>;
	export function getAlbumArt(options: AlbumArtOptions): Promise<string>;
	export function getSongById(options: SongByIdOptions): Promise<Song>;
	export function searchSong(options: SearchOptions): Promise<Song[]>;
}
