# Lavamusic - Ultimate Discord Music Bot

<div align="center">

## 🔥 Welcome to Lavamusic - Your Favorite Discord Music Companion! 🔥

**[🎵 Invite Lavamusic to Your Server Now! 🎵](https://mintone.tech/invite)**

[![Discord](https://img.shields.io/badge/Discord-Invite-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://mintone.tech/invite)
[![GitHub stars](https://img.shields.io/github/stars/botxlab/lavamusic?style=social)](https://github.com/botxlab/lavamusic)
[![GitHub forks](https://img.shields.io/github/forks/botxlab/lavamusic?style=social)](https://github.com/botxlab/lavamusic)

</div>

---

Hey there! 👋 **Lavamusic** is more than just a Discord music bot—it's your gateway to endless music fun in your server. Built with passion by the BotxLab team, this powerful bot brings the party to your Discord channels with seamless playback, awesome filters, and a whole lot of vibes! Whether you're hosting game nights, study sessions, or just chilling with friends, Lavamusic has you covered.

## ✨ What Makes Lavamusic Special?

🎵 **Superior Audio Experience**: Leveraging the latest Lavalink technology for crystal-clear, lag-free music playback.

🎛️ **Magical Audio Filters**: Transform any track with 12+ masterpiece filters like Bass Boost, Nightcore, Karaoke, and more!

📂 **Personalized Playlists**: Create, save, and share your favorite playlists for instant access anytime.

🌍 **Speak Your Language**: Supports over 15 languages—because music unites us all.

⏰ **24/7 Party Mode**: Never stop the music—your bot keeps playing even when you're away.

📝 **Lyric Lover?**: Get real-time lyrics from Genius and other sources for singing along!

🔎 **Universal Search**: Play from YouTube, Spotify, SoundCloud, and countless other platforms.

🎪 **Rich Commands**: Queue management, smart skipping, precise seeking, autoplay, and volume fine-tuning.

⚙️ **Tailor-Made for You**: Customize prefixes, DJ roles, language, and more to fit your server's vibe.

🐳 **Container Ready**: Docker support for one-click deployment—perfect for pros and beginners alike.

## 🚀 Getting Started: Easy as Pie! (Even if You're New to This)

### 🛠️ Quick Prerequisites

Before we dive in, make sure you have these ready:
- **Node.js** version 18 or higher ([download here](https://nodejs.org) if needed)
- A **Lavalink server** (don't worry, we'll set it up!)
- Your **Discord bot token** from the [Discord Developer Portal](https://discord.com/developers/applications)

Got them? Great! Let's get Lavamusic grooving in no time.

### 📋 Step-by-Step Setup (We're Here to Help!)

#### 1. Grab the Code
Open your terminal and run:
```bash
git clone https://github.com/botxlab/lavamusic.git
cd lavamusic
```

#### 2. Install the Goodies
Pick your favorite package manager:
```bash
# If you use npm (classic choice):
npm install

# Or try pnpm (super fast):
pnpm install

# Yarn fan? No problem:
yarn install
```

#### 3. Set Up Your Environment
Create your config file:
```bash
cp .env.example .env
```

Now, edit `.env` in your favorite text editor:
```env
TOKEN="your_bot_token_here"
CLIENT_ID="your_bot_client_id"
OWNER_IDS=["your_discord_user_id"]
DATABASE_URL="file:./lavamusic.db"  # SQLite is fine for starters, or use PostgreSQL later
```

#### 4. Get Lavalink Ready (Our Audio Engine)
Copy the example config:
```bash
cp Lavalink/example.application.yml Lavalink/application.yml
```

Need extra music sources like YouTube or Spotify? The config has instructions to add plugins!

Fire up Lavalink (we'll use a simple start command):
```bash
cd Lavalink
java -jar lavalink.jar  # Assuming you have the JAR ready
```

By default, it runs at `localhost:2333`. Easy peasy!

#### 5. Prepare the Database
For quick setup (using SQLite):
```bash
npm run generate
npm run push
```

Switch to PostgreSQL anytime by updating your DATABASE_URL.

#### 6. Launch the Bot!
Build and run:
```bash
npm run build
npm start
```

#### 7. Welcome Lavamusic to Your Server
Click here to invite: **[🎉 Add to Server 🎉](https://mintone.tech/invite)**

Or craft the link manually: `https://discord.com/oauth2/authorize?client_id=1343814433134346241&permissions=279209954560&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.gg%2Fkhfw8z6gg9&integration_type=0&scope=bot+guilds+applications.commands`

#### 8. Sync Commands (Optional Step)
In any server channel, type `!deploy` or `/deploy` to activate slash commands.

## 🐳 Docker Lovers' Shortcut (One-Click Setup!)

Prefer containers? We've got you!

1. Install Docker and Docker Compose if you haven't.

2. Copy configs as above.

3. Set up your `.env` file.

4. Launch everything:
```bash
docker compose up -d
```

Boom! Bot, Lavalink, and even a PostgreSQL database—all running automatically.

Want to update later?
```bash
docker compose pull
docker compose up -d --force-recreate
```

## 🎵 Let's Make Some Music! Basic Commands

Ready to rock? Here are your essentials:
- `/play <song>` - Start playing a tune (supports links and searches)
- `/queue` - Peek at what's coming up
- `/skip` - Jump to the next track
- `/volume <1-100>` - Crank it up or dial it down
- `/lyrics` - Sing along with lyrics

### 🎨 Unlock Advanced Magic
- **Cool Effects**: Try `/bassboost`, `/nightcore`, `/8d`, and more!
- **Playlist Power**: Use `/playlist create` to build, `/playlist load` to unleash
- **Server Setup**: Customize with `/config prefix !` or `/config language en`

Need a full command list? Hit `/help` in Discord!

## 🔧 Fine-Tune Your Experience

### Environment Tweaks (.env)
Your bot's personality lives here:
- `TOKEN`: Your bot's secret identity
- `PREFIX`: Default command starter (like `/` or `!`)
- `DEFAULT_LANGUAGE`: Start with `en` for English
- `DATABASE_URL`: Where data lives (SQLite or full DB)
- `OWNER_IDS`: Your admin IDs (array format)
- `NODES`: Lavalink connection details
- Peek at `.env.example` for all options!

### Lavalink Customization
Tweak `Lavalink/application.yml` for audio sources, plugins, and tweaks.

## 📀 Music Sources Galore

**Built-in Gems**: SoundCloud, Twitch, Bandcamp, Vimeo, NicoNico, and more.

**Plugin Power-Ups** (add these for ultimate variety):
- YouTube, Spotify, Deezer, Apple Music: Grab [LavaSrc](https://github.com/topi314/LavaSrc)
- Endless more via community plugins.

## 🤓 For the Tech-Savvy Coders

- **Crafted in TypeScript** for reliability
- **Powered by Discord.js** and Lavalink-Client
- **Data with Drizzle ORM**: SQLite by default, PG/MySQL ready
- **Open Source** under GPL-3.0

### Build and Tweak
Developer mode? Let's code:
```bash
npm run build    # Compile everything
npm run start    # Run the build
npm run dev      # Hot-reload for development
```

## 🤝 Join the Lavamusic Family

We ❤️ contributors! Here's how to get involved:
1. Fork this repo
2. Create a branch for your amazing idea
3. Code, test, and shine
4. Send a pull request—we'll review it fast!

## 🆘 Need Help? We're Here!

- **[Invite the Bot Now](https://mintone.tech/invite)** and try it out!
- Check our [FAQ](https://github.com/botxlab/lavamusic/wiki) for quick fixes
- Report bugs or request features at [Issues](https://github.com/botxlab/lavamusic/issues)
- Chat with us on [Discord](https://discord.gg/UsXz2x34d4)
- **Common Quick Fixes:**
  - **"Bot not responding?"** Check your token and Lavalink is running.
  - **Audio issues?** Verify Lavalink config and plugins.
  - **Permissions problem?** Ensure bot has proper server roles.

## ⭐ Spread the Love!

Loving Lavamusic? Give our repo a star ⭐—it keeps us motivated!

---

Built with ❤️ by the [BotxLab](https://github.com/botxlab) team. We're a passionate crew dedicated to making Discord fun through code. Huge thanks to contributors worldwide!

## 📜 License

Licensed under GPL-3.0. Fork, modify, and share responsibly. See [LICENSE](LICENSE) for the full scoop.
