# Etap budowania
FROM node:20-alpine as builder

WORKDIR /app

# Kopiujemy pliki package*.json i tsconfig.json
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

# Instalujemy zależności
RUN npm ci

# Kopiujemy resztę plików
COPY . .

# Generujemy klienta Prisma i budujemy aplikację
RUN npx prisma generate
RUN npm run build

# Etap produkcyjny
FROM node:20-alpine

WORKDIR /app

# Kopiujemy pliki z etapu budowania
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Eksponujemy port 3000
EXPOSE 3000

# Uruchamiamy migracje i aplikację
CMD npx prisma migrate deploy && npm run start:prod 