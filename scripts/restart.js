import { spawn } from "node:child_process";

async function startLavamusic() {
	const child = spawn("npm", ["start"], {
		stdio: "inherit",
		shell: true,
		detached: true,
	});
	child.on("error", (err) => {
		console.error(`Failed to start Lavamusic: ${err.message}`);
	});
	child.unref();
}

setTimeout(startLavamusic, 5000);
