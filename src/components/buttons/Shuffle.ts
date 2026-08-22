import { type ButtonInteraction, MessageFlags } from "discord.js";
import { Component, type Lavamusic } from "../../structures";
import { I18N, t } from "../../structures/I18n";
import { handlePlayerInteraction, updatePlayerMessage } from "../../utils/PlayerUIUtils";

export default class ShuffleButton extends Component {
	constructor(client: Lavamusic) {
		super(client, {
			name: "shuffle",
			aliases: ["SHUFFLE_BUT"],
		});
	}

	public async run(interaction: ButtonInteraction): Promise<any> {
		const player = await handlePlayerInteraction(this.client, interaction);
		if (!player) return;

		// respect the same restriction as the /shuffle command
		if (player.get<boolean>("fairplay")) {
			await interaction.reply({
				content: t(I18N.commands.shuffle.errors.fairplay),
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		player.queue.shuffle();
		await interaction.deferUpdate();
		await updatePlayerMessage(
			this.client,
			interaction,
			player,
			t(I18N.events.setupButton.shuffled),
		);
	}
}
