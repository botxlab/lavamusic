import os from "node:os";
import { version } from "discord.js";
import { showTotalMemory, usagePercent } from "node-system-stats";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Botinfo extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "botinfo",
			description: {
				content: I18N.commands.botinfo.description,
				examples: ["botinfo"],
				usage: "botinfo",
			},
			category: "info",
			aliases: ["bi", "info", "stats", "status"],
			cooldown: 3,
			args: false,
			vote: false,
			player: {
				voice: false,
				dj: false,
				active: false,
				djPerm: null,
			},
			permissions: {
				dev: false,
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks],
				user: [],
			},
			slashCommand: true,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		const osInfo = `${os.type()} ${os.release()}`;
		const osUptime = client.utils.formatTime(os.uptime());
		const osHostname = os.hostname();
		const cpuInfo = `${os.arch()} (${os.cpus().length} cores)`;
		const cpuUsed = (await usagePercent({ coreIndex: 0, sampleMs: 2000 })).percent;
		const memTotal = showTotalMemory(true);
		const memUsed = (process.memoryUsage().rss / 1024 ** 2).toFixed(2);
		const nodeVersion = process.version;
		const discordJsVersion = version;
		const commands = client.commands.size;

		const promises = [
			client.shard?.broadcastEval((client) => client.guilds.cache.size),
			client.shard?.broadcastEval((client) =>
				client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
			),
			client.shard?.broadcastEval((client) => client.channels.cache.size),
		];
		return Promise.all(promises).then(async (results) => {
			const guilds = results[0]?.reduce((acc, guildCount) => acc + guildCount, 0);
			const users = results[1]?.reduce((acc, memberCount) => acc + memberCount, 0);
			const channels = results[2]?.reduce((acc, channelCount) => acc + channelCount, 0);

			const botInfo = ctx.locale(I18N.commands.botinfo.content, {
				osInfo,
				osUptime,
				osHostname,
				cpuInfo,
				cpuUsed,
				memUsed,
				memTotal,
				nodeVersion,
				discordJsVersion,
				guilds,
				channels,
				users,
				commands,
			});

			const embed = this.client.embed().setColor(this.client.color.main).setDescription(botInfo);

			return await ctx.sendMessage({
				embeds: [embed],
			});
		});
	}
}
