import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import {
	EmbedLinks,
	ManageGuild,
	ReadMessageHistory,
	SendMessages,
	ViewChannel,
} from "../../utils/Permissions";

export default class Dj extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "dj",
			description: {
				content: I18N.commands.dj.description,
				examples: ["dj add @role", "dj remove @role", "dj clear", "dj toggle"],
				usage: "dj",
			},
			category: "general",
			aliases: ["dj"],
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
				user: [ManageGuild],
			},
			slashCommand: true,
			options: [
				{
					name: "add",
					description: I18N.commands.dj.options.add,
					type: 1,
					options: [
						{
							name: "role",
							description: I18N.commands.dj.options.role,
							type: 8,
							required: true,
						},
					],
				},
				{
					name: "remove",
					description: I18N.commands.dj.options.remove,
					type: 1,
					options: [
						{
							name: "role",
							description: I18N.commands.dj.options.role,
							type: 8,
							required: true,
						},
					],
				},
				{
					name: "clear",
					description: I18N.commands.dj.options.clear,
					type: 1,
				},
				{
					name: "toggle",
					description: I18N.commands.dj.options.toggle,
					type: 1,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const embed = this.client.embed().setColor(this.client.color.main);
		const dj = await client.db.getDj(ctx.guild.id);
		let subCommand: string | undefined;
		let role: any | undefined;

		if (ctx.isInteraction) {
			subCommand = ctx.options.getSubCommand();
			if (subCommand === "add" || subCommand === "remove") {
				role = ctx.options.getRole("role");
			}
		} else {
			subCommand = args[0];
			role = ctx.message?.mentions.roles.first() || ctx.guild?.roles.cache.get(args[1]);
		}

		switch (subCommand) {
			case "add": {
				if (!role) {
					return ctx.sendMessage({
						embeds: [embed.setDescription(ctx.locale(I18N.commands.dj.errors.provide_role))],
					});
				}
				if (
					await client.db.getRoles(ctx.guild.id).then((r) => r.some((re) => re.roleId === role.id))
				) {
					return ctx.sendMessage({
						embeds: [
							embed.setDescription(
								ctx.locale(I18N.commands.dj.messages.role_exists, {
									roleId: role.id,
								}),
							),
						],
					});
				}
				await client.db.addRole(ctx.guild.id, role.id);
				await client.db.setDj(ctx.guild.id, true);
				return ctx.sendMessage({
					embeds: [
						embed.setDescription(
							ctx.locale(I18N.commands.dj.messages.role_added, {
								roleId: role.id,
							}),
						),
					],
				});
			}

			case "remove": {
				if (!role) {
					return ctx.sendMessage({
						embeds: [embed.setDescription(ctx.locale(I18N.commands.dj.errors.provide_role))],
					});
				}
				if (
					!(await client.db
						.getRoles(ctx.guild.id)
						.then((r) => r.some((re) => re.roleId === role.id)))
				) {
					return ctx.sendMessage({
						embeds: [
							embed.setDescription(
								ctx.locale(I18N.commands.dj.messages.role_not_found, {
									roleId: role.id,
								}),
							),
						],
					});
				}
				await client.db.removeRole(ctx.guild.id, role.id);
				return ctx.sendMessage({
					embeds: [
						embed.setDescription(
							ctx.locale(I18N.commands.dj.messages.role_removed, {
								roleId: role.id,
							}),
						),
					],
				});
			}

			case "clear": {
				if (!dj) {
					return ctx.sendMessage({
						embeds: [embed.setDescription(ctx.locale(I18N.commands.dj.errors.no_roles))],
					});
				}
				await client.db.clearRoles(ctx.guild.id);
				return ctx.sendMessage({
					embeds: [embed.setDescription(ctx.locale(I18N.commands.dj.messages.all_roles_cleared))],
				});
			}

			case "toggle": {
				if (!dj) {
					return ctx.sendMessage({
						embeds: [embed.setDescription(ctx.locale(I18N.commands.dj.errors.no_roles))],
					});
				}
				await client.db.setDj(ctx.guild.id, !dj.mode);
				return ctx.sendMessage({
					embeds: [
						embed.setDescription(
							ctx.locale(I18N.commands.dj.messages.toggle, {
								status: dj.mode ? "disabled" : "enabled",
							}),
						),
					],
				});
			}

			default:
				return ctx.sendMessage({
					embeds: [
						embed.setDescription(ctx.locale(I18N.commands.dj.errors.invalid_subcommand)).addFields({
							name: ctx.locale(I18N.commands.dj.subcommands),
							value: "`add`, `remove`, `clear`, `toggle`",
						}),
					],
				});
		}
	}
}
