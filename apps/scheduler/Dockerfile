FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only necessary files for dependency installation
COPY package.json ./

# Copy lock file from monorepo root (needs to be available in build context)
# For monorepo support, this assumes the parent lock file is available
RUN pnpm install --frozen-lockfile --prod 2>/dev/null || npm install --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build || npm run build

# Expose port (not used, but good practice)
EXPOSE 3000

# Run scheduler
CMD ["node", "dist/index.js"]
