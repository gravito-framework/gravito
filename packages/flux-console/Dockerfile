FROM oven/bun:1
WORKDIR /app

# Copy built artifacts and package files
COPY package.json .
COPY dist ./dist
COPY src/client ./src/client

# Install only production dependencies
RUN bun install --production

# Expose port
EXPOSE 3000

# Start command
CMD ["bun", "run", "dist/bin.js"]
