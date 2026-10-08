# TaskFlow

Dépôt individuel : https://github.com/shesaidimnothing/taskflow-fullstack-js (privé).

Projet Full Stack JS basé sur [titoms/devfullstack](https://github.com/titoms/devfullstack), commit de départ `6481ea6`, et sur le **LIVRET ETUDIANT V2**, version de travail du 24 septembre 2026. Sujet A : gérer ses tâches personnelles, avec un compte et des données privées.

La version `v1.1.0` adapte également le frontend aux consignes du professeur reçues le 7 octobre 2026. La [comparaison détaillée](docs/CONSIGNES_PROF.md) décrit les changements.

Le projet réalise le MVP du livret : inscription, connexion, liste, création, détail, modification et suppression de tâches. Le bonus B1 (priorité et filtres) a été ajouté ensuite, sans modifier le contrat du MVP ; B2 à B4 ne sont pas réalisés. Le choix TaskFlow suit l’ébauche déjà présente dans le dépôt. Les modalités institutionnelles encore provisoires dans le livret restent à confirmer auprès du formateur.

## Démarrage rapide

Prérequis : Node.js **22.12 ou supérieur** (vérifié avec 22.20.0), npm 10 ou supérieur (vérifié avec 11.6.2), Internet pour installer les dépendances et télécharger MongoDB au premier lancement. Les commandes ci-dessous se lancent depuis la racine du dépôt.

```sh
npm ci
npm run setup
npm run db:local
```

Laisser ce premier terminal ouvert. Dans un deuxième terminal, depuis le même dossier :

```sh
npm run dev
```

Ouvrir **http://localhost:5173** et créer un compte. Aucun compte ni mot de passe de démonstration n’est imposé.

- Frontend : http://localhost:5173
- API santé : http://localhost:3000/api/health
- Swagger interactif : http://localhost:3000/api/docs/
- OpenAPI JSON : http://localhost:3000/api/openapi.json

`npm run setup` crée `backend/.env` avec une clé JWT aléatoire ; un fichier existant est conservé. Le modèle sans secret est [backend/.env.example](backend/.env.example). Ne pas mettre de clé JWT dans une variable `VITE_*`.

`npm run db:local` démarre un vrai processus MongoDB 7.0.14, géré par mongodb-memory-server, avec le moteur **WiredTiger et un dossier durable `.local/mongodb/`**. Malgré le nom de la bibliothèque, ce mode de développement conserve les données sur disque. Les tests emploient d’autres instances temporaires. Arrêter les processus avec Ctrl+C. Ne pas lancer deux bases sur le port 27017. Le dossier `.local/mongodb/` contient des fichiers binaires MongoDB : ils ne se lisent pas à la main. Les procédures pour consulter les tâches par l’API et inspecter les enregistrements de développement sont dans [docs/DONNEES.md](docs/DONNEES.md).

### Alternative Docker pour MongoDB

Avec Docker Engine démarré, remplacer `npm run db:local` par :

```sh
docker compose up -d mongo
```

Le volume `taskflow-data` conserve les données. `docker compose down` arrête la base ; ajouter `-v` effacerait le volume et ses données. Docker est une alternative fournie, le lancement vérifié sur cette machine utilise `npm run db:local`.

### Configuration

| Variable serveur | Rôle | Valeur locale |
| --- | --- | --- |
| PORT | Port d’écoute Express | 3000 |
| MONGODB_URI | Connexion MongoDB | mongodb://127.0.0.1:27017/taskflow |
| JWT_SECRET | Signature HS256, 32 caractères minimum | Générée par `npm run setup` |

Le fichier `.env` est lu depuis le dossier de travail du backend. Utiliser les scripts npm documentés pour conserver ce comportement. Si PORT change, adapter aussi la cible du proxy dans `frontend/vite.config.js`. Les ports 3000, 5173 et 27017 doivent être disponibles. Les tests navigateur et de redémarrage utilisent 3100 et 3101.

## Commandes

```sh
npm run dev --workspace backend
npm run dev --workspace frontend
npm run lint
npm test
npm run build
npm run check
npm run test:persistence
```

Les deux premières commandes permettent de lancer séparément Express et Vite. `check` enchaîne lint, tests API et build. `npm test` télécharge MongoDB au premier passage si nécessaire et lance Jest/Supertest sur une base temporaire isolée ; aucune base de développement n’est nettoyée.

Tests de bout en bout :

```sh
npx playwright install chromium
npm run test:e2e
```

Sur cette machine, Chrome installé a été utilisé avec `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`. La suite crée sa propre base et son propre serveur, teste le build réel, puis les arrête. Les captures sont dans `.local/screenshots/`. Le test de persistance démarre l’API, crée une tâche, arrête le processus Node, le relance et relit la tâche avec le même JWT.

## Production locale et préparation au déploiement

```sh
npm run build
npm start
```

MongoDB doit rester actif. Express sert alors l’interface compilée sur **http://localhost:3000**, l’API et Swagger sur la même origine. `npm start` ne lance pas Vite. En développement, Vite relaie `/api` vers Express ; aucun CORS permissif n’est nécessaire.

Pour un hébergement : installer les dépendances, construire le front, renseigner PORT/MONGODB_URI/JWT_SECRET côté serveur, fournir une base MongoDB persistante et démarrer avec `npm start`. Utiliser HTTPS via l’hébergeur ou un reverse proxy et protéger l’accès réseau à MongoDB. Le dépôt ne contient pas d’identifiants cloud. Aucun déploiement public n’a été effectué ; son obligation et la plateforme ne sont pas fixées dans le livret.

## Architecture

```text
frontend/src/
  App.jsx                 session et structure générale
  api.js                  appels HTTP et erreurs API
  pages/LoginPage.jsx     connexion et champs contrôlés avec useState
  pages/Registerpage.jsx  inscription et champs contrôlés avec useState
  components/Navbar.jsx   navigation avec React Router
  components/AccountMenu.jsx menu utilisateur conservé
  components/Account.jsx  profil et changement de mot de passe
  components/AuthLayout.jsx mise en page commune des pages publiques
  components/Dashboard.jsx coordination du CRUD et de la sélection
  components/TaskList.jsx liste des tâches
  components/TaskItem.jsx présentation d’une tâche
  components/TaskForm.jsx formulaire de création et de modification
  taskUtils.js            libellés et affichage des dates
backend/src/
  app.js                  application Express importable sans écouter un port
  server.js               configuration, MongoDB et écoute HTTP
  routes/                 chemins et middleware de connexion
  controllers/            requêtes/réponses HTTP
  services/               logique métier et requêtes limitées au propriétaire
  models/                 schémas Mongoose User et Task
  middleware/             vérification JWT et erreurs communes
  utils/validation.js     validation stricte des entrées
backend/test/             Jest + Supertest
e2e/                      parcours navigateur Playwright
scripts/                  configuration, MongoDB local et vérification de persistance
docs/                     OpenAPI, recette, soutenance et correspondance au livret
```

Exemple : React envoie `POST /api/tasks` avec un Bearer. Le middleware vérifie le JWT et le compte, le contrôleur appelle le service, le service valide les champs puis le modèle écrit dans MongoDB avec l’ownerId du compte authentifié. La réponse ne contient que l’identifiant public et les champs métier.

## Contrat API

| Méthode | Route | Succès |
| --- | --- | --- |
| GET | /api/health | 200, `{"status":"ok"}` |
| POST | /api/auth/register | 201, `{user:{id,email},token}` |
| POST | /api/auth/login | 200, `{user:{id,email},token}` |
| PATCH | /api/auth/password | 204 sans corps, changement de mot de passe authentifié |
| GET | /api/tasks | 200, `{items:[...]}` |
| POST | /api/tasks | 201, tâche créée |
| GET | /api/tasks/:id | 200, tâche |
| PATCH | /api/tasks/:id | 200, tâche modifiée |
| DELETE | /api/tasks/:id | 204 sans corps |

Les cinq routes métier nécessitent `Authorization: Bearer <JWT>`. Swagger permet de s’inscrire ou se connecter, de copier le token retourné dans **Authorize**, puis d’essayer les routes. La description complète se trouve dans [docs/openapi.json](docs/openapi.json).

Exemple de corps de création :

```json
{
  "title": "Préparer la démo",
  "status": "todo",
  "description": "Revoir le parcours complet",
  "dueDate": "2026-10-05"
}
```

`title` est trimé et contient 1 à 120 caractères. `status` est obligatoirement `todo`, `doing` ou `done`. `description` est facultative, accepte la chaîne vide et reste limitée à 1000 caractères. `dueDate` est facultative, vaut `null` ou une date civile réelle YYYY-MM-DD. Elle est stockée en chaîne pour préserver le jour civil sans décalage de fuseau ; le rendu utilise UTC. Les années vont de 0001 à 9999. Les POST sans titre/statut, PATCH vides, champs inconnus, `id`, `ownerId`, opérateurs MongoDB et mauvais types sont refusés.

### Bonus B1 : priorité, filtres et tri

Réalisé après le MVP, sans changer les cinq routes ni les champs obligatoires : un POST avec seulement `title` et `status` fonctionne toujours.

- Champ `priority` facultatif : `low`, `medium` ou `high`, `medium` par défaut. Il est renvoyé dans chaque tâche (propriété supplémentaire non sensible, autorisée par le contrat) et modifiable par PATCH. Toute autre valeur donne 400.
- `GET /api/tasks` accepte des filtres facultatifs et combinables : `status`, `priority`, `dueFrom` et `dueTo` (dates incluses, AAAA-MM-JJ ; une tâche sans échéance est alors exclue) et `sort` (`createdAt` par défaut, `dueDate` avec les tâches sans échéance en dernier, ou `priority` de high à low). Exemple : `GET /api/tasks?status=todo&priority=high&sort=dueDate`.
- Les filtres s’appliquent toujours en plus du filtre `ownerId` : ils ne permettent jamais de voir les tâches d’un autre compte. Un paramètre inconnu, répété ou invalide, ou `dueFrom` après `dueTo`, donne 400/INVALID_INPUT.
- Côté React : priorité dans le formulaire, badges sur les cartes, boutons de statut, listes déroulantes priorité/échéance/tri et compteur de tâches. Les choix « Échéance passée », « Aujourd’hui » et « 7 prochains jours » sont calculés avec la date locale du navigateur puis envoyés en `dueFrom`/`dueTo`.
- Tests dédiés dans `backend/test/app.test.js` (bloc « bonus B1 ») : valeur par défaut, validation, chaque filtre, combinaisons, tris, isolation A/B et filtres invalides.

Les erreurs ont toujours la forme `{"error":{"code":"INVALID_INPUT","message":"Message lisible"}}` : 400/INVALID_INPUT, 401/UNAUTHORIZED, 404/NOT_FOUND, 409/EMAIL_ALREADY_USED. Les erreurs inattendues donnent 500/INTERNAL_ERROR sans trace ni secret.

## Sécurité et choix expliqués

- Email trimé, normalisé en minuscules et index unique MongoDB ; une collision d’index retourne 409.
- Mots de passe hachés avec bcrypt, coût 12, jamais retournés. Au moins 8 caractères à l’inscription. Une limite supplémentaire de 72 octets UTF-8 évite la troncature silencieuse de bcrypt.
- JWT signé en HS256, durée d’une heure. La clé vient uniquement de l’environnement serveur. Signature, expiration, sujet et existence du compte sont vérifiés.
- Le navigateur conserve la session dans `sessionStorage` : elle survit au rechargement dans l’onglet. Se déconnecter efface la copie locale ; un 401 renvoie à la connexion. Ce stockage reste accessible au JavaScript : une faille XSS pourrait lire le jeton. React échappe le texte, Helmet définit des en-têtes de protection, mais ce choix ne remplace pas une prévention XSS complète.
- Un JWT déjà copié reste valide jusqu’à son expiration même après déconnexion : pas de liste de révocation ni de refresh token dans ce MVP.
- Toutes les lectures, mises à jour et suppressions filtrent par `_id` **et** `ownerId`. Retourner 404 pour une ressource d’un autre compte évite d’en confirmer l’existence.
- La liste filtre par ownerId ; le client ne peut jamais sélectionner son propriétaire. La validation serveur protège aussi contre des requêtes HTTP qui contournent React.

## Outils de construction et CI/CD

Vite fournit le serveur de développement, le rechargement rapide, le proxy API et la construction des fichiers du navigateur. Babel est un outil de transformation JavaScript/JSX ; le plugin React de Vite peut l’utiliser, notamment en développement. Webpack est un autre bundler possible : il n’est pas installé dans ce projet, car Vite fournit déjà la chaîne de build. Un bundler assemble les modules et prépare les fichiers distribués ; il ne remplace pas le serveur Express.

Le workflow `.github/workflows/ci.yml` exécute `npm ci`, lint, Jest/Supertest, build, test de redémarrage et Playwright. Ces vérifications sont déclenchées sur GitHub à chaque push ou pull request. Leur statut est consultable dans [GitHub Actions](https://github.com/shesaidimnothing/taskflow-fullstack-js/actions). Un déploiement CD pourrait venir après ces contrôles.

## Recette, soutenance et remise

- [Déroulé et préparation de soutenance](docs/SOUTENANCE.md)
- [Discours détaillé de 10 minutes](docs/oral/DISCOURS_10_MINUTES.md)
- [Source LaTeX autonome](docs/oral/oral_taskflow.tex) et [PDF de préparation](output/pdf/oral_taskflow.pdf)
- [Comparaison des consignes du professeur](docs/CONSIGNES_PROF.md)

Le dépôt conserve l’historique du starter et les commits de réalisation et de livraison. Obtenir le SHA exact avec `git rev-parse HEAD` et vérifier l’état avec `git status --short`. Le dépôt GitHub privé est créé à la demande de l’étudiant. Le tag `v1.0.0` conserve la livraison initiale ; `v1.1.0` identifie la version adaptée aux consignes du professeur. Son SHA exact est obtenu avec `git rev-parse v1.1.0^{commit}`. La remise sur la plateforme de l’établissement, l’accès du correcteur, une archive éventuelle, la date de gel institutionnelle et le déploiement restent à fixer selon les consignes finales. Le caractère public du dépôt n’est pas imposé par le livret ; le correcteur devra disposer d’un accès à ce dépôt privé.

Limites : pas de pagination, de récupération de mot de passe, de confirmation d’email, de limitation des tentatives de connexion ni de collaboration entre comptes. Seul le bonus B1 est réalisé ; le tri par priorité est fait en JavaScript après la requête, ce qui convient tant que la liste n’est pas paginée. Les polices Google sont facultatives : sans réseau, les polices système prennent le relais. La couverture clavier et mobile vérifiée ne constitue pas un audit d’accessibilité complet.

## Navigation React et support oral

`BrowserRouter` associe les routes `/login`, `/register`, `/tasks` et `/account` aux pages de l'application. La navbar utilise `Link` et `NavLink` ; `Navigate` renvoie vers la page adaptée à la session. Cette protection frontend améliore le parcours mais ne remplace pas les contrôles JWT et ownerId dans l'API. Les vues de détail, d'édition et de suppression restent des états internes de l'espace `/tasks`.

Le LaTeX de l'oral est autonome, sans images ni chemins de fichiers locaux. Sur Overleaf, importer `docs/oral/oral_taskflow.tex` et choisir pdfLaTeX ou XeLaTeX. Avec une distribution LaTeX locale :

```sh
pdflatex -output-directory=output/pdf docs/oral/oral_taskflow.tex
```

Le PDF fourni est compilé avec Tectonic (moteur XeTeX). Le discours compte environ 1 200 mots et réserve du temps aux manipulations ; répéter avec un chronomètre pour ajuster le rythme aux dix minutes.

La page Mon compte et le menu utilisateur ajoutés à distance ont été conservés lors de l’intégration. `/account` permet de consulter le profil et de modifier son mot de passe avec le mot de passe actuel. Cela ne remplace pas une récupération de mot de passe oublié.

## Calendrier des tâches

Dans l'espace des tâches, le bouton **Calendrier** ouvre une vue mensuelle ou une grille annuelle inspirée des contributions GitHub. Les cinq nuances de vert représentent 0, 1, 2, 3 à 4 et 5 tâches ou plus, selon leur date d'échéance. Les tâches terminées restent comptées : la couleur indique la charge planifiée, pas un historique des dates de réalisation.

Cliquer sur un jour affiche les tâches prévues et leur progression. Les boutons **Terminer** et **À reprendre** enregistrent le statut via l'API ; ouvrir une tâche permet aussi de modifier son échéance ou de la supprimer. **Sans échéance** regroupe les tâches non planifiées. Le calendrier affiche toutes les tâches du compte, indépendamment des filtres de la liste. La grille annuelle défile horizontalement sur mobile.
