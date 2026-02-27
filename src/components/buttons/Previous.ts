import { type ButtonInteraction, MessageFlags } from "discord.js";
import { Component, type Lavamusic } from "../../structures";
import { I18N, t } from "../../structures/I18n";
import { handlePlayerInteraction, updatePlayerMessage } from "../../utils/PlayerUIUtils";

export default class PreviousButton extends Component {
	constructor(client: Lavamusic) {
		super(client, {
			name: "previous",
			aliases: ["PREV_BUT"],
		});
	}

	public async run(interaction: ButtonInteraction): Promise<any> {
		const player = await handlePlayerInteraction(this.client, interaction);
		if (!player) return;

		if (player.queue.previous && player.queue.previous.length > 0) {
			await interaction.deferUpdate();
			const previousTrack = player.queue.previous[0];
			player.play({ track: previousTrack });
			await updatePlayerMessage(
				this.client,
				interaction,
				player,
				t(I18N.player.trackStart.previous_by, { user: interaction.user.tag }),
			);
		} else {
			await interaction.reply({
				content: t(I18N.player.trackStart.no_previous_song),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
