FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json* ./
COPY server/package.json ./server/

RUN npm install --workspace=server --include=dev

COPY server ./server

WORKDIR /app/server
RUN npx prisma generate

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/server.js"]
