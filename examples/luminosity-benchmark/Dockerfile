# Base image
FROM oven/bun:1.1 as base
WORKDIR /app

# Install dependencies
# We copy the root package.json and the workspace packages to simulate the monorepo structure
# In a real scenario, we might just copy the built package, but here we want to run the source
COPY package.json bun.lockb ./
COPY packages ./packages
COPY examples/luminosity-benchmark ./examples/luminosity-benchmark

# Install
RUN bun install

# Set working directory to the benchmark project
WORKDIR /app/examples/luminosity-benchmark

# Default command (can be overridden)
CMD ["bun", "run", "benchmark"]
