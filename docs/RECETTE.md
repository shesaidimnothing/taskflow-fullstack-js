# Recette de la livraison

Exécutée le 5 octobre 2026 sur macOS, Node 22.20.0 et npm 11.6.2 depuis le dépôt local. Les résultats ci-dessous correspondent aux commandes réellement exécutées, pas à une liste de tests prévus.

| Vérification | Résultat |
| --- | --- |
| Installation propre `npm ci` | Réussie ; audit npm : 0 vulnérabilité signalée lors de cette installation |
| `npm run lint` | Réussi, aucune erreur |
| `npm test` | 37 tests Jest/Supertest réussis sur MongoDB temporaire |
| `npm run build` | Réussi, build React/Vite généré |
| `npm run test:persistence` | Réussi : compte et tâche relus après arrêt et redémarrage réels de l’API |
| `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` | 2 tests navigateur réussis, dont le parcours complet |
| `npm run setup` | Configuration locale créée avec une clé JWT aléatoire non versionnée |
| `npm run db:local` | MongoDB lancé sur 127.0.0.1:27017 avec stockage WiredTiger sur disque |
| `npm run dev` | Express sur 3000 et Vite sur 5173 démarrés |

## Checklist du livret

- [x] Source React/Express, variables d’environnement et modèles MongoDB.
- [x] Health exact, API importable sans démarrer un serveur.
- [x] Inscription 201, connexion 200, mot de passe haché et JWT signé.
- [x] Email normalisé, duplication 409, entrées invalides 400.
- [x] Absence de jeton, faux jeton et jeton expiré refusés sur les cinq opérations.
- [x] Liste du compte B séparée ; GET/PATCH/DELETE d’un objet A refusés avec 404.
- [x] id/ownerId et champs inconnus refusés en POST/PATCH.
- [x] Liste vide `{items:[]}`, création 201, lecture et édition 200.
- [x] PATCH partiel, champs facultatifs, échéance null, description vide.
- [x] Suppression 204 sans corps, lecture ultérieure 404.
- [x] Identifiant malformé 400 et identifiant absent 404.
- [x] Titre blanc/trop long, statut interdit, mauvais types et dates impossibles refusés.
- [x] Données conservées après redémarrage du processus API.
- [x] Interface : inscription, connexion, erreur de connexion, CRUD, confirmation et annulation de suppression.
- [x] Rechargement du navigateur avec conservation de la session et récupération des tâches.
- [x] Affichage à 390 pixels sans débordement horizontal sur les écrans contrôlés.
- [x] Navigation Tab initiale vers email, mot de passe et connexion ; focus visible défini en CSS.
- [x] Swagger s’affiche dans Chrome et propose l’authentification Bearer.
- [x] Inspection visuelle des captures desktop et mobile : texte lisible, aucun chevauchement constaté.
- [x] README, OpenAPI et trame d’oral disponibles.

## Preuves et reproduction

Les assertions détaillées figurent dans `backend/test/app.test.js`, `e2e/taskflow.spec.js` et `scripts/check-persistence.js`. Les captures locales générées par Playwright sont `.local/screenshots/connexion.png`, `taches-desktop.png` et `taches-mobile.png`. Elles utilisent uniquement des comptes de test fictifs dans une base temporaire supprimée après la suite.

Les tests API ne remplacent pas MongoDB par des objets simulés. Le test de reconnexion à MongoDB et le test d’arrêt complet d’Express sont deux vérifications différentes. Le test A/B conserve l’objet de A et vérifie qu’il n’a pas été modifié ou supprimé par B.

## Limites de la recette

Le parcours automatisé a été exécuté dans Chrome, pas dans Safari ou Firefox. Le contrôle clavier porte sur le début du formulaire ; il ne constitue pas une certification d’accessibilité. Docker et un hébergement cloud n’ont pas été exécutés. Les résultats de GitHub Actions sont consultables dans l’onglet Actions du dépôt ; les résultats chiffrés ci-dessus sont ceux de la recette locale. La persistance après redémarrage de MongoDB lui-même repose sur la configuration WiredTiger/volume ; le test automatisé de redémarrage porte sur Express.

Les dépendances affichent des avertissements de dépréciation pour ESLint 9 et une dépendance transitive glob. ESLint 9 est retenu pour la compatibilité avec eslint-plugin-react. Jest ESM utilise l’option expérimentale de Node. Ces avertissements n’ont pas fait échouer les contrôles ; les dépendances exactes sont gelées dans package-lock.json.

La soutenance, la validation du sujet par l’établissement et la remise sur une plateforme restent des actions à réaliser par l’étudiant. Aucun accord du formateur n’est supposé.
