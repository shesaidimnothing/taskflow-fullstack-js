# Comparaison avec les consignes du professeur

Source : fichier `untitled.txt` placé sur le Bureau, lu le 7 octobre 2026. Les numéros incohérents et fragments d'interface issus de la transcription ne sont pas des exigences fonctionnelles. Ces consignes complètent le livret V2 ; elles ne changent ni le sujet TaskFlow ni le contrat API.

| Consigne | Version initiale | Modification réalisée |
| --- | --- | --- |
| Composant LoginPage, titre et formulaire email/password | Un seul composant Auth gérait les deux écrans | `frontend/src/pages/LoginPage.jsx` et route `/login` |
| Composant Registerpage avec formulaire | Variante du même composant Auth | `frontend/src/pages/Registerpage.jsx` et route `/register` ; nom conservé comme dans la consigne |
| Récupérer la saisie avec useState | Lecture du formulaire avec FormData à l'envoi | Chaque page possède un état email et password, relié aux champs par value/onChange |
| Navbar et utilisation de react-router-dom | Affichage conditionnel interne, sans routeur | `Navbar.jsx`, BrowserRouter, Routes/Route, Link/NavLink et Navigate |
| RouterLink et/ou Navigate | Aucun | Link/NavLink sont les composants de lien de React Router ; Navigate gère les redirections. Le composant nommé RouterLink n'est pas nécessaire |
| TaskList, TaskForm, TaskItem | Affichage et formulaire regroupés dans Dashboard | Trois composants dédiés ; TaskForm gère sa saisie, Dashboard coordonne les demandes et la sélection |
| Relier l'interface au backend avec fetch ou axios | Déjà fait avec fetch | Client `frontend/src/api.js` conservé pour l'authentification et le CRUD |
| Tests unitaires / fonctionnels / end to end | Tests API Jest/Supertest et parcours Playwright présents | Nouveau parcours de test pour les routes, l'historique et les sessions ; les tests fonctionnels API restent actifs |
| Validations et erreurs | Déjà présentes côté serveur et interface | Conservées après le découpage ; vérifiées par les tests |
| Endpoints documentés avec exemples, Swagger | Schémas et interface Swagger déjà présents | Exemples explicites pour les requêtes et réponses des routes auth, health et tâches |
| Bonus des sujets du PDF | Non réalisés | Restent facultatifs et non revendiqués ; aucune exigence nouvelle n'impose de les réaliser |

## Comportements vérifiés

- Les pages connexion et inscription disposent de leur propre URL et fonctionnent après rechargement direct.
- Une personne non connectée qui ouvre `/tasks` est redirigée vers `/login`.
- Une personne connectée ouvrant `/login` ou `/register` est redirigée vers `/tasks`.
- Le bouton Retour et le bouton Suivant du navigateur naviguent entre les pages.
- Une session rejetée par l'API est effacée et un message demande la reconnexion.
- La création et la modification partagent TaskForm ; ouvrir une nouvelle tâche ne reprend pas les valeurs de la précédente.
- Express sert aussi les adresses frontend `/login`, `/register` et `/tasks` après le build. Les routes API inconnues gardent une réponse JSON 404.

## Oral adapté

Le discours détaillé est dans `docs/oral/DISCOURS_10_MINUTES.md`, son source LaTeX dans `docs/oral/oral_taskflow.tex` et son PDF dans `output/pdf/oral_taskflow.pdf`. Il présente le besoin, les consignes, une démonstration, le fonctionnement général, les vérifications et les limites. Les détails de sécurité avancés sont réservés aux questions.

Référence de navigation : [documentation officielle React Router](https://reactrouter.com/start/declarative/routing).
