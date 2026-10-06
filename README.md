# TaskFlow

Dépôt individuel : https://github.com/shesaidimnothing/taskflow-fullstack-js (privé).

Projet Full Stack JS basé sur [titoms/devfullstack](https://github.com/titoms/devfullstack), commit de départ `6481ea6`, et sur le **LIVRET ETUDIANT V2**, version de travail du 24 septembre 2026. Sujet A : gérer ses tâches personnelles, avec un compte et des données privées.

Le projet réalise le MVP du livret : inscription, connexion, liste, création, détail, modification et suppression de tâches. Les bonus B1 à B4 ne sont pas revendiqués. Le choix TaskFlow suit l’ébauche déjà présente dans le dépôt. Les modalités institutionnelles encore provisoires dans le livret restent à confirmer auprès du formateur.

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

`npm run db:local` démarre un vrai processus MongoDB 7.0.14, géré par mongodb-memory-server, avec le moteur **WiredTiger et un dossier durable `.local/mongodb/`**. Malgré le nom de la bibliothèque, ce mode de développement conserve les données sur disque. Les tests emploient d’autres instances temporaires. Arrêter les processus avec Ctrl+C. Ne pas lancer deux bases sur le port 27017.

### Alternative Docker pour MongoDB

Avec Docker Engine démarré, remplacer `npm run db:local` par :

```sh
docker compose up -d mongo
```

Le volume `taskflow-data` conserve les données. `docker compose down` arrête la base ; ajouter `-v` effacerait le volume et ses données. Docker est une alternative fournie, le lancement vérifié sur cette machine utilise `npm run db:local`.

### Configuration

| Variable serveur | Rôle                                   | Valeur locale                      |
| ---------------- | -------------------------------------- | ---------------------------------- |
| PORT             | Port d’écoute Express                  | 3000                               |
| MONGODB_URI      | Connexion MongoDB                      | mongodb://127.0.0.1:27017/taskflow |
| JWT_SECRET       | Signature HS256, 32 caractères minimum | Générée par `npm run setup`        |

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
  components/Auth.jsx     inscription et connexion
  components/Dashboard.jsx liste, détail, formulaires, confirmation
  components/Account.jsx  informations du compte et changement de mot de passe
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

Exemple : React envoie `POST /api/tasks` avec un Bearer. Le middleware vérifie le JWT et le compte, le contrôleur appelle le service, le service valide les champs puis le modèle écrit dans MongoDB avec l’ownerId du compte authentifié. La réponse ne contient que l’identifiant public et les champs métier. Les documents du starter dans `docs/superpowers/` décrivent son état initial ; ils ne constituent pas le cahier des charges de cette version complète.

## Contrat API

| Méthode | Route              | Succès                         |
| ------- | ------------------ | ------------------------------ |
| GET     | /api/health        | 200, `{"status":"ok"}`         |
| POST    | /api/auth/register | 201, `{user:{id,email},token}` |
| POST    | /api/auth/login    | 200, `{user:{id,email},token}` |
| PATCH   | /api/auth/password | 204 sans corps                 |
| GET     | /api/tasks         | 200, `{items:[...]}`           |
| POST    | /api/tasks         | 201, tâche créée               |
| GET     | /api/tasks/:id     | 200, tâche                     |
| PATCH   | /api/tasks/:id     | 200, tâche modifiée            |
| DELETE  | /api/tasks/:id     | 204 sans corps                 |

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

Le dépôt conserve l’historique du starter et les commits de réalisation et de livraison. Obtenir le SHA exact avec `git rev-parse HEAD` et vérifier l’état avec `git status --short`. Le dépôt GitHub privé est créé à la demande de l’étudiant. Le tag `v1.0.0` identifie la version remise sur GitHub ; son SHA exact est obtenu avec `git rev-parse v1.0.0^{commit}`. La remise sur la plateforme de l’établissement, l’accès du correcteur, une archive éventuelle, la date de gel institutionnelle et le déploiement restent à fixer selon les consignes finales. Le caractère public du dépôt n’est pas imposé par le livret ; le correcteur devra disposer d’un accès à ce dépôt privé.

Limites : pas de pagination, de récupération de mot de passe, de confirmation d’email, de limitation des tentatives de connexion ni de collaboration entre comptes. Les bonus sont laissés de côté. Les polices Google sont facultatives : sans réseau, les polices système prennent le relais. La couverture clavier et mobile vérifiée ne constitue pas un audit d’accessibilité complet.
