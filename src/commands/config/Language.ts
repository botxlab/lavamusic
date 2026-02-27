import { type AutocompleteInteraction, Locale } from "discord.js";
import { env } from "../../env";
import { getSupportedLanguages, I18N } from "../../structures/I18n";
import { Command, type Context, type Lavamusic } from "../../structures/index";
import { getLanguageName } from "../../types/locales";
import { getEmojiFlag } from "../../utils/CountryEmojiFlag";
import {
	EmbedLinks,
	ManageGuild,
	ReadMessageHistory,
	SendMessages,
	ViewChannel,
} from "../../utils/Permissions";

const displayNamesCache = new Map<string, Intl.DisplayNames>();

function getDisplayNames(locale: string): Intl.DisplayNames {
	let instance = displayNamesCache.get(locale);
	if (!instance) {
		instance = new Intl.DisplayNames([locale], { type: "language" });
		displayNamesCache.set(locale, instance);
	}
	return instance;
}

function getLocalizedName(langCode: string, targetLocale: string) {
	const flag = getEmojiFlag(langCode);
	let name: string;

	try {
		const rawName = getDisplayNames(targetLocale).of(langCode);
		name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : langCode;
	} catch {
		name = getLanguageName(langCode as Locale);
	}

	return { flag, name, full: `${flag} ${name}` };
}

export default class LanguageCommand extends Command {
	constructor(client: Lavamusic) {
		super(client, {
			name: "language",
			description: {
				content: I18N.commands.language.description,
				examples: ["language set `en-US`", "language reset"],
				usage: "language",
			},
			category: "config",
			aliases: ["lang"],
			cooldown: 3,
			args: true,
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
				user: [ManageGuild],
			},
			slashCommand: true,
			options: [
				{
					name: "set",
					description: I18N.commands.language.options.set,
					type: 1,
					options: [
						{
							name: "language",
							description: I18N.commands.language.options.language,
							type: 3,
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					name: "reset",
					description: I18N.commands.language.options.reset,
					type: 1,
				},
			],
		});
	}

	public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
		const subCommand = ctx.isInteraction ? ctx.options.getSubCommand() : args.shift();
		const defaultLanguage = env.DEFAULT_LANGUAGE || Locale.EnglishUS;
		const embed = client.embed().setColor(client.color.main);

		if (subCommand === "set") {
			const currentLocale = (await client.db.getLanguage(ctx.guild.id)) || defaultLanguage;
			const targetInput = ctx.isInteraction
				? (ctx.options.get("language")?.value as string)
				: args[0];

			let langCode: string = targetInput;
			if (targetInput in Locale) langCode = Locale[targetInput as keyof typeof Locale];

			const supportedLanguages = getSupportedLanguages();
			const userLocale = ctx.interaction?.locale || langCode;
			const localizedDisplay = getLocalizedName(langCode, userLocale).full;

			if (!supportedLanguages.includes(langCode)) {
				const availableLanguages = supportedLanguages
					.map((code) => `\`${code}\` (${getEmojiFlag(code)})`)
					.join(", ");

				return ctx.sendMessage({
					embeds: [
						embed.setDescription(
							ctx.locale(I18N.commands.language.invalid_language, {
								languages: availableLanguages,
							}),
						),
					],
				});
			}

			if (currentLocale === langCode) {
				return ctx.sendMessage({
					embeds: [
						embed.setDescription(
							`ℹ️ ${ctx.locale(I18N.commands.language.already_set, {
								language: localizedDisplay,
							})}`,
						),
					],
				});
			}

			await client.db.updateLanguage(ctx.guild.id, langCode);
			ctx.guildLocale = langCode;

			return ctx.sendMessage({
				embeds: [
					embed.setDescription(
						`✅ ${ctx.locale(I18N.commands.language.set, {
							language: localizedDisplay,
							lng: userLocale,
						})}`,
					),
				],
			});
		}

		if (subCommand === "reset") {
			const locale = await client.db.getLanguage(ctx.guild.id);

			if (!locale) {
				return ctx.sendMessage({
					embeds: [embed.setDescription(`ℹ️ ${ctx.locale(I18N.commands.language.not_set)}`)],
				});
			}

			await client.db.updateLanguage(ctx.guild.id, defaultLanguage);
			ctx.guildLocale = defaultLanguage;

			return ctx.sendMessage({
				embeds: [embed.setDescription(`✅ ${ctx.locale(I18N.commands.language.reset)}`)],
			});
		}
	}

	public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const input = interaction.options.getFocused().toLowerCase();
		const supportedLanguages = getSupportedLanguages();
		const userLocale = interaction.locale;

		const choices = supportedLanguages.map((code) => {
			const { full, name } = getLocalizedName(code, userLocale);
			return {
				name: `${full} | ${code}`,
				value: code,
				sortKey: name,
			};
		});

		choices.sort((a, b) => a.sortKey.localeCompare(b.sortKey, userLocale));

		if (!input) return void (await interaction.respond(choices.slice(0, 25)).catch(() => null));

		const filtered = choices
			.filter((choice) => choice.name.toLowerCase().includes(input))
			.slice(0, 25);

		await interaction.respond(filtered).catch(() => null);
	}
}
