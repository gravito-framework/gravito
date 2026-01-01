# Use the official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY packages/flux-console/package.json ./packages/flux-console/
COPY packages/stream/package.json ./packages/stream/
COPY packages/photon/package.json ./packages/photon/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Flux Console
WORKDIR /app/packages/flux-console
RUN bun run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["bun", "dist/bin.js"]
