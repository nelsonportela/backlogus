# Multi-stage Dockerfile for BackLogus (Vue 3 + Fastify)
# 1. Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2. Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./

# 3. Copy frontend build into backend public dir
RUN mkdir -p /app/backend/public
COPY --from=frontend-build /app/frontend/dist /app/backend/public

# 4. Final production image
FROM node:20-alpine AS production
WORKDIR /app/backend
ENV NODE_ENV=production
COPY --from=backend-build /app/backend .
# Generate Prisma client for production
RUN npx prisma generate
# Expose Fastify port
EXPOSE 3001
CMD ["node", "src/index.js"]
