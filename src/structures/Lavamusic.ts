import { Api } from "@top-gg/sdk";
import {
	type APIApplicationCommandOption,
	ApplicationCommandType,
	Client,
	Collection,
	EmbedBuilder,
	Events,
	type Interaction,
	Locale,
	PermissionsBitField,
	REST,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from "discord.js";
import { existsSync } from "fs";
import { join } from "path";
import config from "../config";
import ServerData from "../database/server";
import { env } from "../env";
import loadPlugins from "../plugin/index";
import { LavamusicEventType } from "../types/events";
import * as Utils from "../utils/Utils";
import { initI18n, resolveLocalizations, t } from "./I18n";
import type { Command } from "./index";
import LavalinkClient from "./LavalinkClient";
import logger from "./Logger";

export default class Lavamusic extends Client {
	// Collections for internal state management
	public commands: Collection<string, Command> = new Collection();
	public aliases: Collection<string, string> = new Collection();
	public cooldown: Collection<string, any> = new Collection();

	// Database and config
	public db = new ServerData();
	public config = config;
	public readonly emoji = config.emoji;
	public readonly color = config.color;

	// Utilities and Environment
	public utils = Utils;
	public env: typeof env = env;

	// Services
	public topGG!: Api;
	public manager!: LavalinkClient;
	public rest = new REST({ version: "10" }).setToken(env.TOKEN ?? "");

	// Private members
	private body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

	public embed(): EmbedBuilder {
		return new EmbedBuilder();
	}

	/**
	 * Initializes the bot, loads resources and login
	 */
	public async start(token: string): Promise<void> {
		await initI18n();

		if (env.TOPGG) {
			this.topGG = new Api(env.TOPGG);
		} else {
			logger.warn("Top.gg token not found! Skipping Top.gg API initialization");
		}

		this.manager = new LavalinkClient(this);

		try {
			await this.loadCommands();
			logger.info(`Successfully loaded ${this.commands.size} commands!`);

			await this.loadEvents();
			logger.info("Successfully loaded events!");

			loadPlugins(this);

			await this.login(token);
		} catch (error) {
			logger.error("Critical error during startup:", error);
			process.exit(1);
		}

		this.setupInteractionListener();
	}

	/**
	 * Setsup interaction listener for buttons.
	 */
	private setupInteractionListener(): void {
		this.on(Events.InteractionCreate, async (interaction: Interaction) => {
			if (!interaction.isButton() || !interaction.guildId) return;

			try {
				const setup = await this.db.getSetup(interaction.guildId);
				if (
					setup &&
					interaction.channelId === setup.textId &&
					interaction.message.id === setup.messageId
				) {
					this.emit("setupButtons", interaction);
				}
			} catch (error) {
				logger.error("Error handling setup buttons:", error);
			}
		});
	}

	/**
	 * Loads commands from the file system
	 */
	public async loadCommands(): Promise<void> {
		// Resolve absolute path relative to this file's location
		const commandsPath = join(__dirname, "..", "commands");

		// Check existence here to log specific warning for commands
		if (!existsSync(commandsPath)) {
			logger.warn(`Commands directory not found at ${commandsPath}`);
			return;
		}

		for (const { path: filePath, category, file } of this.utils.walkDirectory(commandsPath)) {
			try {
				const cmdModule = await import(filePath);
				const CommandClass = cmdModule.default || cmdModule;

				if (typeof CommandClass !== "function") continue;

				const command: Command = new CommandClass(this, file);
				command.category = category;

				this.commands.set(command.name, command);

				for (const alias of command.aliases) {
					this.aliases.set(alias, command.name);
				}

				if (command.slashCommand) {
					this.body.push(this.prepareCommandData(command));
				}
			} catch (error) {
				logger.error(`Failed to load command ${file}:`, error);
			}
		}
	}

	/**
	 * Prepares data for a slash command, handling localizations and options
	 */
	private prepareCommandData(command: Command): RESTPostAPIChatInputApplicationCommandsJSONBody {
		const baseDescription = t(command.description.content, { lng: Locale.EnglishUS });

		const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			name: command.name,
			description: baseDescription.slice(0, 100),
			type: ApplicationCommandType.ChatInput,
			options: command.options || [],
			default_member_permissions:
				Array.isArray(command.permissions.user) && command.permissions.user.length > 0
					? PermissionsBitField.resolve(command.permissions.user).toString()
					: null,
			name_localizations: resolveLocalizations(command.name, "name"),
			description_localizations: resolveLocalizations(command.description.content, "description"),
		};

		if (command.options?.length) {
			data.options = command.options.map((opt) => this.processCommandOptions(opt));
		}

		return data;
	}

	/**
	 * Processes command options to apply translations
	 */
	private processCommandOptions(option: any): APIApplicationCommandOption {
		const localizedOption: APIApplicationCommandOption = {
			...option,
			name_localizations: resolveLocalizations(option.name, "name"),
			description_localizations: resolveLocalizations(option.description, "description"),
			description: t(option.description, { lng: Locale.EnglishUS }).slice(0, 100),
			options: option.options?.map((sub: any) => this.processCommandOptions(sub)),
		};

		return localizedOption;
	}

	/**
	 * Synchronizes slash commands with the Discord API.
	 *
	 * @param guildId - If provided, syncs to a specific guild. Otherwise, syncs globally.
	 * @param clear - If true, removes all commands (undeploy). Defaults to false.
	 */
	public async syncCommands(guildId?: string, clear = false): Promise<void> {
		const userId = this.user?.id;
		if (!userId) {
			logger.error(
				"[DEPLOY]: Client ID not found. Ensure the bot is logged in before sync commands.",
			);
			return;
		}

		// Determine target body: empty array for undeploy, current body for deploy
		let commandsBody = clear ? [] : this.body;

		// If deploying and body is empty, try loading once
		if (!clear && commandsBody.length === 0) {
			logger.warn("Command body is empty. Attempting to reload commands before deployment...");
			await this.loadCommands();
			commandsBody = this.body;
		}

		const route = guildId
			? Routes.applicationGuildCommands(userId, guildId)
			: Routes.applicationCommands(userId);

		const action = clear ? "removed" : "deployed";
		const scope = guildId ? `in guild ${guildId}` : "globally";

		try {
			await this.rest.put(route, { body: commandsBody });
			logger.info(`Successfully ${action} ${commandsBody.length} slash commands ${scope}!`);
		} catch (error) {
			logger.error(`Failed to ${clear ? "undeploy" : "deploy"} commands ${scope}:`, error);
			throw error;
		}
	}

	/**
	 * Loads events from the file system
	 */
	private async loadEvents(): Promise<void> {
		const eventsPath = join(__dirname, "..", "events");

		if (!existsSync(eventsPath)) return;

		for (const { path: filePath, category, file } of this.utils.walkDirectory(eventsPath)) {
			try {
				const eventModule = await import(filePath);
				const EventClass = eventModule.default || eventModule;
				const event = new EventClass(this, file);

				// Register event listeners based on category
				switch (category) {
					case LavamusicEventType.Player:
						this.manager.on(event.name, (...args: any[]) => event.run(...args));
						break;
					case LavamusicEventType.Node:
						this.manager.nodeManager.on(event.name, (...args: any[]) => event.run(...args));
						break;
					case LavamusicEventType.Client:
						this.on(event.name, (...args: any[]) => event.run(...args));
						break;
				}
			} catch (error) {
				logger.error(`Failed to load event ${file}:`, error);
			}
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
