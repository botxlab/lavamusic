import { ChannelType, type GuildMember, PermissionFlagsBits, type VoiceState } from "discord.js";
import { Event, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { LavamusicEventType } from "../../types/events";
export default class VoiceStateUpdate extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			type: LavamusicEventType.Client,
			name: "voiceStateUpdate",
		});
	}

	private delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

	public async run(oldState: VoiceState, newState: VoiceState): Promise<void> {
		const guildId = newState.guild.id;
		if (!guildId) return;

		const player = this.client.manager.getPlayer(guildId);
		if (!player) return;

		if (!player.voiceChannelId) return;

		const is247 = await this.client.db.get_247(guildId);

		const botMember = await newState.guild.members.fetch(this.client.user!.id).catch(() => null);
		const botVoiceChannelId =
			newState.guild.voiceStates.cache.get(this.client.user!.id)?.channelId ??
			newState.guild.members.me?.voice?.channelId ??
			botMember?.voice?.channelId;

		if (newState.id === this.client.user!.id && oldState.channelId && !newState.channelId) {
			if (!is247) {
				try {
					await player.destroy();
				} catch (err) {
					logger?.error?.("destroy() on bot leave failed", err);
				}
			}
			return;
		}

		if (botMember !== null && !botVoiceChannelId && !is247 && player) {
			try {
				await player.destroy();
			} catch (err) {
				logger?.error?.("destroy() when bot not in VC failed", err);
			}
			return;
		}

		let type: "join" | "leave" | "move" | null = null;

		if (!oldState.channelId && newState.channelId) {
			type = "join";
		} else if (oldState.channelId && !newState.channelId) {
			type = "leave";
		} else if (
			oldState.channelId &&
			newState.channelId &&
			oldState.channelId !== newState.channelId
		) {
			type = "move";
		}

		try {
			if (newState.id === this.client.user!.id) {
				await this.handleSelfState(oldState, newState, this.client);
			}

			if (type === "join") {
				await this.handleJoin(newState, this.client);
			} else if (type === "leave") {
				await this.handleLeave(newState, this.client);
			} else if (type === "move") {
				await this.handleMove(newState, this.client);
			}
		} catch (err) {
			logger?.error?.("VoiceStateUpdate handler error", err);
		}
	}

	private async handleSelfState(
		oldState: VoiceState,
		newState: VoiceState,
		client: Lavamusic,
	): Promise<void> {
		const player = client.manager.getPlayer(newState.guild.id);
		if (!player) return;

		if (newState.serverMute !== oldState.serverMute) {
			try {
				if (newState.serverMute && !player.paused) {
					await player.pause();
				} else if (!newState.serverMute && player.paused) {
					await player.resume();
				}
			} catch (err) {
				logger?.error?.("pause/resume on serverMute toggle failed", err);
			}
		}

		if (newState.serverDeaf !== oldState.serverDeaf && !newState.serverDeaf) {
			const vc = await newState.guild.channels.fetch(player.voiceChannelId!).catch(() => null);
			if (vc && "members" in vc) {
				const botMember = await newState.guild.members.fetch(client.user!.id).catch(() => null);
				if (botMember) {
					const permissions = vc.permissionsFor(botMember);
					if (permissions?.has(PermissionFlagsBits.DeafenMembers)) {
						try {
							await newState.setDeaf(true);
						} catch (err) {
							logger?.warn?.("setDeaf(true) failed", err);
						}
					}
				}
			}
		}
	}

	private async handleJoin(newState: VoiceState, client: Lavamusic): Promise<void> {
		await this.delay(3000);
		const bot = newState.guild.voiceStates.cache.get(client.user!.id);
		if (!bot) return;
		if (bot.channelId && bot.channel?.type === ChannelType.GuildStageVoice && bot.suppress) {
			if (
				bot.channel &&
				bot.member &&
				bot.channel.permissionsFor(bot.member!).has(PermissionFlagsBits.MuteMembers)
			) {
				try {
					await bot.setSuppressed(false);
				} catch (err) {
					logger?.warn?.("setSuppressed(false) failed", err);
				}
			}
		}

		const player = client.manager.getPlayer(newState.guild.id);
		if (!player) return;

		if (!player?.voiceChannelId) return;

		const vc = await newState.guild.channels.fetch(player.voiceChannelId).catch(() => null);
		if (!vc || !("members" in vc)) return;

		if (newState.id === client.user?.id && !newState.serverDeaf) {
			const botMember = await newState.guild.members.fetch(client.user!.id).catch(() => null);
			if (botMember) {
				const permissions = vc.permissionsFor(botMember);
				if (permissions?.has(PermissionFlagsBits.DeafenMembers)) {
					try {
						await newState.setDeaf(true);
					} catch (err) {
						logger?.warn?.("setDeaf(true) on join failed", err);
					}
				}
			}
		}
	}

	private async handleLeave(newState: VoiceState, client: Lavamusic): Promise<void> {
		const player = client.manager.getPlayer(newState.guild.id);
		if (!player) return;
		if (!player?.voiceChannelId) return;

		const is247 = await client.db.get_247(newState.guild.id);
		const vc = await newState.guild.channels.fetch(player.voiceChannelId).catch(() => null);
		if (!vc || !("members" in vc)) return;

		if (
			vc.members instanceof Map &&
			Array.from(vc.members.values()).filter((m: GuildMember) => !m.user.bot).length === 0
		) {
			setTimeout(async () => {
				const latestPlayer = client.manager.getPlayer(newState.guild.id);
				if (!latestPlayer?.voiceChannelId) return;
				const ch = await newState.guild.channels
					.fetch(latestPlayer.voiceChannelId)
					.catch(() => null);
				if (
					ch &&
					"members" in ch &&
					ch.members instanceof Map &&
					Array.from(ch.members.values()).filter((m: GuildMember) => !m.user.bot).length === 0
				) {
					if (!is247) {
						try {
							await latestPlayer.destroy();
						} catch (err) {
							logger?.error?.("destroy() after 5s no-listeners failed", err);
						}
					}
				}
			}, 5000);
		}
	}

	private async handleMove(newState: VoiceState, client: Lavamusic): Promise<void> {
		await this.delay(3000);
		const bot = newState.guild.voiceStates.cache.get(client.user!.id);
		if (!bot) return;
		if (bot.channelId && bot.channel?.type === ChannelType.GuildStageVoice && bot.suppress) {
			if (
				bot.channel &&
				bot.member &&
				bot.channel.permissionsFor(bot.member!).has(PermissionFlagsBits.MuteMembers)
			) {
				try {
					await bot.setSuppressed(false);
				} catch (err) {
					logger?.warn?.("setSuppressed(false) failed", err);
				}
			}
		}
	}
}
