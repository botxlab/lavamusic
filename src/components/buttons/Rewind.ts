import { type ButtonInteraction } from "discord.js";
import { Component, Lavamusic } from "../../structures";
import { I18N, t } from "../../structures/I18n";
import { handlePlayerInteraction, updatePlayerMessage } from "../../utils/PlayerUIUtils";

export default class RewindButton extends Component {
	constructor(client: Lavamusic) {
		super(client, {
			name: "rewind",
			aliases: ["REWIND_BUT"],
		});
	}

	public async run(interaction: ButtonInteraction): Promise<any> {
		const player = await handlePlayerInteraction(this.client, interaction);
		if (!player) return;

		const time = Math.max(player.position - 10000, 0);
		player.seek(time);
		await interaction.deferUpdate();
		await updatePlayerMessage(
			this.client,
			interaction,
			player,
			t(I18N.events.setupButton.rewinded),
		);
	}
}
