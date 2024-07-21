# Utiliser une image Node.js officielle comme image de base
FROM node:18-alpine

# Définir le répertoire de travail à l'intérieur du conteneur
WORKDIR /usr/src/app

# Copier les fichiers de configuration
COPY package.json pnpm-lock.yaml ./

# Installer PNPM
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install

# Copier le reste du code de l'application
COPY . .

# Construire l'application
RUN pnpm run build

# Exposer le port sur lequel l'application va écouter
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["pnpm", "start"]
