import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class GuildList extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "guildlist",
			description: {
				content: I18N.dev.guilds.list,
				examples: ["guildlist"],
				usage: "guildlist",
			},
			category: "dev",
			aliases: ["glst"],
			cooldown: 3,
			args: false,
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

	public async run(client: Lavamusic, ctx: Context): Promise<any> {
		let allGuilds: { name: string; id: string }[] = [];
		if (client.shard) {
			try {
				const results = await client.shard.broadcastEval<{ name: string; id: string }[]>((c) =>
					c.guilds.cache.map((g) => ({ name: g.name, id: g.id })),
				);
				allGuilds = results.flat();
			} catch {
				allGuilds = client.guilds.cache.map((g) => ({
					name: g.name,
					id: g.id,
				}));
			}
		} else {
			allGuilds = client.guilds.cache.map((g) => ({ name: g.name, id: g.id }));
		}

		const guildList =
			allGuilds.length > 0
				? allGuilds.map((g) => `- **${g.name}** - ${g.id}`)
				: ["No guilds found."];
		const chunks = client.utils.chunk(guildList, 10) || [[]];
		const pages = chunks.map((chunk, index) => {
			return this.client
				.embed()
				.setColor(this.client.color.main)
				.setDescription(chunk.join("\n"))
				.setFooter({ text: `Page ${index + 1} of ${chunks.length}` });
		});
		await client.utils.paginate(client, ctx, pages);
	}
}
