FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm install

COPY . .
RUN npm run build --workspace apps/backend

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm install --omit=dev --workspace apps/backend

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY apps/backend/.env.example ./apps/backend/.env

WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["node", "dist/main.js"]
