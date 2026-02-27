class ThemeSelector {
	fire(text: string): string {
		let fade = "";
		let green = 250;

		for (const line of text.split("\n")) {
			fade += `\x1b[38;2;255;${green};0m${line}\x1b[0m\n`;
			green = Math.max(0, green - 25);
		}

		return fade;
	}

	purpleNeon(text: string): string {
		let fade = "";
		let purple = 255;

		for (const line of text.split("\n")) {
			fade += `\x1b[38;2;255;0;${purple}m${line}\x1b[0m\n`;
			purple = Math.max(0, purple - 25);
		}

		return fade;
	}

	cyan(text: string): string {
		let fade = "";
		let blue = 100;

		for (const line of text.split("\n")) {
			fade += `\x1b[38;2;0;255;${blue}m${line}\x1b[0m\n`;
			if (blue < 255) {
				blue = Math.min(255, blue + 15);
			}
		}

		return fade;
	}

	water(text: string): string {
		let fade = "";
		let green = 255;

		for (const line of text.split("\n")) {
			fade += `\x1b[38;2;0;${green};255m${line}\x1b[0m\n`;
			if (green > 30) {
				green = Math.max(30, green - 40);
			}
		}

		return fade;
	}
}

export { ThemeSelector };
