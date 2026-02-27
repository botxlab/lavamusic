import { type ButtonInteraction, MessageFlags } from "discord.js";
import { Component, Lavamusic } from "../../structures";
import { I18N, t } from "../../structures/I18n";
import { handlePlayerInteraction, updatePlayerMessage } from "../../utils/PlayerUIUtils";

export default class ForwardButton extends Component {
	constructor(client: Lavamusic) {
		super(client, {
			name: "forward",
			aliases: ["FORWARD_BUT"],
		});
	}

	public async run(interaction: ButtonInteraction): Promise<any> {
		const player = await handlePlayerInteraction(this.client, interaction);
		if (!player) return;

		const time = player.position + 10000;
		if (time >= player.queue.current!.info.duration) {
			return await interaction.reply({
				content: t(I18N.events.setupButton.forward_limit),
				flags: MessageFlags.Ephemeral,
			});
		}

		player.seek(time);
		await interaction.deferUpdate();
		await updatePlayerMessage(
			this.client,
			interaction,
			player,
			t(I18N.events.setupButton.forwarded),
		);
	}
}
