/** biome-ignore-all lint/style/useTemplate: explanation */
import { Command, type Context, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";

export default class MoveNode extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "movenode",
			description: {
				content: "cmd.movenode.description",
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
				client: [
					"SendMessages",
					"ReadMessageHistory",
					"ViewChannel",
					"EmbedLinks",
				],
				user: [],
			},
			slashCommand: true,
			options: [
				{
					name: "node",
					description: "cmd.movenode.options.node",
					type: 3,
					required: false,
				},
			],
		});
	}

	public async run(
		client: Lavamusic,
		ctx: Context,
		args: string[],
	): Promise<any> {
		// If no node specified, show available nodes as before
		let nodeId: string | undefined;
		if (args.length > 0) {
			nodeId = args.join(" ");
		} else if (ctx.options && typeof ctx.options.get === "function") {
			const nodeOption = ctx.options.get("node", /* required */ false);
			nodeId = nodeOption?.value as string | undefined;
		} else {
			nodeId = undefined;
		}
		const allPlayers = client.manager.players;
		if (allPlayers.size === 0) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale("cmd.movenode.no_players"),
						color: this.client.color.red,
					},
				],
			});
		}
		const currentNodeId =
			allPlayers.size > 0
				? allPlayers.values().next().value?.node.options.id
				: null;

		if (!nodeId) {
			const availableNodes = client.manager.nodeManager.nodes
				.filter((node) => node.connected && node.options.id !== currentNodeId)
				.map((node) => node.options.id);

			if (availableNodes.length === 0) {
				return await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale("cmd.movenode.no_available_nodes"),
							color: this.client.color.red,
						},
					],
				});
			}

			const currentNodeText = currentNodeId
				? `**${ctx.locale("cmd.movenode.current_node")}:** ${currentNodeId}`
				: "";
			const availableNodesList = availableNodes
				.map((id) => `• ${id}`)
				.join("\n");
			const availableNodesText = `**${ctx.locale("cmd.movenode.available_nodes")}:**\n${availableNodesList}`;

			return await ctx.sendMessage({
				embeds: [
					{
						title: ctx.locale("cmd.movenode.available_nodes_title"),
						description: `${currentNodeText}\n\n${availableNodesText}`,
						color: this.client.color.main,
						footer: {
							text: ctx.locale("cmd.movenode.usage_hint"),
						},
					},
				],
			});
		}

		// Validate the target node exists and is connected
		const targetNode = client.manager.nodeManager.nodes.get(nodeId);
		if (!targetNode) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale("cmd.movenode.node_not_found", {
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
						description: ctx.locale("cmd.movenode.node_not_connected", {
							node: nodeId,
						}),
						color: this.client.color.red,
					},
				],
			});
		}

		// If all players are already on the target node
		const allOnTarget = Array.from(allPlayers.values()).every(
			(player) => player.node.options.id === nodeId,
		);
		if (allOnTarget) {
			return await ctx.sendMessage({
				embeds: [
					{
						description: ctx.locale("cmd.movenode.same_node", { node: nodeId }),
						color: this.client.color.red,
					},
				],
			});
		}

		try {
			if (
				ctx.interaction &&
				!ctx.interaction.replied &&
				!ctx.interaction.deferred
			) {
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale("cmd.movenode.moving_all_players", {
								node: nodeId,
							}),
							color: this.client.color.main,
						},
					],
				});
			}

			// Move all players to the new node
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

			// Prepare summary
			const successMoves = results.filter((r) => !r.error);
			const failedMoves = results.filter((r) => r.error);

			let description = "";
			if (successMoves.length > 0) {
				description +=
					ctx.locale("cmd.movenode.moved_players", {
						list: successMoves
							.map((r) =>
								ctx.locale("cmd.movenode.guild_move", {
									guildId: r.guildId,
									from: r.from,
									to: r.to,
								}),
							)
							.join("\n"),
					}) + "\n";
			}
			if (failedMoves.length > 0) {
				description +=
					"\n" +
					ctx.locale("cmd.movenode.failed_moves", {
						list: failedMoves
							.map((r) =>
								ctx.locale("cmd.movenode.guild_move_failed", {
									guildId: r.guildId,
									error: r.error,
								}),
							)
							.join("\n"),
					});
			}
			if (description === "") {
				description = ctx.locale("cmd.movenode.no_players_moved");
			}

			// Send a summary message
			const resultTitle = ctx.locale("cmd.movenode.results_title");
			const resultColor =
				failedMoves.length > 0
					? this.client.color.red
					: this.client.color.green;
			const resultTimestamp = new Date().toISOString();

			if (
				ctx.interaction &&
				(ctx.interaction.replied || ctx.interaction.deferred)
			) {
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
			// Error handling
			if (
				ctx.interaction &&
				(ctx.interaction.replied || ctx.interaction.deferred)
			) {
				await ctx.editMessage({
					embeds: [
						{
							description: ctx.locale("cmd.movenode.error", {
								error:
									error instanceof Error
										? error.message
										: ctx.locale("cmd.movenode.unknown_error"),
							}),
							color: this.client.color.red,
						},
					],
				});
			} else {
				await ctx.sendMessage({
					embeds: [
						{
							description: ctx.locale("cmd.movenode.error", {
								error:
									error instanceof Error
										? error.message
										: ctx.locale("cmd.movenode.unknown_error"),
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

/**
 * Project: lavamusic
 * Author: Appu
 * Main Contributor: LucasB25
 * Company: Coders
 * Copyright (c) 2024. All rights reserved.
 * This code is the property of Coder and may not be reproduced or
 * modified without permission. For more information, contact us at
 * https://discord.gg/YQsGbTwPBx
 */
