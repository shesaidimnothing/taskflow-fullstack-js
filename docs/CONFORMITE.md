# Correspondance au livret étudiant V2

Référence : version de travail du 24 septembre 2026, 15 pages, lue le 5 octobre 2026. Un seul sujet est réalisé : **TaskFlow**. Les obligations et formats suivent les pages 1 à 13 ; les modalités non arbitrées des pages 14 à 15 ne sont pas présentées comme définitives.

| TP | Réalisation / preuve |
| --- | --- |
| 1 - Initialisation | Workspaces frontend/backend, app.js distinct de server.js, health exact, .gitignore, backend/.env.example |
| 2 - Première route | Routes et contrôleurs réels ; l’étape pédagogique en mémoire est remplacée par la version MongoDB finale |
| 3 - Persistance | Modèle Task, cinq routes CRUD, dates réelles, test de redémarrage du processus |
| 4 - Comptes et JWT | Modèle User, bcrypt, email unique, routes register/login, middleware Bearer |
| 5 - Isolation | Filtres ownerId et tests A/B sur liste, GET, PATCH et DELETE |
| 6 - React | Inscription, connexion, liste, création, détail, édition, suppression confirmée, erreurs et chargement |
| 7 - Qualité | Séparation des couches, ESLint, build Vite |
| 8 - Tests | Jest/Supertest avec MongoDB temporaire ; test navigateur complémentaire |
| 9 - Documentation | README complet, Swagger et fichier OpenAPI, exploitation locale, workflow CI fourni |
| 10 - Recette | Résultats dans RECETTE.md, captures locales et contrôles automatiques |
| 11 - Remise | Historique du starter conservé, dépôt GitHub individuel privé, version identifiée par le tag v1.0.0 et son SHA ; dépôt sur la plateforme scolaire non effectué |
| 12 - Soutenance | Trame minutée, démonstration et questions dans SOUTENANCE.md ; présentation à réaliser personnellement |

Le dépôt de départ contenait une route de liste incomplète, sans protection de compte, et une propriété `deadline`. La version livrée utilise le champ contractuel `dueDate`, l’enveloppe `{items: [...]}`, les cinq méthodes et les erreurs prévues par le PDF. Le package cors importé mais non déclaré dans le starter est supprimé : le proxy Vite et le service du build sur la même origine suffisent.

Les commits des quatre journées de cours ne sont pas inventés rétrospectivement. Cette livraison correspond au travail effectué dans cette session, au-dessus de l’historique réel du dépôt source.
