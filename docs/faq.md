# Frequently Asked Questions (FAQ)

Find answers to common questions and solutions to frequent issues below.

---

## General

### Is LavaMusic free?

Yes! LavaMusic is 100% open-source and free to use. There are no paywalls or hidden fees.

### Which audio sources are supported?

We support YouTube, Spotify, SoundCloud, Apple Music, and direct file links (MP3, WAV, FLAC, etc.).

---

## Troubleshooting

### The bot is online but not playing music

* **Check Lavalink**: Ensure your Lavalink server is active (default: `localhost:2333`).
* **Verify Credentials**: Double-check the Lavalink password in both `.env` and `application.yml`.
* **Check Permissions**: Ensure the bot has `Connect` and `Speak` permissions in your voice channel.

### Why is the music lagging or skipping?

Lag is typically caused by:

* Insufficient CPU/Memory on the host machine.
* Slow network connection between the bot and Lavalink or Lavalink and the audio source.
* Using an overloaded public Lavalink node. We highly recommend hosting your own node.

### "Permission Denied" errors

Ensure the bot has the following mandatory permissions:

* `View Channels`
* `Send Messages`
* `Embed Links`
* `Connect`
* `Speak`

---

## Configuration

### How do I change the prefix?

You can update the `PREFIX` variable in your `.env` file or use the `/prefix set` command if you have administrator permissions.

### How do I setup DJ roles?

Use the `/dj add <role>` command to register roles that can control the music player (skip, pause, stop, etc.).

---

::: tip STILL STUCK?
If your question isn't answered here, join our community on [Discord](https://discord.gg/jgGEbxFbyM) for instant support!
:::
