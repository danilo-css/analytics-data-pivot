FROM node:current-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

# Build the Next.js app
RUN npm run build

# Use a different port (e.g., 3002)
ENV PORT=3002
EXPOSE 3002

RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002 || exit 1

CMD ["npm", "start"]