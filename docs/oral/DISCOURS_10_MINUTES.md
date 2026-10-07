# TaskFlow - Discours de 10 minutes

Version adaptée au fichier du professeur `untitled.txt`, le 7 octobre 2026. Les durées comprennent la parole et les manipulations.

## 1. Le sujet et le besoin (0:00 à 1:00)

Bonjour, je vais vous présenter TaskFlow. C'est une application qui permet de gérer ses tâches personnelles. Parmi les trois sujets proposés dans le livret, le projet correspond au sujet A. L'objectif est de retrouver au même endroit ce qu'on doit faire et de suivre son avancement.

Par exemple, pour préparer une présentation, on peut créer une tâche, ajouter quelques indications et prévoir une échéance. Ensuite, on fait évoluer son statut de « à faire » à « en cours », puis à « terminée ». Chaque utilisateur possède son propre compte et sa propre liste.

La présentation va suivre le parcours d'une personne qui utilise l'application. Je vais d'abord expliquer comment les consignes du professeur ont été prises en compte, puis faire une démonstration. Je terminerai par les vérifications réalisées et les limites de cette version.

**À montrer :** Afficher la page de connexion. Annoncer le sujet A et le besoin utilisateur.

## 2. Les consignes et les changements (1:00 à 2:30)

Les consignes du professeur demandent d'abord deux pages distinctes : une pour se connecter et une pour créer un compte. Chacune doit contenir un titre et un formulaire avec un email et un mot de passe. Dans la première version, ces deux fonctions étaient regroupées dans un même composant. Elles sont maintenant séparées dans LoginPage et Registerpage.

Autre point demandé : récupérer ce que l'utilisateur écrit avec useState. Concrètement, la valeur de chaque champ est suivie par React au fur et à mesure de la saisie, puis envoyée au serveur quand le formulaire est validé. Cela rend le fonctionnement des formulaires plus clair par rapport à l'exercice.

La navigation a aussi été revue. Une barre de navigation permet de passer de la connexion à l'inscription. React Router gère les pages et leurs adresses. On peut ouvrir directement une page ou utiliser le bouton Retour du navigateur. Si on n'est pas connecté, l'espace des tâches renvoie vers la connexion.

Enfin, l'interface métier est découpée en trois composants : TaskList affiche la liste, TaskItem affiche une tâche et TaskForm sert à la créer ou la modifier. L'objectif n'est pas d'ajouter des écrans inutiles : c'est de donner un rôle précis à chaque partie, comme demandé dans les consignes.

**À montrer :** Passer de Connexion à Inscription avec la navbar. Si nécessaire, montrer brièvement les noms des composants, sans ouvrir leur code ligne par ligne.

## 3. Utiliser TaskFlow (2:30 à 5:30)

Je vais maintenant montrer le parcours complet. Je commence par créer un compte de démonstration. Je renseigne une adresse email et un mot de passe. Une fois le compte créé, j'arrive dans mon espace. La liste est vide puisque je n'ai encore ajouté aucune tâche.

Je crée une première tâche intitulée « Préparer la présentation ». Je peux préciser ce que je veux faire dans la description et ajouter une échéance. Je laisse le statut sur « à faire », puis j'enregistre. La tâche apparaît dans la liste avec les informations utiles, ce qui permet de comprendre rapidement où j'en suis.

En cliquant dessus, j'ouvre le détail. Je peux relire sa description, puis la modifier. Ici, je vais la passer en « en cours ». Après l'enregistrement, le nouveau statut apparaît. Je recharge aussi la page : la tâche est toujours là, avec la modification qui vient d'être faite.

Pour la suppression, l'application demande une confirmation. Je peux annuler si je me suis trompé. Si je confirme, la tâche disparaît de ma liste. Cela couvre les actions principales demandées : créer, consulter, modifier et supprimer.

Je termine en montrant le compte B, préparé dans un autre navigateur. Sa liste ne contient pas les tâches du compte A. Chaque personne retrouve donc son propre espace. Je vais maintenant expliquer simplement comment l'application conserve ces informations et contrôle les accès.

**À montrer :** Prévoir environ deux minutes de manipulations : inscription ; création ; détail ; modification ; rechargement ; suppression annulée puis confirmée ; affichage du compte B. Garder une seconde tâche de A pour illustrer la séparation des listes.

## 4. Les données et la protection des comptes (5:30 à 7:00)

L'application repose sur trois parties. React correspond à ce qu'on voit dans le navigateur. Express reçoit les demandes et applique les règles. MongoDB conserve les comptes et les tâches. Quand on enregistre une tâche, l'interface envoie une demande au serveur avec fetch, puis affiche la réponse obtenue.

L'intérêt de la base de données, c'est que les tâches ne sont pas seulement présentes dans la page ouverte. Elles restent enregistrées quand on recharge le navigateur ou quand l'API redémarre. Un test spécifique vérifie d'ailleurs ce deuxième cas.

Pour les comptes, le mot de passe n'est pas conservé en clair. Le serveur stocke une empreinte calculée avec bcrypt. Après une connexion réussie, il remet un jeton qui permet de reconnaître l'utilisateur pendant ses prochaines demandes.

Mais être connecté ne donne pas accès à toutes les tâches. Le serveur vérifie aussi à qui appartient chaque donnée. Le contrôle se fait donc côté serveur, même si quelqu'un contourne les boutons de l'interface. Les erreurs de saisie sont également vérifiées : par exemple, un titre vide ou une date impossible sont refusés.

**À montrer :** Rester sur l'application. Un schéma oral suffit : navigateur, serveur, base de données. La cryptographie et les requêtes MongoDB peuvent être réservées aux questions.

## 5. Les vérifications et la documentation (7:00 à 8:30)

Pour vérifier que l'application ne fonctionne pas seulement dans un cas idéal, plusieurs contrôles sont prévus. Les tests API vérifient les opérations sur les tâches, les données invalides et les problèmes de connexion. Ils vérifient aussi que le compte B ne peut pas lire, modifier ou supprimer une tâche appartenant à A.

La suite API compte 37 tests. Trois tests de parcours dans un navigateur complètent ces contrôles. Ils vérifient notamment les formulaires, les modifications de tâches et l'affichage sur mobile. Le nouveau test ajouté pour les consignes vérifie la navigation, les liens directs, le retour en arrière et la redirection quand la session n'est plus valide.

Les tests utilisent des données fictives dans des bases temporaires. Ils ne suppriment pas les tâches de développement. Le projet contient aussi un contrôle de qualité du code et une commande de construction de l'interface.

Côté documentation, le README donne les étapes pour installer et lancer le projet. Swagger permet de retrouver les endpoints, de voir les champs attendus et d'essayer les requêtes. Des exemples ont été ajoutés pour les demandes et les réponses, comme demandé par le professeur. Le dépôt contient également une comparaison entre les consignes et les changements réalisés.

**À montrer :** Montrer le résultat des tests, puis un endpoint Swagger avec son exemple. Consulter GitHub Actions pour le statut du commit présenté ; ne pas relancer toute l'installation pendant l'oral.

## 6. Le bilan et les améliorations possibles (8:30 à 10:00)

Le résultat répond au besoin de départ : un utilisateur peut se créer un compte, se connecter et gérer ses tâches dans un espace personnel. La nouvelle version reprend aussi l'organisation demandée par le professeur, avec des pages de connexion et d'inscription séparées, une vraie navigation et des composants dédiés aux tâches.

L'intérêt de ces changements est aussi de rendre le projet plus facile à comprendre. Si on souhaite modifier la présentation d'une tâche, on sait où intervenir. Si on veut changer le formulaire, on retrouve la partie correspondante sans chercher dans tout l'écran.

Il reste néanmoins des limites. Par exemple, la récupération d'un mot de passe oublié et la limitation des tentatives de connexion ne sont pas prévues. Pour une utilisation plus importante, il faudrait également mieux gérer les longues listes et approfondir les vérifications sur différents navigateurs.

Les bonus du livret, comme les priorités ou les statistiques, n'ont pas été ajoutés dans cette version. Les consignes les présentent comme des objectifs supplémentaires. La priorité a été de garder un parcours complet et de vérifier les fonctionnalités obligatoires avant d'élargir le projet.

Pour finir, TaskFlow montre comment une interface, un serveur et une base de données peuvent fonctionner ensemble pour répondre à un besoin simple. La démonstration permet de voir les fonctionnalités, et les tests apportent des vérifications complémentaires. Merci pour votre attention, je suis prêt à répondre à vos questions.

**À montrer :** Revenir à la liste des tâches. Terminer sur le résultat et les prochaines améliorations, sans lancer une nouvelle démonstration.

