import { I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { EmbedLinks, ReadMessageHistory, SendMessages, ViewChannel } from "../../utils/Permissions";

export default class MoveNode extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "movenode",
			description: {
				content: I18N.commands.movenode.description,
				examples: ["movenode", "movenode node2"],
				usage: "movenode [nodeId]",
			},
			category: "dev",
			aliases: ["mn"],
			cooldown: 3,
			args: false,
			vote: false,
			player: {
				voice: false,
				dj: false,
				active: true,
				djPerm: null,
			},
			permissions: {
				dev: true,
				client: [SendMessages, ReadMessageHistory, ViewChannel, EmbedLinks],
				user: [],
			},
			slashCommand: true,
			options: [
				{
					name: "node",
					description: I18N.commands.movenode.options.node,
					type: 3,
					required: false,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		let nodeId: string | undefined;
		if (args.length > 0) {
			nodeId = args.join(" ");
		} else if (ctx.options && typeof ctx.options.get === "function") {
			const nodeOption = ctx.options.get("node", false);
			nodeId = nodeOption?.value as string | undefined;
		} else {
			nodeId = undefined;
		}
		const allPlayers = client.manager.players;
		if (allPlayers.size === 0) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.movenode.messages.no_players),
						color: this.client.color.red,
					},
				],
			});
		}
		const currentNodeId =
			allPlayers.size > 0 ? allPlayers.values().next().value?.node.options.id : null;

		if (!nodeId) {
			const availableNodes = client.manager.nodeManager.nodes
				.filter((node) => node.connected && node.options.id !== currentNodeId)
				.map((node) => node.options.id);

			if (availableNodes.length === 0) {
				return await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.movenode.messages.no_available_nodes),
							color: this.client.color.red,
						},
					],
				});
			}

			const currentNodeText = currentNodeId
				? `**${ctx.locale(I18N.commands.movenode.messages.current_node)}:** ${currentNodeId}`
				: "";
			const availableNodesList = availableNodes.map((id) => `• ${id}`).join("\n");
			const availableNodesText = `**${ctx.locale(I18N.commands.movenode.messages.available_nodes)}:**\n${availableNodesList}`;

			return await ctx.sendMessage({
				embeds: [
					{
						title: ctx.locale(I18N.commands.movenode.messages.available_nodes_title),
						description: `${currentNodeText}\n\n${availableNodesText}`,
						color: this.client.color.main,
						footer: {
							text: ctx.locale(I18N.commands.movenode.messages.usage_hint),
						},
					},
				],
			});
		}

		const targetNode = client.manager.nodeManager.nodes.get(nodeId);
		if (!targetNode) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.movenode.messages.node_not_found, {
							node: nodeId,
						}),
						color: this.client.color.red,
					},
				],
			});
		}

		if (!targetNode.connected) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.movenode.messages.node_not_connected, {
							node: nodeId,
						}),
						color: this.client.color.red,
					},
				],
			});
		}

		const allOnTarget = Array.from(allPlayers.values()).every(
			(player) => player.node.options.id === nodeId,
		);
		if (allOnTarget) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale(I18N.commands.movenode.messages.same_node, { node: nodeId }),
						color: this.client.color.red,
					},
				],
			});
		}

		try {
			if (ctx.interaction && !ctx.interaction.replied && !ctx.interaction.deferred) {
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.movenode.messages.moving_all_players, {
								node: nodeId,
							}),
							color: this.client.color.main,
						},
					],
				});
			}

			const results: {
				guildId: string;
				from: string;
				to: string;
				error?: string;
			}[] = [];
			for (const player of allPlayers.values()) {
				if (player.node.options.id === nodeId) continue;
				const fromNodeId = player.node.options.id ?? "unknown";
				try {
					await player.moveNode(nodeId);
					results.push({
						guildId: player.guildId,
						from: fromNodeId,
						to: nodeId,
					});
				} catch (err) {
					results.push({
						guildId: player.guildId,
						from: fromNodeId,
						to: nodeId,
						error: err instanceof Error ? err.message : String(err),
					});
				}
			}

			const successMoves = results.filter((r) => !r.error);
			const failedMoves = results.filter((r) => r.error);

			let description = "";
			if (successMoves.length > 0) {
				description += `${ctx.locale(I18N.commands.movenode.messages.moved_players, {
					list: successMoves
						.map((r) =>
							ctx.locale(I18N.commands.movenode.messages.guild_move, {
								guildId: r.guildId,
								from: r.from,
								to: r.to,
							}),
						)
						.join("\n"),
				})}\n`;
			}
			if (failedMoves.length > 0) {
				description +=
					"\n" +
					ctx.locale(I18N.commands.movenode.messages.failed_moves, {
						list: failedMoves
							.map((r) =>
								ctx.locale(I18N.commands.movenode.messages.guild_move_failed, {
									guildId: r.guildId,
									error: r.error,
								}),
							)
							.join("\n"),
					});
			}
			if (description === "") {
				description = ctx.locale(I18N.commands.movenode.messages.no_players_moved);
			}

			const resultTitle = ctx.locale(I18N.commands.movenode.messages.results_title);
			const resultColor = failedMoves.length > 0 ? this.client.color.red : this.client.color.green;
			const resultTimestamp = new Date().toISOString();

			if (ctx.interaction && (ctx.interaction.replied || ctx.interaction.deferred)) {
				await ctx.editMessage({
					embeds: [
						{
							title: resultTitle,
							description,
							color: resultColor,
							timestamp: resultTimestamp,
						},
					],
				});
			} else {
				await ctx.sendMessage({
					embeds: [
						{
							title: resultTitle,
							description,
							color: resultColor,
							timestamp: resultTimestamp,
						},
					],
				});
			}
			return;
		} catch (error) {
			logger.error("Failed to move player nodes:", error);

			if (ctx.interaction && (ctx.interaction.replied || ctx.interaction.deferred)) {
				await ctx.editMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.movenode.messages.error, {
								error:
									error instanceof Error
										? error.message
										: ctx.locale(I18N.commands.movenode.messages.unknown_error),
							}),
							color: this.client.color.red,
						},
					],
				});
			} else {
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale(I18N.commands.movenode.messages.error, {
								error:
									error instanceof Error
										? error.message
										: ctx.locale(I18N.commands.movenode.messages.unknown_error),
							}),
							color: this.client.color.red,
						},
					],
				});
			}
			return;
		}
	}
}
