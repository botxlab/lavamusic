import { type ButtonInteraction } from "discord.js";
import { Component, Lavamusic } from "../../structures";
import { handlePlayerInteraction } from "../../utils/PlayerUIUtils";

export default class StopButton extends Component {
	constructor(client: Lavamusic) {
		super(client, {
			name: "stop",
			aliases: ["STOP_BUT"],
		});
	}

	public async run(interaction: ButtonInteraction): Promise<any> {
		const player = await handlePlayerInteraction(this.client, interaction);
		if (!player) return;

		player.stopPlaying(true, false);
		await interaction.deferUpdate();
	}
}
