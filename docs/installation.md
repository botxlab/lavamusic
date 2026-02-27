# 🧭 Installation Guide

Follow this guide to get **LavaMusic** up and running on your server.

**⏱️ Estimated time: 5-10 minutes**

---

## 🚀 Before You Start (Prerequisites)

Please ensure you have these ready to avoid issues during setup:

* **[Bun](https://bun.sh/)** (Required) - The incredibly fast JS runtime.
* **[Java 17+](https://adoptium.net/)** - Required to run the Lavalink audio engine.
* **Discord Bot Token** - Get one from the [Developer Portal](https://discord.com/developers/applications).
* **Lavalink Server** - We'll help you set this up in the steps below.

::: danger IMPORTANT
This project **requires Bun**. Standard Node.js might not work for some automation scripts.
:::

---

## 📋 Step-by-Step Walkthrough

### 1️⃣ Download the Code

Open your terminal and clone the repository:

```bash
git clone https://github.com/bongodevs/lavamusic.git
cd lavamusic
```

### 2️⃣ Install Dependencies

Use Bun to install all required packages:

```bash
bun install
```

### 3️⃣ Configure Environment Variables

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in:

* `TOKEN`: Your Discord Bot Token.
* `CLIENT_ID`: Your Discord Bot Client ID.
* `OWNER_IDS`: Your Discord User ID (for admin commands).

### 4️⃣ Set Up Lavalink (Audio Engine)

Copy the example Lavalink configuration:

```bash
cp Lavalink/example.application.yml Lavalink/application.yml
```

To start Lavalink:

```bash
cd Lavalink
java -jar lavalink.jar
```

::: tip KEEP IT RUNNING
Lavalink must be running in the background for the bot to play music.
:::

### 5️⃣ Prepare the Database

This step is **mandatory**. Choose your database type based on your `.env`:

**For SQLite (Recommended for Beginners):**

```bash
bun run db:push:sqlite
```

**For PostgreSQL:**

```bash
bun run db:push
```

### 6️⃣ Launch the Bot! 🏁

Finally, build the source code and start your bot:

```bash
bun run build
bun run start
```

---

## 🎈 Invite Your Bot

Alternatively, replace `YOUR_CLIENT_ID` in the link below:

```text
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

---

## 🛠️ After Setup Tasks

### 📢 Sync Slash Commands

In any server channel, type `!deploy` to register your slash commands with Discord.

### 📜 Explore Commands

Check out the **[Commands Guide](/commands)** to learn how to use filters, autoplay, and more.

::: info NEED SUPPORT?
Join our community on [Discord](https://discord.gg/jgGEbxFbyM) if you run into any trouble!
:::
