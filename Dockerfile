# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY index.html ./
COPY src ./src

# Install dependencies and build
RUN npm ci && npm run build

# Build stage for server
FROM node:20-alpine AS server-builder

WORKDIR /app

# Copy server files
COPY server/package*.json ./
COPY server/tsconfig.json ./
COPY server/index.ts ./
COPY server/routes ./routes
COPY server/services ./services
COPY server/types ./types

# Install dependencies and build
RUN npm ci && npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy built server
COPY --from=server-builder /app/dist ./dist
COPY --from=server-builder /app/node_modules ./node_modules
COPY server/package.json ./

# Copy built frontend
COPY --from=frontend-builder /app/dist ./public

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
