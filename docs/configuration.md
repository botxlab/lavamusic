# ⚙️ Configuration Guide

Fine-tune every aspect of your **LavaMusic** instance. All core settings are managed via the `.env` file in your root directory.

---

## 🔧 Environment Variables (`.env`)

Your bot's behavior is defined by these key variables. Create this file by copying `.env.example`.

### 🔑 Authentication

* **`TOKEN`**: Your Discord Bot Token. **Keep this secret!**
* **`CLIENT_ID`**: The Application ID of your bot.

### 📜 Bot Settings

* **`PREFIX`**: The default character used to trigger commands (e.g., `!` or `/`).
* **`DEFAULT_LANGUAGE`**: The initial language for the bot (e.g., `en`, `es`, `fr`).
* **`OWNER_IDS`**: A list of Discord User IDs that have administrative access to the bot.
  * Example: `OWNER_IDS=["123456789", "987654321"]`

### 🗃️ Database

* **`DATABASE_URL`**: The connection string for your database. Supports SQLite, PostgreSQL, and PGLite.
  * *See the Database section below for more details.*

---

## 🧠 Smart Database Detection

LavaMusic automatically detects which database you want to use based on the format of your `DATABASE_URL`.

| Format | Database Type | Description |
| :--- | :--- | :--- |
| *(Empty)* | **PGLite** | Recommended. File-based Postgres (No server needed). |
| `postgres://...` | **PostgreSQL** | Ideal for large-scale production bots. |
| `sqlite:./db.sqlite` | **SQLite** | Traditional file-based database. |

### 🐘 Why PGLite is the Default

We use **PGLite** because it offers the simplicity of a file (like SQLite) but uses the powerful **PostgreSQL** engine. This means you can start small and switch to a full Postgres server later without changing a single line of code.

---

## 🌋 Lavalink Configuration

The audio engine settings are located in `Lavalink/application.yml`. You can customize:

* **Password**: Ensure this matches the password in your `.env`.
* **Port**: Default is `2333`.
* **Sources**: Enable or disable specific platforms like SoundCloud or Twitch.

### 🧩 Adding More Sources (Spotify, YouTube, etc.)

To add support for Spotify or YouTube, you need the **[LavaSrc](https://github.com/topi314/LavaSrc)** plugin.

1. Download the plugin JAR.
2. Place it in the `plugins` folder of your Lavalink directory.
3. Restart Lavalink.

---

::: info NEED HELP?
If you're unsure about a specific setting, check the `.env.example` file for detailed comments or join our [Support Server](https://discord.gg/jgGEbxFbyM).
:::
