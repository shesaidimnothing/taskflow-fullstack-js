# Où sont stockées les données ?

TaskFlow utilise MongoDB. En développement local, `npm run db:local` lance MongoDB avec le moteur WiredTiger et conserve ses fichiers dans **`.local/mongodb/`**, à la racine du dépôt. Le chemin est défini dans `scripts/local-mongo.js` et `.local/` est ignoré par Git (`.gitignore`) : les données restent sur cette machine et ne sont pas envoyées dans le dépôt.

Le dossier est caché car son nom commence par un point. Depuis la racine du projet, l'afficher dans le Finder avec `open .local/mongodb` ou dans un éditeur en ouvrant le dossier `.local`. Ses fichiers `.wt`, journaux et catalogues sont binaires ; ne pas les modifier à la main. Pour les consulter, utiliser le site, l'API ou les commandes de diagnostic ci-dessous. MongoDB doit être démarré.

## Consulter les tâches avec l'API

Se connecter pour obtenir un jeton, puis lister les tâches du compte :

```sh
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"TaskflowDemo123!"}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

curl -s http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

L'API renvoie uniquement les tâches du compte associé au jeton. Elle ne fournit volontairement aucune route pour lister les comptes de tous les utilisateurs.

## Diagnostic local de la base

Pour un diagnostic de développement seulement, on peut lire les comptes et tâches directement depuis MongoDB, sans afficher de hash de mot de passe :

```sh
node --input-type=module -e 'import mongoose from "mongoose"; import { User } from "./backend/src/models/User.js"; await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow"); console.log("Comptes:", JSON.stringify(await User.find({}, "email createdAt").lean(), null, 2)); await mongoose.disconnect();'
```

```sh
node --input-type=module -e 'import mongoose from "mongoose"; import { Task } from "./backend/src/models/Task.js"; await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow"); console.log("Tâches:", JSON.stringify(await Task.find({}, "title status priority dueDate ownerId createdAt").lean(), null, 2)); await mongoose.disconnect();'
```

Ces commandes affichent les enregistrements de la base configurée, y compris les tâches de tous les comptes locaux. Ne pas les utiliser sur une base de production ni partager leur sortie. Les tests automatisés utilisent des bases temporaires séparées. La variante Docker stocke ses données dans le volume `taskflow-data` défini dans `compose.yaml`.
