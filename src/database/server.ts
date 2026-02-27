import { getDatabase, type IDatabaseProvider } from "./index";

export default class ServerData {
	private provider: IDatabaseProvider | null = null;

	private async getProvider(): Promise<IDatabaseProvider> {
		if (!this.provider) {
			this.provider = await getDatabase();
		}
		return this.provider;
	}

	public async get(guildId: string) {
		const provider = await this.getProvider();
		return provider.guilds.get(guildId);
	}

	public async setPrefix(guildId: string, prefix: string) {
		const provider = await this.getProvider();
		await provider.guilds.setPrefix(guildId, prefix);
	}

	public async getPrefix(guildId: string) {
		const provider = await this.getProvider();
		return provider.guilds.getPrefix(guildId);
	}

	public async updateLanguage(guildId: string, language: string) {
		const provider = await this.getProvider();
		await provider.guilds.updateLanguage(guildId, language);
	}

	public async getLanguage(guildId: string) {
		const provider = await this.getProvider();
		return provider.guilds.getLanguage(guildId);
	}

	public async setDefaultVolume(guildId: string, volume: number) {
		const provider = await this.getProvider();
		await provider.guilds.setDefaultVolume(guildId, volume);
	}

	public async getDefaultVolume(guildId: string): Promise<number> {
		const provider = await this.getProvider();
		return provider.guilds.getDefaultVolume(guildId);
	}

	public async getSetup(guildId: string) {
		const provider = await this.getProvider();
		return provider.setups.get(guildId);
	}

	public async setSetup(guildId: string, textId: string, messageId: string) {
		const provider = await this.getProvider();
		await provider.setups.set(guildId, textId, messageId);
	}

	public async deleteSetup(guildId: string) {
		const provider = await this.getProvider();
		await provider.setups.delete(guildId);
	}

	public async set_247(guildId: string, textId: string, voiceId: string) {
		const provider = await this.getProvider();
		await provider.stays.set(guildId, textId, voiceId);
	}

	public async delete_247(guildId: string) {
		const provider = await this.getProvider();
		await provider.stays.delete(guildId);
	}

	public async get_247(guildId?: string) {
		const provider = await this.getProvider();
		return provider.stays.get(guildId);
	}

	public async setDj(guildId: string, mode: boolean) {
		const provider = await this.getProvider();
		await provider.djs.setMode(guildId, mode);
	}

	public async getDj(guildId: string) {
		const provider = await this.getProvider();
		return provider.djs.get(guildId);
	}

	public async getRoles(guildId: string) {
		const provider = await this.getProvider();
		return provider.roles.getAll(guildId);
	}

	public async addRole(guildId: string, roleId: string) {
		const provider = await this.getProvider();
		await provider.roles.add(guildId, roleId);
	}

	public async removeRole(guildId: string, roleId: string) {
		const provider = await this.getProvider();
		await provider.roles.remove(guildId, roleId);
	}

	public async clearRoles(guildId: string) {
		const provider = await this.getProvider();
		await provider.roles.clear(guildId);
	}

	public async getPlaylist(userId: string, name: string) {
		const provider = await this.getProvider();
		return provider.playlists.get(userId, name);
	}

	public async getUserPlaylists(userId: string) {
		const provider = await this.getProvider();
		return provider.playlists.getUserPlaylists(userId);
	}

	public async createPlaylist(userId: string, name: string) {
		const provider = await this.getProvider();
		await provider.playlists.create(userId, name);
	}

	public async createPlaylistWithTracks(userId: string, name: string, tracks: string[]) {
		const provider = await this.getProvider();
		await provider.playlists.createWithTracks(userId, name, tracks);
	}

	public async deletePlaylist(userId: string, name: string) {
		const provider = await this.getProvider();
		await provider.playlists.delete(userId, name);
	}

	public async deleteSongsFromPlaylist(userId: string, playlistName: string) {
		const provider = await this.getProvider();
		await provider.playlists.clearTracks(userId, playlistName);
	}

	public async addTracksToPlaylist(userId: string, playlistName: string, tracks: string[]) {
		const provider = await this.getProvider();
		await provider.playlists.addTracks(userId, playlistName, tracks);
	}

	public async removeSong(userId: string, playlistName: string, encodedSong: string) {
		const provider = await this.getProvider();
		await provider.playlists.removeTrack(userId, playlistName, encodedSong);
	}

	public async getTracksFromPlaylist(userId: string, playlistName: string) {
		const provider = await this.getProvider();
		return provider.playlists.getTracks(userId, playlistName);
	}
}
