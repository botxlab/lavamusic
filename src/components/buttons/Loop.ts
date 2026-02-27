import type { ButtonInteraction } from "discord.js";
import { Component, type Lavamusic } from "../../structures";
import { I18N, t } from "../../structures/I18n";
import { handlePlayerInteraction, updatePlayerMessage } from "../../utils/PlayerUIUtils";

export default class LoopButton extends Component {
	constructor(client: Lavamusic) {
		super(client, {
			name: "loop",
			aliases: ["LOOP_BUT"],
		});
	}

	public async run(interaction: ButtonInteraction): Promise<any> {
		const player = await handlePlayerInteraction(this.client, interaction);
		if (!player) return;

		await interaction.deferUpdate();
		switch (player.repeatMode) {
			case "off":
				player.setRepeatMode("track");
				await updatePlayerMessage(
					this.client,
					interaction,
					player,
					t(I18N.player.trackStart.looping_by, { user: interaction.user.tag }),
				);
				break;
			case "track":
				player.setRepeatMode("queue");
				await updatePlayerMessage(
					this.client,
					interaction,
					player,
					t(I18N.player.trackStart.looping_queue_by, { user: interaction.user.tag }),
				);
				break;
			case "queue":
				player.setRepeatMode("off");
				await updatePlayerMessage(
					this.client,
					interaction,
					player,
					t(I18N.player.trackStart.looping_off_by, { user: interaction.user.tag }),
				);
				break;
		}
	}
}
