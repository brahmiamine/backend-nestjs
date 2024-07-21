# TODO

## Éléments manquants


## Bonnes pratiques non appliquées


## Améliorations d'architecture et de conception envisagées

1. **Utilisation de GraphQL** :
   - Envisager l'utilisation de GraphQL pour les requêtes complexes et les agrégations de données.

2. **Microservices** :
   - Diviser l'application en microservices pour améliorer la scalabilité et la maintenabilité.

3. **Cache** :
   - Implémenter une couche de cache pour améliorer les performances des requêtes fréquentes.

4. **CQRS et Event Sourcing** :
   - Envisager l'implémentation du pattern CQRS (Command Query Responsibility Segregation) pour séparer les opérations de lecture et d'écriture.
   - Utiliser l'Event Sourcing pour capturer toutes les modifications d'état comme une séquence d'événements.

5. **Gestion des fichiers statiques** :
   - Utiliser un CDN (Content Delivery Network) pour la distribution des fichiers statiques.

6. **CI/CD** :
   - Mettre en place un pipeline CI/CD pour automatiser le déploiement et les tests.

7. **Architecture hexagonale** :
   - Envisager la migration vers une architecture hexagonale (ou ports et adapters) pour améliorer la maintenabilité et la testabilité du code. Cette architecture permet de séparer clairement la logique métier des infrastructures, rendant ainsi le système plus flexible et modulable.
   - Les composants principaux de l'architecture hexagonale sont :
     - **Domain** : Contient la logique métier et les règles de l'application.
     - **Application** : Orchestration des cas d'utilisation, interactions avec le domaine.
     - **Ports** : Interfaces définies par le domaine ou l'application pour interagir avec les services externes.
     - **Adapters** : Implémentations concrètes des ports, connectant l'application aux services externes (bases de données, API, etc.).
   - Cette architecture permettrait de :
     - Faciliter les tests unitaires et d'intégration en isolant la logique métier.
     - Améliorer la flexibilité en permettant de changer les implémentations des services externes sans affecter la logique métier.
     - Renforcer la séparation des préoccupations et la lisibilité du code.

