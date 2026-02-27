import "i18next";

import type buttons from "../../locales/en-US/buttons.json";
import type commands from "../../locales/en-US/commands.json";
import type common from "../../locales/en-US/common.json";
import type dev from "../../locales/en-US/dev.json";
import type events from "../../locales/en-US/events.json";
import type player from "../../locales/en-US/player.json";

export interface I18nResourceSchema {
	commands: typeof commands;
	common: typeof common;
	buttons: typeof buttons;
	dev: typeof dev;
	events: typeof events;
	player: typeof player;
}

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		resources: I18nResourceSchema;
		returnNull: false;
	}
}

export type { I18nResourceSchema };
