import type { ButtonInteraction } from "discord.js";
import { Component, type Lavamusic } from "../../structures";
import { I18N, t } from "../../structures/I18n";
import { handlePlayerInteraction, updatePlayerMessage } from "../../utils/PlayerUIUtils";

export default class VolumeUpButton extends Component {
	constructor(client: Lavamusic) {
		super(client, {
			name: "vol_up",
			aliases: ["HIGH_VOL_BUT"],
		});
	}

	public async run(interaction: ButtonInteraction): Promise<any> {
		const player = await handlePlayerInteraction(this.client, interaction);
		if (!player) return;

		const vol = Math.min(player.volume + 10, 100);
		player.setVolume(vol);
		await interaction.deferUpdate();
		await updatePlayerMessage(
			this.client,
			interaction,
			player,
			t(I18N.events.setupButton.volume_set, { vol }),
		);
	}
}
