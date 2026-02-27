import { type ButtonInteraction } from "discord.js";
import { Component, Lavamusic } from "../../structures";
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
