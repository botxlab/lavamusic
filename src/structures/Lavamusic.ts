import { Api } from "@top-gg/sdk";
import {
	type APIApplicationCommandOption,
	ApplicationCommandType,
	Client,
	Collection,
	EmbedBuilder,
	Locale,
	PermissionsBitField,
	REST,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from "discord.js";
import config from "../config";
import ServerData from "../database/server";
import { CommandList } from "../commands";
import { EventList } from "../events";
import { ComponentList } from "../components";
import { env } from "../env";
import { LavamusicEventType } from "../types/events";
import * as Utils from "../utils/Utils";
import { initI18n, resolveLocalizations, t } from "./I18n";
import type { Component, Command } from "./index";
import LavalinkClient from "./LavalinkClient";
import logger from "./Logger";

export default class Lavamusic extends Client {
	public commands: Collection<string, Command> = new Collection();
	public aliases: Collection<string, string> = new Collection();
	public cooldown: Collection<string, any> = new Collection();
	public components: Collection<string, Component> = new Collection();

	public db = new ServerData();
	public config = config;
	public readonly emoji = config.emoji;
	public readonly color = config.color;

	public utils = Utils;
	public env: typeof env = env;

	public topGG!: Api;
	public manager!: LavalinkClient;
	public rest = new REST({ version: "10" }).setToken(env.TOKEN ?? "");

	private body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

	public embed(): EmbedBuilder {
		return new EmbedBuilder();
	}

	public async start(token: string): Promise<void> {
		await initI18n();

		if (env.TOPGG) {
			this.topGG = new Api(env.TOPGG);
		} else {
			logger.warn("Top.gg token not found! Skipping Top.gg API initialization");
		}

		this.manager = new LavalinkClient(this);

		try {
			this.loadCommands();
			this.loadEvents();
			this.loadComponents();
			logger.info("Commands, Events, and Components loaded successfully!");

			await this.login(token);
		} catch (error) {
			logger.error("Critical error during startup:", error);
			process.exit(1);
		}
	}

	public async loadCommands(): Promise<void> {
		this.commands.clear();
		this.aliases.clear();
		this.body = [];

		for (const CommandClass of CommandList) {
			try {
				const command = new (CommandClass as any)(this, CommandClass.name);

				if (!command.category) command.category = "general";

				this.commands.set(command.name, command);

				for (const alias of command.aliases) {
					this.aliases.set(alias, command.name);
				}

				if (command.slashCommand) {
					this.body.push(this.prepareCommandData(command));
				}
			} catch (error) {
				logger.error(`Failed to load command ${CommandClass.name}:`, error);
			}
		}
	}

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

	public async syncCommands(guildId?: string, clear = false): Promise<void> {
		const userId = this.user?.id;
		if (!userId) {
			logger.error(
				"[DEPLOY]: Client ID not found. Ensure the bot is logged in before sync commands.",
			);
			return;
		}

		let commandsBody = clear ? [] : this.body;

		if (!clear && commandsBody.length === 0) {
			logger.warn("Command body is empty. Attempting to reload commands before deployment...");
			this.loadCommands();
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

	private async loadEvents(): Promise<void> {
		for (const EventClass of EventList) {
			try {
				const event = new (EventClass as any)(this, EventClass.name);

				switch (event.type) {
					case LavamusicEventType.Player:
						this.manager.on(event.name as any, (...args: any[]) => event.run(...args));
						break;

					case LavamusicEventType.Node:
						this.manager.nodeManager.on(event.name as any, (...args: any[]) => event.run(...args));
						break;

					case LavamusicEventType.Client:
						this.on(event.name, (...args: any[]) => event.run(...args));
						break;

					default:
						logger.warn(`Event ${event.name} has unknown type: ${event.type}`);
				}
			} catch (error) {
				logger.error(`Failed to load event ${EventClass.name}:`, error);
			}
		}
	}

	private loadComponents(): void {
		for (const ComponentClass of ComponentList) {
			try {
				const component = new (ComponentClass as any)(this, ComponentClass.name);
				this.components.set(component.name, component);

				for (const alias of component.aliases) {
					this.components.set(alias, component);
				}
			} catch (error) {
				logger.error(`Failed to load component ${ComponentClass.name}:`, error);
			}
		}
	}
}
