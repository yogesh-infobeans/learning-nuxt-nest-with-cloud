FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm install

COPY . .
RUN npm run build --workspace apps/frontend

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm install --omit=dev --workspace apps/frontend

COPY --from=builder /app/apps/frontend/.output ./apps/frontend/.output
WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
