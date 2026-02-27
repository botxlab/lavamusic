import { existsSync, lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
	ActionRowBuilder,
	type APIEmbed,
	type BaseMessageOptions,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	ComponentType,
	type JSONEncodable,
	type Message,
	MessageFlags,
	type TextChannel,
} from "discord.js";
import type { Context, Lavamusic } from "../structures/index";
import logger from "../structures/Logger";
import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS, TIME_UNITS_MS, type TimeUnit } from "../types/time";

type PageEmbed = (JSONEncodable<APIEmbed> | APIEmbed)[];

/**
 * Interface representing the file info yielded by the walker.
 */
export interface FileWalkerResult {
	path: string;
	category: string;
	file: string;
}

const timeFormatter = new Intl.DurationFormat("en-US", {
	style: "digital",
	fractionalDigits: 0,
	hoursDisplay: "auto",
});

const numberFormatter = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 2,
});

/**
 * Formats milliseconds into a digital duration string (e.g., 01:30:00).
 */
export function formatTime(ms: number): string {
	if (!ms || ms < 0 || Number.isNaN(ms)) return "00:00";

	const seconds = Math.floor((ms / SECOND_MS) % 60);
	const minutes = Math.floor((ms / MINUTE_MS) % 60);
	const hours = Math.floor((ms / HOUR_MS) % 24);
	const days = Math.floor(ms / DAY_MS);

	return timeFormatter.format({ days: days > 0 ? days : undefined, hours, minutes, seconds });
}

/**
 * Sets the voice channel status
 */
export async function setVoiceStatus(
	client: Lavamusic,
	channelId: string,
	message: string | null,
): Promise<void> {
	if (!channelId) return;

	// string => set | null / "" => clear
	const status = message && message.trim().length > 0 ? message : null;

	try {
		await client.rest.put(`/channels/${channelId}/voice-status`, {
			body: { status },
		});
	} catch (error) {
		logger.error(`[Voice Status] Failed for channel ${channelId}: ${error}`);
	}
}

/**
 * Splits an array into chunks of a specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, size + i));
	}
	return chunks;
}

/**
 * Formats bytes into human readable sizes (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B Bytes";

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
	const i = Math.floor(Math.log2(bytes) / 10);
	const index = Math.min(i, sizes.length - 1);
	const value = bytes / k ** index;

	return `${numberFormatter.format(value)} ${sizes[index]}`;
}

export function formatNumber(number: number): string {
	return numberFormatter.format(number);
}

/**
 * Parses time string (e.g., "10m 5s") into milliseconds
 */
export function parseTime(string: string): number {
	const timeMatches = string.match(/(\d+)\s*([dhms])/g);
	if (!timeMatches) return 0;

	return timeMatches.reduce((total, t) => {
		const unit = t.slice(-1) as TimeUnit;
		const amount = Number(t.slice(0, -1));
		return total + amount * (TIME_UNITS_MS[unit] ?? 0);
	}, 0);
}

/**
 * Generates progress bar
 */
export function progressBar(current: number, total: number, size = 20): string {
	if (total === 0) return `${"░".repeat(size)} 0%`;

	const percent = Math.round((current / total) * 100);
	const filledSize = Math.max(0, Math.min(size, Math.round((size * current) / total)));

	const filledBar = "▓".repeat(filledSize);
	const emptyBar = "░".repeat(size - filledSize);

	return `${filledBar}${emptyBar} ${percent}%`;
}

/**
 * Handles pagination
 */
export async function paginate(client: Lavamusic, ctx: Context, embeds: PageEmbed): Promise<void> {
	// If only one page, send without pagination buttons
	if (embeds.length < 2) {
		const payload: BaseMessageOptions = { embeds: embeds };
		if (ctx.isInteraction) {
			ctx.deferred
				? await ctx.interaction!.followUp(payload)
				: await ctx.interaction!.reply(payload);
		} else {
			await (ctx.channel as TextChannel).send(payload);
		}
		return;
	}

	let page = 0;

	// Build buttons based on current page state
	const getComponents = (currentPage: number): ActionRowBuilder<ButtonBuilder>[] => {
		const isFirst = currentPage === 0;
		const isLast = currentPage === embeds.length - 1;

		const buildButton = (
			id: string,
			emoji: string,
			style: ButtonStyle,
			disabled: boolean = false,
		) => new ButtonBuilder().setCustomId(id).setEmoji(emoji).setStyle(style).setDisabled(disabled);

		const buttons = [
			buildButton("first", client.emoji.page.first, ButtonStyle.Primary, isFirst),
			buildButton("back", client.emoji.page.back, ButtonStyle.Primary, isFirst),
			buildButton("stop", client.emoji.page.cancel, ButtonStyle.Danger),
			buildButton("next", client.emoji.page.next, ButtonStyle.Primary, isLast),
			buildButton("last", client.emoji.page.last, ButtonStyle.Primary, isLast),
		];

		return [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)];
	};

	const options = { embeds: [embeds[0]], components: getComponents(0) };
	let message: Message;

	// Send initial message based on context type
	if (ctx.isInteraction) {
		const interaction = ctx.interaction!;
		ctx.deferred ? await interaction.followUp(options) : await interaction.reply(options);
		message = await interaction.fetchReply();
	} else {
		message = await (ctx.channel as TextChannel).send(options);
	}

	// Determine author ID
	const authorId = ctx.isInteraction ? ctx.interaction!.user.id : ctx.author?.id;
	if (!authorId) return;

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter: (i) => i.user.id === authorId,
		time: 60_000,
	});

	collector.on("collect", async (interaction: ButtonInteraction) => {
		if (interaction.user.id !== authorId) {
			await interaction.reply({
				content: ctx.locale("buttons.errors.not_author"),
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		if (interaction.customId === "stop") {
			collector.stop("stopped_by_user");
			await interaction.deferUpdate();
			return;
		}

		// Update page index based on action
		switch (interaction.customId) {
			case "first":
				page = 0;
				break;
			case "back":
				page = Math.max(0, page - 1);
				break;
			case "next":
				page = Math.min(embeds.length - 1, page + 1);
				break;
			case "last":
				page = embeds.length - 1;
				break;
		}

		await interaction
			.update({ embeds: [embeds[page]], components: getComponents(page) })
			.catch(() => collector.stop("message_deleted"));
	});

	collector.on("end", async (_, reason) => {
		if (!message.editable) return;

		try {
			// If stopped by user, remove buttons completely
			// Otherwise, keep embed but disable components
			const cleanupOptions =
				reason === "stopped_by_user"
					? { components: [] }
					: { embeds: [embeds[page]], components: [] };

			await message.edit(cleanupOptions);
		} catch (error) {
			logger.error(`[Pagination Error]: ${error}`);
		}
	});
}

/**
 * Recursively walks through a directory looking for subfolders and files.
 */
export function* walkDirectory(dirPath: string): Generator<FileWalkerResult> {
	if (!existsSync(dirPath)) return;

	const categories = readdirSync(dirPath);

	for (const category of categories) {
		const categoryPath = join(dirPath, category);

		// Ensure we are looking at a directory, not a random file at root
		if (!lstatSync(categoryPath).isDirectory()) continue;

		const files = readdirSync(categoryPath).filter(
			(file) => file.endsWith(".js") || file.endsWith(".ts"),
		);

		for (const file of files) {
			yield {
				path: join(categoryPath, file),
				category,
				file,
			};
		}
	}
}
