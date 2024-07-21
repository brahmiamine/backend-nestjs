# Test Backend

## Description

Cette application est une API backend développée avec Nest.js. Elle inclut des fonctionnalités telles que l'inscription des utilisateurs, l'authentification, la gestion des utilisateurs, et plus encore. Elle suit les meilleures pratiques de développement en termes de sécurité, de maintenabilité et de testabilité.

## Table des matières

- [Installation](#installation)
- [Désinstallation](#désinstallation)
- [Dépendances](#dépendances)
- [Docker](#docker)
- [Endpoints](#endpoints)
- [Tests](#tests)
- [Configuration](#configuration)
- [Swagger](#swagger)
- [Technologies utilisées](#technologies-utilisées)

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) v14 ou supérieur
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

### Étapes

1. Clonez le repository :

    ```bash
    git clone https://github.com/brahmiamine/backend-nestjs.git
    ```

2. Installez les dépendances :

    ```bash
    pnpm install
    ```

3. Configurez les variables d'environnement. Créez un fichier `.env` à la racine du projet et ajoutez-y les variables suivantes :

    ```env
    DATABASE_HOST=localhost
    DATABASE_PORT=3306
    DATABASE_USER=root
    DATABASE_PASSWORD=yourpassword
    DATABASE_NAME=yourdatabase
    JWT_SECRET=yourjwtsecret
    JWT_EXPIRES_IN=3600s
    ```

4. Démarrez l'application avec Docker :

    ```bash
    docker-compose up --build
    ```

## Désinstallation

1. Arrêtez et supprimez les conteneurs Docker :

    ```bash
    docker-compose down
    ```

2. Supprimez le répertoire du projet :

    ```bash
    rm -rf votre-repository
    ```

## Dépendances

Le projet utilise les dépendances suivantes :

### Dépendances principales

- `@nestjs/common`
- `@nestjs/config`
- `@nestjs/core`
- `@nestjs/jwt`
- `@nestjs/passport`
- `@nestjs/platform-express`
- `@nestjs/swagger`
- `@nestjs/typeorm`
- `bcryptjs`
- `class-transformer`
- `class-validator`
- `ioredis`
- `mysql2`
- `nest-winston`
- `passport`
- `passport-jwt`
- `redis`
- `reflect-metadata`
- `rxjs`
- `swagger-ui-express`
- `typeorm`
- `winston`
- `zod`

### Dépendances de développement

- `@commitlint/cli`
- `@commitlint/config-conventional`
- `@nestjs/cli`
- `@nestjs/schematics`
- `@nestjs/testing`
- `@types/bcryptjs`
- `@types/express`
- `@types/jest`
- `@types/node`
- `@types/passport-jwt`
- `@types/supertest`
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- `eslint`
- `eslint-config-prettier`
- `eslint-plugin-prettier`
- `husky`
- `jest`
- `nodemon`
- `prettier`
- `source-map-support`
- `standard-version`
- `supertest`
- `ts-jest`
- `ts-loader`
- `ts-node`
- `tsconfig-paths`
- `typescript`

## Docker

### Construire et démarrer les conteneurs Docker

Pour construire et démarrer les conteneurs Docker, utilisez la commande suivante :

```bash
docker-compose up --build
```

### Arrêter les conteneurs Docker

Pour arrêter les conteneurs Docker, utilisez la commande suivante :

```bash
docker-compose down
```

## Endpoints

La documentation de l'API a été générée avec Bruno API Client. Pour consulter la documentation :

Ouvrez Bruno API Client.
Importez le fichier de collection Bruno fourni dans le projet (par exemple, bruno-collection.json).
Consultez les différentes requêtes et leurs détails.

### Authentification

- `POST /api/v1/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/v1/auth/login` : Connexion d'un utilisateur

### Utilisateurs

- `GET /api/v1/users/me` : Récupérer les informations de l'utilisateur courant
- `PATCH /api/v1/users/me` : Mettre à jour les informations de l'utilisateur courant
- `GET /api/v1/users` : Récupérer la liste des utilisateurs (admin uniquement)
- `DELETE /api/v1/users/:id` : Supprimer un utilisateur par ID (admin uniquement)

## Tests

Pour exécuter les tests unitaires et d'intégration, utilisez la commande suivante :

```bash
pnpm test
```

Pour exécuter les tests end-to-end, utilisez la commande suivante :

```bash
pnpm test:e2e
```

### Stratégie de tests

Les tests sont organisés en tests unitaires, d'intégration et end-to-end.

- **Unit tests** : Les tests unitaires vérifient les composants individuels. Ils sont définis dans les fichiers `*.spec.ts`.
- **Integration tests** : Les tests d'intégration vérifient l'interaction entre plusieurs composants. Ils sont également définis dans les fichiers `*.spec.ts`.
- **End-to-end tests** : Les tests end-to-end vérifient le comportement de l'application entière. Ils sont définis dans le répertoire `test`.

## Configuration

Les variables d'environnement sont définies dans le fichier `.env`. Voici un exemple de configuration :

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=yourdatabase
JWT_SECRET=yourjwtsecret
JWT_EXPIRES_IN=3600s
```

## Swagger

La documentation de l'API est générée avec Swagger. Pour accéder à la documentation, démarrez l'application et rendez-vous à l'URL suivante :

```
http://localhost:3000/api
```

## Technologies utilisées

- **Nest.js** : Framework de développement backend Node.js
- **TypeORM** : ORM pour TypeScript et JavaScript
- **MySQL** : Base de données relationnelle
- **Redis** : Base de données en mémoire utilisée pour le cache
- **Jest** : Framework de test JavaScript
- **Winston** : Bibliothèque de logging
- **Prettier** : Formatteur de code
- **ESLint** : Linter pour JavaScript et TypeScript
- **Commitlint** : Linter pour les messages de commit
- **Husky** : Outils pour les hooks Git
- **Changelog** : Génération automatique des fichiers changelog

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.