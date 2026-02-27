import util from "node:util";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { fetch } from "undici";
import { env } from "../../env";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Eval extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "eval",
			description: {
				content: I18N.dev.eval.description,
				examples: ["eval"],
				usage: "eval",
			},
			category: "dev",
			aliases: ["ev"],
			cooldown: 3,
			args: true,
			player: {
				voice: false,
				dj: false,
				active: false,
				djPerm: null,
			},
			permissions: {
				dev: true,
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks],
				user: [],
			},
			slashCommand: false,
			options: [],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const code = args.join(" ");
		try {
			// biome-ignore lint/security/noGlobalEval: explanation
			let evaled = eval(code);
			if (evaled === client.config) evaled = "Nice try";

			if (typeof evaled !== "string") {
				evaled = util.inspect(evaled, { depth: 1 });
			}

			// Redact common secrets
			const secrets = [client.token, env.TOKEN];
			for (const secret of secrets.filter(Boolean)) {
				evaled = evaled.replaceAll(secret!, "[REDACTED]");
			}

			if (evaled.length > 2000) {
				const response = await fetch("https://hasteb.in/post", {
					method: "POST",
					headers: {
						"Content-Type": "text/plain",
					},
					body: evaled,
				});
				const json: any = await response.json();
				evaled = `https://hasteb.in/${json.key}`;
				return await ctx.sendMessage({
					content: evaled,
				});
			}

			const button = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel("Delete")
				.setCustomId("eval-delete");
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

			const msg = await ctx.sendMessage({
				content: `\`\`\`js\n${evaled}\n\`\`\``,
				components: [row],
			});

			const filter = (i: any) => i.customId === "eval-delete" && i.user.id === ctx.author?.id;
			const collector = msg.createMessageComponentCollector({
				time: 60000,
				filter: filter,
			});

			collector.on("collect", async (i) => {
				await i.deferUpdate();
				await msg.delete();
			});
		} catch (e) {
			await ctx.sendMessage(`\`\`\`js\n${e}\n\`\`\``);
		}
	}
}
