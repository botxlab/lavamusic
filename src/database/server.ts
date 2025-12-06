import { eq, and } from "drizzle-orm";
import { db } from "./index";
import { guild, stay, setup, dj, role, playlist } from "./schemas";
import { env } from "../env";
import { randomUUID } from "crypto";

export default class ServerData {
	// -----------------------------
	// Guild
	// -----------------------------
	public async get(guildId: string) {
		const result = await db.select().from(guild).where(eq(guild.guildId, guildId));

		if (result.length > 0) return result[0];

		return this.createGuild(guildId);
	}

	private async createGuild(guildId: string) {
		// Use onConflictDoNothing to prevent duplicate key errors
		await db.insert(guild).values({
			guildId,
			prefix: env.PREFIX,
			language: env.DEFAULT_LANGUAGE,
		}).onConflictDoNothing();

		return (await db.select().from(guild).where(eq(guild.guildId, guildId)))[0];
	}

	public async setPrefix(guildId: string, prefix: string) {
		// First ensure the guild exists
		await this.get(guildId);

		await db.update(guild)
			.set({ prefix })
			.where(eq(guild.guildId, guildId));
	}

	public async getPrefix(guildId: string) {
		const g = await this.get(guildId);
		return g?.prefix ?? env.PREFIX;
	}

	public async updateLanguage(guildId: string, language: string) {
		// First ensure the guild exists
		await this.get(guildId);

		await db.update(guild)
			.set({ language })
			.where(eq(guild.guildId, guildId));
	}

	public async getLanguage(guildId: string) {
		const g = await this.get(guildId);
		return g?.language ?? env.DEFAULT_LANGUAGE;
	}

	// -----------------------------
	// Setup
	// -----------------------------
	public async getSetup(guildId: string) {
		const r = await db.select().from(setup).where(eq(setup.guildId, guildId));
		return r[0] ?? null;
	}

	public async setSetup(guildId: string, textId: string, messageId: string) {
		// First ensure the guild exists
		await this.get(guildId);

		const existing = await this.getSetup(guildId);

		if (existing) {
			await db.update(setup)
				.set({ textId, messageId })
				.where(eq(setup.guildId, guildId));
		} else {
			await db.insert(setup).values({
				guildId,
				textId,
				messageId
			});
		}
	}

	public async deleteSetup(guildId: string) {
		await db.delete(setup).where(eq(setup.guildId, guildId));
	}

	// -----------------------------
	// 24/7 Stay
	// -----------------------------
	public async set_247(guildId: string, textId: string, voiceId: string) {
		// First ensure the guild exists
		await this.get(guildId);

		const existing = await this.get_247(guildId);

		if (existing) {
			await db.update(stay)
				.set({ textId, voiceId })
				.where(eq(stay.guildId, guildId));
		} else {
			await db.insert(stay).values({
				guildId,
				textId,
				voiceId
			});
		}
	}

	public async delete_247(guildId: string) {
		await db.delete(stay).where(eq(stay.guildId, guildId));
	}

	public async get_247(guildId?: string) {
		if (guildId) {
			const r = await db.select().from(stay).where(eq(stay.guildId, guildId));
			return r[0] ?? null;
		}
		return await db.select().from(stay);
	}

	// -----------------------------
	// DJ Mode
	// -----------------------------
	public async setDj(guildId: string, mode: boolean) {
		// First ensure the guild exists
		await this.get(guildId);

		const existing = await this.getDj(guildId);

		if (existing) {
			await db.update(dj)
				.set({ mode: mode ? 1 : 0 })
				.where(eq(dj.guildId, guildId));
		} else {
			await db.insert(dj).values({
				guildId,
				mode: mode ? 1 : 0
			});
		}
	}

	public async getDj(guildId: string) {
		const r = await db.select().from(dj).where(eq(dj.guildId, guildId));
		return r[0] ?? null;
	}

	// -----------------------------
	// Roles
	// -----------------------------
	public async getRoles(guildId: string) {
		return await db.select().from(role).where(eq(role.guildId, guildId));
	}

	public async addRole(guildId: string, roleId: string) {
		// First ensure the guild exists
		await this.get(guildId);

		// Use onConflictDoNothing to prevent duplicate role errors
		await db.insert(role).values({
			guildId,
			roleId
		}).onConflictDoNothing();
	}

	public async removeRole(guildId: string, roleId: string) {
		await db.delete(role)
			.where(and(eq(role.guildId, guildId), eq(role.roleId, roleId)));
	}

	public async clearRoles(guildId: string) {
		await db.delete(role).where(eq(role.guildId, guildId));
	}

	// -----------------------------
	// Playlists
	// -----------------------------
	public async getPlaylist(userId: string, name: string) {
		const r = await db.select().from(playlist)
			.where(and(eq(playlist.userId, userId), eq(playlist.name, name)));

		return r[0] ?? null;
	}

	public async getUserPlaylists(userId: string) {
		return await db.select().from(playlist).where(eq(playlist.userId, userId));
	}

	public async createPlaylist(userId: string, name: string) {
		await db.insert(playlist).values({
			id: randomUUID(),
			userId,
			name,
			tracks: JSON.stringify([])
		}).onConflictDoNothing();
	}

	public async createPlaylistWithTracks(userId: string, name: string, tracks: string[]) {
		await db.insert(playlist).values({
			id: randomUUID(),
			userId,
			name,
			tracks: JSON.stringify(tracks)
		}).onConflictDoNothing();
	}

	public async deletePlaylist(userId: string, name: string) {
		await db.delete(playlist)
			.where(and(eq(playlist.userId, userId), eq(playlist.name, name)));
	}

	public async deleteSongsFromPlaylist(userId: string, playlistName: string) {
		await db.update(playlist)
			.set({ tracks: JSON.stringify([]) })
			.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
	}

	public async addTracksToPlaylist(userId: string, playlistName: string, tracks: string[]) {
		const p = await this.getPlaylist(userId, playlistName);

		if (!p) {
			await this.createPlaylistWithTracks(userId, playlistName, tracks);
			return;
		}

		const existing = p.tracks ? JSON.parse(p.tracks) : [];
		const updated = [...existing, ...tracks];

		await db.update(playlist)
			.set({ tracks: JSON.stringify(updated) })
			.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
	}

	public async removeSong(userId: string, playlistName: string, encodedSong: string) {
		const p = await this.getPlaylist(userId, playlistName);
		if (!p) return;

		const tracks: string[] = JSON.parse(p.tracks ?? "[]");

		const idx = tracks.indexOf(encodedSong);
		if (idx !== -1) tracks.splice(idx, 1);

		await db.update(playlist)
			.set({ tracks: JSON.stringify(tracks) })
			.where(and(eq(playlist.userId, userId), eq(playlist.name, playlistName)));
	}

	public async getTracksFromPlaylist(userId: string, playlistName: string) {
		const p = await this.getPlaylist(userId, playlistName);
		if (!p) return null;

		return JSON.parse(p.tracks ?? "[]");
	}
}