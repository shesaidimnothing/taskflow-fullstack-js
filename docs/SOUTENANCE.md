# Soutenance TaskFlow - trame de 10 minutes

Ce document sert à préparer l’oral. Refaire la démonstration et relire les fichiers cités avant le passage, puis reformuler avec ses propres mots.

## 0:00 à 1:00 - Présenter le besoin

« TaskFlow permet de garder ses tâches au même endroit et de suivre leur avancement. Le principe est simple : je crée un compte, j’ajoute une tâche et je la fais passer de “à faire” à “en cours”, puis à “terminée”. Chaque compte possède son propre espace. Le sujet correspond au MVP TaskFlow du livret. »

Montrer l’écran de connexion, puis annoncer les trois couches : React, Express et MongoDB. Préciser que les bonus ne sont pas présentés comme réalisés.

## 1:00 à 3:00 - Expliquer l’architecture

Ouvrir `backend/src/routes/taskRoutes.js`, le contrôleur et `services/taskService.js`.

« Quand j’enregistre une tâche, React envoie une requête HTTP en JSON. Elle contient aussi le JWT dans l’en-tête Authorization. Express commence par vérifier le jeton. Le contrôleur récupère la demande, puis le service contrôle les champs et appelle le modèle Mongoose. MongoDB conserve la tâche. L’API renvoie un objet avec un champ id, et React met à jour l’écran. »

« J’ai séparé ces responsabilités pour pouvoir retrouver rapidement une règle de validation ou une requête à la base. `app.js` crée l’application sans ouvrir de port, ce qui permet de la tester directement. `server.js` connecte la base et démarre le serveur. »

## 3:00 à 6:00 - Faire la démonstration

1. Créer un compte de démonstration neuf, sans donnée personnelle.
2. Ajouter « Préparer la présentation », statut à faire, description et échéance.
3. Ouvrir le détail : cela appelle bien GET par id.
4. Modifier le statut en « en cours », puis recharger la page.
5. Montrer que la tâche est toujours disponible.
6. Déclencher une suppression, l’annuler, puis confirmer la suppression.
7. Recréer une tâche à conserver pour l’essai d’isolation.

Préparer les deux terminaux avant l’oral pour éviter de télécharger les dépendances pendant la présentation. Si nécessaire, montrer `npm run test:persistence` plutôt que passer trop longtemps à redémarrer manuellement l’API.

## 6:00 à 8:00 - Expliquer sécurité et validation

« Le mot de passe n’est pas stocké en clair : bcrypt produit un hash. Lors de la connexion, on compare le mot de passe fourni avec ce hash. Le serveur signe ensuite un JWT valable une heure. Un JWT est signé, pas chiffré : il ne faut donc pas y mettre de mot de passe. »

« Le propriétaire d’une tâche vient du jeton vérifié. Il ne vient jamais d’un champ envoyé par le formulaire. Pour consulter ou modifier un objet, la requête MongoDB contient à la fois son identifiant et celui du compte. Si B tente de consulter une tâche de A, il reçoit 404. »

Ouvrir un autre contexte de navigateur pour B, ou utiliser Swagger avec le jeton B. Une deuxième fenêtre privée ou un navigateur distinct évite les confusions de session.

« Les validations React aident l’utilisateur, mais les vraies règles sont aussi dans l’API. Par exemple, un statut archived ou la date 2026-02-29 donne 400. Le serveur rejette également ownerId envoyé dans le JSON. »

## 8:00 à 9:00 - Montrer un test et la documentation

Ouvrir le test « isolation A/B » dans `backend/test/app.test.js`. Expliquer les étapes : A crée, B tente GET/PATCH/DELETE, les trois réponses sont 404, puis A retrouve son objet intact. Montrer le résultat de `npm test` et Swagger à `/api/docs/`.

« Les tests utilisent une instance MongoDB temporaire indépendante. Ils peuvent donc créer et nettoyer leurs données sans toucher à mes tâches de développement. Le test Playwright vérifie aussi le parcours dans un vrai navigateur. »

## 9:00 à 10:00 - Présenter les limites

« Le MVP fonctionne, mais ce n’est pas un service prêt pour une grande audience. Il manque par exemple la récupération de mot de passe, la limitation des tentatives de connexion et la pagination. Le jeton est dans sessionStorage : c’est simple pour ce projet, mais il reste exposé si une faille XSS permet d’exécuter du JavaScript. Je commencerais par renforcer ces points avant d’ajouter les bonus. »

Terminer sur ce qui a été vérifié : parcours CRUD, séparation des comptes, validations, persistance, lint, tests et build. Ne pas annoncer de déploiement public ou d’Actions GitHub exécutées si cela n’a pas été fait.

## Questions à savoir expliquer

**401 ou 404 ?** 401 signifie que l’authentification est absente ou refusée. 404 signifie que la ressource demandée n’est pas accessible au compte authentifié, soit parce qu’elle n’existe pas, soit parce qu’elle appartient à quelqu’un d’autre.

**Pourquoi stocker dueDate en chaîne ?** C’est une date civile, pas un instant précis. La chaîne YYYY-MM-DD évite de décaler le jour en changeant de fuseau. La validation vérifie aussi l’existence de la date.

**Que se passe-t-il au redémarrage ?** Les données sont dans MongoDB, pas dans un tableau Node. Redémarrer Express conserve les utilisateurs et les tâches. En développement, le lancement MongoDB fourni écrit aussi sur disque.

**Que protège la signature JWT ?** Elle permet au serveur de détecter une modification du jeton. Les données du jeton restent lisibles. La clé de signature ne va jamais dans React.

**Pourquoi 204 après DELETE ?** Le contrat demande un succès sans corps de réponse ; le client ne tente donc pas de lire du JSON pour ce statut.

**Pourquoi bcrypt limite-t-il le mot de passe ?** Au-delà de 72 octets, bcrypt peut ignorer une partie de la valeur. L’application refuse donc ces entrées au lieu d’accepter silencieusement deux mots de passe équivalents.

**Pourquoi le front ne suffit-il pas pour sécuriser les données ?** Un client peut appeler l’API sans passer par les boutons et formulaires. Les droits doivent donc être vérifiés côté serveur à chaque opération.

**Quelle aide a été utilisée ?** Consulter `ASSISTANCE.md` et présenter honnêtement le rôle de l’outil, les vérifications réalisées et ce que l’on comprend personnellement.
