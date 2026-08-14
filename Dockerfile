FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun run build

RUN chmod +x entrypoint.sh

CMD ["bun", "run", "start"]
