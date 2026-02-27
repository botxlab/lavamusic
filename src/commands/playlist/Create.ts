import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class CreatePlaylist extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "create",
			description: {
				content: I18N.commands.create.description,
				examples: ["create <name>"],
				usage: "create <name>",
			},
			category: "playlist",
			aliases: ["cre"],
			cooldown: 3,
			args: true,
			vote: true,
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
			options: [
				{
					name: "name",
					description: I18N.commands.create.options.name,
					type: 3,
					required: true,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const name = args.join(" ").trim();
		const embed = this.client.embed();
		const normalizedName = name.toLowerCase();

		if (!name.length) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setDescription(ctx.locale(I18N.commands.create.messages.name_empty))
						.setColor(this.client.color.red),
				],
			});
		}

		if (name.length > 50) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setDescription(ctx.locale(I18N.commands.create.messages.name_too_long))
						.setColor(this.client.color.red),
				],
			});
		}

		const playlistExists = await client.db.getPlaylist(ctx.author?.id ?? "", normalizedName);
		if (playlistExists) {
			return await ctx.sendMessage({
				embeds: [
					embed
						.setDescription(ctx.locale(I18N.commands.create.messages.playlist_exists))
						.setColor(this.client.color.red),
				],
			});
		}

		try {
			await client.db.createPlaylist(ctx.author?.id ?? "", normalizedName);
		} catch (error) {
			console.error(error);
		}
		return await ctx.sendMessage({
			embeds: [
				embed
					.setDescription(
						ctx.locale(I18N.commands.create.messages.playlist_created, {
							name,
						}),
					)
					.setColor(this.client.color.green),
			],
		});
	}
}
