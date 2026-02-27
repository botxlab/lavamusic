import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class Help extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "help",
			description: {
				content: I18N.commands.help.description,
				examples: ["help"],
				usage: "help",
			},
			category: "info",
			aliases: ["h"],
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
			options: [
				{
					name: "command",
					description: I18N.commands.help.options.command,
					type: 3,
					required: false,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const embed = this.client.embed();
		const guild = await client.db.get(ctx.guild.id);
		const commands = this.client.commands.filter((cmd) => cmd.category !== "dev");
		const categories = [...new Set(commands.map((cmd) => cmd.category))];

		if (args[0]) {
			const command = this.client.commands.get(args[0].toLowerCase());
			if (!command) {
				return await ctx.sendMessage({
					embeds: [
						embed.setColor(this.client.color.red).setDescription(
							ctx.locale(I18N.commands.help.not_found, {
								cmdName: args[0],
							}),
						),
					],
				});
			}
			const helpEmbed = embed
				.setColor(client.color.main)
				.setTitle(`${ctx.locale(I18N.commands.help.title)} - ${command.name}`)
				.setDescription(
					ctx.locale(I18N.commands.help.help_cmd, {
						description: ctx.locale(command.description.content),
						usage: `${guild?.prefix}${command.description.usage}`,
						examples: command.description.examples
							.map((example: string) => `${guild.prefix}${example}`)
							.join(", "),
						aliases: command.aliases.map((alias: string) => `\`${alias}\``).join(", "),
						category: command.category,
						cooldown: command.cooldown,
						premUser:
							(command.permissions.user as string[]).length > 0
								? (command.permissions.user as string[])
										.map((perm: string) => `\`${perm}\``)
										.join(", ")
								: "None",
						premBot: (command.permissions.client as string[])
							.map((perm: string) => `\`${perm}\``)
							.join(", "),
						dev: command.permissions.dev ? "Yes" : "No",
						slash: command.slashCommand ? "Yes" : "No",
						args: command.args ? "Yes" : "No",
						player: command.player.active ? "Yes" : "No",
						dj: command.player.dj ? "Yes" : "No",
						djPerm: command.player.djPerm ? command.player.djPerm : "None",
						voice: command.player.voice ? "Yes" : "No",
					}),
				);
			return await ctx.sendMessage({ embeds: [helpEmbed] });
		}

		const fields = categories.map((category) => ({
			name: category,
			value: commands
				.filter((cmd) => cmd.category === category)
				.map((cmd) => `\`${cmd.name}\``)
				.join(", "),
			inline: false,
		}));

		const helpEmbed = embed
			.setColor(client.color.main)
			.setTitle(ctx.locale(I18N.commands.help.title))
			.setDescription(
				ctx.locale(I18N.commands.help.content, {
					bot: client.user?.username,
					prefix: guild.prefix,
				}),
			)
			.setFooter({
				text: ctx.locale(I18N.commands.help.footer, { prefix: guild.prefix }),
			})
			.addFields(...fields);

		return await ctx.sendMessage({ embeds: [helpEmbed] });
	}
}
