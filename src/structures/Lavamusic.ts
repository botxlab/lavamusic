/** biome-ignore-all lint/style/noNonNullAssertion: explanation */
import { Api } from "@top-gg/sdk";
import {
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
import fs, { existsSync } from "node:fs";
import path from "node:path";
import config from "../config";
import ServerData from "../database/server";
import { env } from "../env";
import loadPlugins from "../plugin/index";
import { Utils } from "../utils/Utils";
import { T, i18n, initI18n, localization } from "./I18n";
import type { Command } from "./index";
import LavalinkClient from "./LavalinkClient";
import logger from "./Logger"; // Centralized logger instance

export default class Lavamusic extends Client {
	public commands: Collection<string, Command> = new Collection();
	public aliases: Collection<string, any> = new Collection();
	public db = new ServerData();
	public cooldown: Collection<string, any> = new Collection();
	public config = config;
	public readonly emoji = config.emoji;
	public readonly color = config.color;

	// Utilities and Environment
	public utils = Utils;
	public env: typeof env = env;
	public manager!: LavalinkClient;
	public topGG!: Api;
	public rest = new REST({ version: "10" }).setToken(env.TOKEN ?? "");
	private body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

	public embed(): EmbedBuilder {
		return new EmbedBuilder();
	}

	public async start(token: string): Promise<void> {
		initI18n();

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
			if (interaction.isButton() && interaction.guildId) {
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
			}
		});
	}

	private async loadCommands(): Promise<void> {
		const commandsPath = path.join(process.cwd(), "dist", "commands");

		if (!existsSync(commandsPath)) {
			logger.warn(`Commands directory not found at ${commandsPath}`);
			return;
		}

		const commandDirs = fs.readdirSync(commandsPath);

		for (const dir of commandDirs) {
			const dirPath = path.join(commandsPath, dir);
			if (!fs.lstatSync(dirPath).isDirectory()) continue;

			const commandFiles = fs
				.readdirSync(dirPath)
				.filter((file) => file.endsWith(".js"));

			for (const file of commandFiles) {
				try {
					const cmdModule = require(path.join(dirPath, file));
					const command: Command = new cmdModule.default(this, file);
					command.category = dir;

					this.commands.set(command.name, command);
					command.aliases.forEach((alias: string) => {
						this.aliases.set(alias, command.name as any);
					});

					if (command.slashCommand) {
						this.body.push(this.prepareCommandData(command));
					}
				} catch (error) {
					logger.error(`Failed to load command ${file}:`, error);
				}
			}
		}
	}

	private prepareCommandData(
		command: Command,
	): RESTPostAPIChatInputApplicationCommandsJSONBody {
		const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
			name: command.name,
			description: T(Locale.EnglishUS, command.description.content),
			type: ApplicationCommandType.ChatInput,
			options: command.options || [],
			default_member_permissions:
				Array.isArray(command.permissions.user) &&
				command.permissions.user.length > 0
					? PermissionsBitField.resolve(
							command.permissions.user as any,
						).toString()
					: null,
			name_localizations: {},
			description_localizations: {},
		};

		// Handle localizations
		for (const locale of i18n.getLocales()) {
			const loc = localization(
				locale,
				command.name,
				command.description.content,
			);
			if (loc.name) data.name_localizations![loc.name[0] as any] = loc.name[1];
			if (loc.description)
				data.description_localizations![loc.description[0] as any] =
					loc.description[1];
		}

		return data;
	}

	public async deployCommands(guildId?: string): Promise<void> {
		if (!this.user?.id) {
			logger.error("Cannot deploy commands: Client is not logged in.");
			return;
		}

		const route = guildId
			? Routes.applicationGuildCommands(this.user.id, guildId)
			: Routes.applicationCommands(this.user.id);

		try {
			await this.rest.put(route, { body: this.body });
			logger.info(`Successfully deployed ${this.body.length} slash commands!`);
		} catch (error) {
			logger.error("Failed to deploy commands:", error);
		}
	}

	private async loadEvents(): Promise<void> {
		const eventsPath = path.join(process.cwd(), "dist", "events");

		if (!existsSync(eventsPath)) return;

		const eventDirs = fs.readdirSync(eventsPath);

		for (const dir of eventDirs) {
			const dirPath = path.join(eventsPath, dir);
			if (!fs.lstatSync(dirPath).isDirectory()) continue;

			const eventFiles = fs
				.readdirSync(dirPath)
				.filter((file) => file.endsWith(".js"));

			for (const file of eventFiles) {
				try {
					const eventModule = require(path.join(dirPath, file));
					const event = new eventModule.default(this, file);

					if (dir === "player") {
						this.manager.on(event.name, (...args: any) => event.run(...args));
					} else if (dir === "node") {
						this.manager.nodeManager.on(event.name, (...args: any) =>
							event.run(...args),
						);
					} else {
						this.on(event.name, (...args) => event.run(...args));
					}
				} catch (error) {
					logger.error(`Failed to load event ${file}:`, error);
				}
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
