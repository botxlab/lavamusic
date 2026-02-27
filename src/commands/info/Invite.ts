import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Invite extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "invite",
			description: {
				content: I18N.commands.invite.description,
				examples: ["invite"],
				usage: "invite",
			},
			category: "info",
			aliases: ["iv"],
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
		const embed = this.client.embed();
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel(ctx.locale(I18N.buttons.invite))
				.setStyle(ButtonStyle.Link)
				.setURL(
					`https://discord.com/api/oauth2/authorize?client_id=${client.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`,
				),
			new ButtonBuilder()
				.setLabel(ctx.locale(I18N.buttons.support))
				.setStyle(ButtonStyle.Link)
				.setURL("https://discord.gg/YQsGbTwPBx"),
		);
		return await ctx.sendMessage({
			embeds: [
				embed
					.setColor(this.client.color.main)
					.setDescription(ctx.locale(I18N.commands.invite.content)),
			],
			components: [row],
		});
	}
}
