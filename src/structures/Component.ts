import type {
	AnySelectMenuInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
} from "discord.js";
import type Lavamusic from "./Lavamusic";

interface ComponentOptions {
	name: string;
	aliases?: string[];
}

export default class Component {
	public client: Lavamusic;
	public name: string;
	public aliases: string[];

	constructor(client: Lavamusic, options: ComponentOptions) {
		this.client = client;
		this.name = options.name;
		this.aliases = options.aliases ?? [];
	}

	public async run(
		_interaction: ButtonInteraction | AnySelectMenuInteraction | ModalSubmitInteraction,
	): Promise<any> {
		return await Promise.resolve();
	}
}
