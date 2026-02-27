export const LavamusicEventType = {
	Client: "client",
	Node: "node",
	Player: "player",
} as const;

export type LavamusicEventType = (typeof LavamusicEventType)[keyof typeof LavamusicEventType];
