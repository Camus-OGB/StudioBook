# ---- Étape 1 : build (contient toutes les dépendances + la CLI Prisma) ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Étape 2 : image finale minimale (sortie standalone) ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Le serveur standalone écoute sur cette interface/ce port
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copie uniquement le nécessaire à l'exécution (image ~5-10× plus petite)
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Exécution en utilisateur non-root
USER node

EXPOSE 3000
CMD ["node", "server.js"]
