FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy all source files
COPY backend ./backend
COPY contracts ./contracts

WORKDIR /app/backend

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "server.js"]
