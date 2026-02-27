# Docker Deployment

Docker is the easiest way to get LavaMusic up and running with a single command. It handles all dependencies, databases, and networking for you.

---

## Prerequisites

Before starting, ensure you have the following installed:

* **[Docker](https://docs.docker.com/get-started/get-docker/)**
* **[Docker Compose](https://docs.docker.com/compose/install/)**

---

## Quick Start

### 1. Prepare Configuration

Copy the template files and fill in your bot token and other credentials in the `.env` file.

```bash
cp .env.example .env
cp Lavalink/example.application.yml Lavalink/application.yml
```

### 2. Launch with Profiles

LavaMusic uses **Docker Compose Profiles** so you can choose exactly what you need.

#### Standard Setup (Recommended)

This launches the **Bot**, a local **Lavalink node**, and uses **PGLite** for the database.

```bash
docker compose --profile lavalink up -d
```

#### Lightweight Setup

Use this if you are using an **external Lavalink node** (e.g., from a provider).

```bash
docker compose up -d
```

#### Full Production Setup

Runs the **Bot**, **Lavalink**, and a dedicated **PostgreSQL** database container.

```bash
docker compose --profile all up -d
```

---

## Maintenance

### Updating the Bot

To update to the latest version of LavaMusic, use the following commands:

```bash
docker compose pull
docker compose up -d --force-recreate
```

*Note: Make sure to use the same profiles (e.g., `--profile lavalink`) you used during the initial setup.*

---

## Technical Notes

### Persistence

The database data is stored in a volume named `lavamusic_data` by default. This ensures your playlists and settings are not lost when the container restarts.

### Environment Variables

Most configuration can be done directly in the `.env` file. Docker Compose will automatically inject these into the container environments.

::: info NEED HELP?
If you encounter any issues with Docker, feel free to join our [Support Server](https://discord.gg/jgGEbxFbyM) for assistance!
:::
