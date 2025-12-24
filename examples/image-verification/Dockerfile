# Stage 1: Builder
FROM oven/bun:1.1.18-debian as builder 
# Use a Debian-based Bun image for apt-get

# Install nodejs and npm
RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app

# Copy monorepo root files for Bun workspace recognition
# The docker-compose.yml sets context to the monorepo root (../..)
# So these paths are relative to the monorepo root.
COPY bun.lock ./
COPY package.json ./

# Create directories for packages and examples (optional, bun install might handle this)
# but explicitly creating ensures structure for COPY commands
RUN mkdir -p packages/plasma \
           packages/stream \
           packages/forge \
           packages/nebula \
           packages/core \
           packages/mass \
           examples/image-verification

# Copy individual package.json files for workspace packages
COPY packages/plasma/package.json packages/plasma/package.json
COPY packages/stream/package.json packages/stream/package.json
COPY packages/forge/package.json packages/forge/package.json
COPY packages/nebula/package.json packages/nebula/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/mass/package.json packages/mass/package.json
COPY examples/image-verification/package.json examples/image-verification/package.json

# Run bun install to resolve all dependencies (this will create node_modules)
RUN npm install --frozen-lockfile


# Copy all source code and build all packages
# This is a large copy, but done once in the builder stage
COPY . .
RUN bun run build # Build all workspace packages

# Stage 2: Runner
FROM oven/bun:1.1.18-debian
# Use a Debian-based Bun image for apt-get

WORKDIR /app

# Install runtime dependencies (e.g., imagemagick for forge)
RUN apt-get update && apt-get install -y imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled output (dist) for all used packages from builder
COPY --from=builder /app/packages/plasma/dist packages/plasma/dist
COPY --from=builder /app/packages/stream/dist packages/stream/dist
COPY --from=builder /app/packages/forge/dist packages/forge/dist
COPY --from=builder /app/packages/nebula/dist packages/nebula/dist
COPY --from=builder /app/packages/core/dist packages/core/dist
COPY --from=builder /app/packages/mass/dist packages/mass/dist

# Copy the example's source code and package.json for runtime
COPY --from=builder /app/examples/image-verification/src examples/image-verification/src
COPY --from=builder /app/examples/image-verification/package.json examples/image-verification/package.json
COPY --from=builder /app/examples/image-verification/test-process.ts examples/image-verification/test-process.ts

# Set environment variables for Redis connection
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV APP_KEY="base64:some_random_string_for_encryption"

# Command to run the application (the API server)
CMD ["bun", "run", "examples/image-verification/src/index.ts"]