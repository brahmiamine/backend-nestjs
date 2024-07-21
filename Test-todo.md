# Stratégie de Tests

## Objectifs de Tests

L'objectif de ces tests est de garantir que toutes les fonctionnalités de l'application fonctionnent correctement et que les différentes composantes interagissent comme prévu. Les tests incluent des tests unitaires, des tests d'intégration, et des tests de bout en bout.

## Types de Tests

1. **Tests Unitaires** : Vérifient le bon fonctionnement de chaque unité de code isolée.
2. **Tests d'Intégration** : Vérifient les interactions entre plusieurs unités de code.
3. **Tests de Bout en Bout (E2E)** : Vérifient l'application du point de vue de l'utilisateur final.

## Cadre de Tests

- **Jest** : Utilisé pour les tests unitaires et d'intégration.
- **Supertest** : Utilisé pour tester les points de terminaison HTTP dans les tests d'intégration.
- **Testing Module de NestJS** : Utilisé pour créer des modules de test avec NestJS.

## Mise en Œuvre

### Tests Unitaires

#### AuthService

- **Méthode `register`** :
  - Doit créer un nouvel utilisateur et retourner un jeton d'accès.
  - Doit lancer une `ConflictException` si l'utilisateur existe déjà.
  - Doit lancer une `BadRequestException` en cas d'erreur.

- **Méthode `login`** :
  - Doit retourner un jeton JWT pour des informations d'identification valides.
  - Doit lancer une `UnauthorizedException` pour des informations d'identification invalides.

#### UsersService

- **Méthode `findOne`** :
  - Doit retourner un utilisateur s'il est trouvé.
  - Doit lancer une `NotFoundException` si l'utilisateur n'est pas trouvé.

- **Méthode `update`** :
  - Doit mettre à jour et retourner l'utilisateur.

- **Méthode `remove`** :
  - Doit supprimer l'utilisateur.
  - Doit lancer une `NotFoundException` si l'utilisateur n'est pas trouvé.

### Tests d'Intégration

#### AuthController

- **Route `register`** :
  - Doit enregistrer un nouvel utilisateur et retourner un jeton d'accès.
  - Doit lancer une `ConflictException` si l'utilisateur existe déjà.

- **Route `login`** :
  - Doit authentifier un utilisateur et retourner un jeton JWT.
  - Doit lancer une `UnauthorizedException` pour des informations d'identification invalides.

#### UsersController

- **Route `getMe`** :
  - Doit retourner les informations de l'utilisateur courant.

- **Route `updateMe`** :
  - Doit mettre à jour et retourner les informations de l'utilisateur courant.

- **Route `findAll`** :
  - Doit retourner une liste d'utilisateurs pour les administrateurs.

- **Route `remove`** :
  - Doit supprimer un utilisateur et retourner un message de succès.
  - Doit lancer une `NotFoundException` si l'utilisateur n'est pas trouvé.

## Ordre d'Exécution des Tests

1. **Tests Unitaires** :
   - AuthService
     - `register`
     - `login`
   - UsersService
     - `findOne`
     - `update`
     - `remove`
  
2. **Tests d'Intégration** :
   - AuthController
     - `register`
     - `login`
     - `logout`
   - UsersController
     - `getMe`
     - `updateMe`
     - `findAll`
     - `remove`

## Commandes pour Exécuter les Tests

### Tests Unitaires
```sh
pnpm test
