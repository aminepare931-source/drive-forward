# Drive Forward

Tu es un **Senior Frontend Architect + Senior React/Next.js Engineer + UX/UI Designer** spécialisé dans les applications SaaS, ERP, LMS et systèmes multi-rôles complexes.

Ta mission est de concevoir et développer le **front-end complet d'une plateforme numérique destinée aux auto-écoles**.

Nous développons actuellement UNIQUEMENT le FRONT-END. Aucun vrai backend n'est nécessaire pour cette étape. Utilise des données mockées réalistes. Toutes les interfaces doivent cependant être conçues comme si elles étaient connectées à une vraie API. Le code doit être propre, modulaire, maintenable et prêt à recevoir un backend ultérieurement. Ne crée pas une simple landing page : construis une véritable application métier complète.

La plateforme est une application destinée aux auto-écoles et fonctionne selon une architecture **multi-établissements / multi-tenant**. Une même plateforme peut héberger plusieurs auto-écoles. Par exemple, la plateforme peut contenir Auto-école Horizon avec son administration, ses moniteurs et ses élèves, Auto-école Excellence avec son administration, ses moniteurs et ses élèves, et Auto-école Réussite avec son administration, ses moniteurs et ses élèves. Chaque auto-école possède ses propres utilisateurs et ses propres données. Une auto-école ne doit jamais voir les données d'une autre.

Utilise **Next.js avec App Router, TypeScript, React, Tailwind CSS, shadcn/ui, Lucide React, React Hook Form, Zod, TanStack Query pour préparer la future gestion des données serveur, Zustand si nécessaire pour les états globaux et Recharts pour les graphiques**. Utilise une architecture moderne, professionnelle, modulaire et maintenable.

L'application doit avoir une apparence professionnelle, moderne, claire, premium, sérieuse, adaptée à une vraie entreprise, responsive, accessible, rapide et cohérente. Évite les interfaces enfantines, les couleurs excessives, les gradients inutiles, les cartes partout, les animations excessives et le design ressemblant à une simple application de quiz. L'interface doit ressembler à un véritable **ERP + LMS moderne** et être parfaitement utilisable sur desktop, tablette et mobile.

Créer une identité visuelle professionnelle autour du thème **mobilité + formation + technologie + confiance**. Prévoir un logo temporaire, favicon, système de couleurs, typographie, boutons, badges, cartes, tableaux, formulaires, modales, notifications, états loading, états empty, états error et confirmations. Utiliser des variables CSS pour le thème et prévoir également un mode sombre correctement conçu.

L'application doit gérer plusieurs rôles. Le **Super Administrateur** est l'administrateur de toute la plateforme et peut voir toutes les auto-écoles, licences, utilisateurs, statistiques globales, contenus et signalements. L'**Administrateur d'auto-école** gère son établissement, notamment les élèves, moniteurs, groupes, véhicules, planning, formations, paiements, documents, statistiques et communications. Le **Secrétaire** peut gérer notamment les inscriptions, dossiers, élèves, planning, paiements, documents et communications. Le **Moniteur** peut gérer ses élèves, groupes, cours, exercices, devoirs, examens, évaluations, séances de conduite et progression. L'**Élève** peut consulter son tableau de bord, ses cours, exercices, devoirs, examens, résultats, progression, planning, séances de conduite, documents, notifications et messages.

Créer les interfaces d'authentification comprenant connexion, mot de passe oublié, réinitialisation du mot de passe, première connexion, activation d'un compte, invitation d'un utilisateur, sélection de l'établissement si nécessaire, sélection du rôle si nécessaire et déconnexion. Créer des comptes mockés permettant de tester les différents rôles, par exemple `admin@horizon.test`, `moniteur@horizon.test`, `eleve@horizon.test` et `superadmin@platform.test`.

Créer un espace **Super Administrateur** avec un dashboard global comprenant le nombre total d'auto-écoles, auto-écoles actives, auto-écoles en période d'essai, licences expirant bientôt, nombre total d'utilisateurs, nombre total d'élèves, revenus simulés, croissance, graphiques et activité récente. Créer également une interface de gestion des auto-écoles avec liste, recherche, filtres, tri, statut, nombre d'élèves, nombre de moniteurs, licence, date d'expiration, dernière activité et actions. Prévoir création, modification, détails, suspension et activation d'une auto-école ainsi que la gestion des licences.

Créer le **Dashboard de l'auto-école** avec nombre d'élèves, nombre de moniteurs, séances du jour, examens programmés, exercices à corriger, paiements, élèves en difficulté, taux de réussite et activité récente. Ajouter des graphiques concernant la progression des élèves, réussite aux examens, présence, inscriptions et activité pédagogique.

Créer un module complet de **gestion des élèves** avec liste, recherche, filtres, tri, pagination, ajout, modification, archivage, import et export. Créer une fiche complète pour chaque élève avec informations personnelles, nom, prénom, photo, téléphone, email, date de naissance, adresse, formation, catégorie de permis, date d'inscription, statut, groupe, moniteur principal, progression théorique, progression pratique, moyenne, progression globale, compétences, activité, derniers examens, derniers devoirs, dernières séances, absences, documents, pièces administratives, contrats, certificats, paiements, montant total, montant payé, reste à payer, historique des paiements et une timeline complète retraçant l'évolution de l'élève.

Créer un véritable **dossier numérique de l'élève** inspiré des systèmes scolaires modernes avec les onglets Vue générale, Informations, Formation, Théorie, Pratique, Examens, Devoirs, Évaluations, Présences, Paiements, Documents, Messages et Historique.

Créer un module **Groupes de formation** permettant de créer, modifier et supprimer des groupes, ajouter ou retirer des élèves, assigner un moniteur et définir la catégorie de permis et le calendrier. Exemple : Permis B — Groupe 2026-A. Afficher le moniteur, le nombre d'élèves, la progression moyenne et le prochain cours ou examen.

Créer un module **Moniteurs** avec liste des moniteurs, nom, photo, spécialité, nombre d'élèves, séances, disponibilité et performance. Créer une fiche moniteur avec les onglets Profil, Élèves, Planning, Séances, Évaluations et Activité.

Le moniteur doit pouvoir créer directement des **exercices et devoirs** depuis son tableau de bord. Créer une interface permettant de renseigner titre, description, catégorie, difficulté, durée, nombre de questions, date de début, date limite et nombre de tentatives. Les questions peuvent contenir du texte, une image, plusieurs réponses, une bonne réponse et une explication. Le moniteur peut choisir comme destinataires tous ses élèves, un groupe ou certains élèves sélectionnés. Prévoir une prévisualisation avant envoi et un bouton **Publier et envoyer**.

Créer un module complet de **devoirs** avec brouillons, devoirs publiés, terminés et expirés. Afficher le titre, groupe, nombre d'élèves, taux de complétion, moyenne et date limite. Créer une page détaillée permettant de consulter les résultats individuels.

Créer un module complet d'**examens** permettant de créer, modifier, publier et assigner des examens, avec chronomètre, questions, résultats et statistiques. Créer également l'interface de passage d'un examen pour l'élève avec question actuelle, progression, réponses, navigation, chronomètre et possibilité de terminer l'examen.

Créer une **banque de questions** avec catégories, recherche, filtres, difficulté, questions avec images et statistiques d'utilisation. Prévoir des catégories comme signalisation, priorités, intersections, circulation, stationnement, dépassement, sécurité et mécanique de base.

Créer un module de **cours et formation théorique**. Le moniteur ou l'administrateur peut créer des cours, chapitres, leçons, vidéos, documents, images et quiz. L'élève dispose d'un espace d'apprentissage affichant les cours disponibles, la progression, les cours terminés et les recommandations.

Créer un module complet de **formation pratique** permettant de gérer les séances, heures, moniteurs, véhicules, compétences et évaluations. Créer une interface de séance contenant date, heure, élève, moniteur, véhicule et durée. Prévoir le suivi des compétences suivantes : démarrage, freinage, embrayage, changement de vitesse, stationnement, marche arrière, démarrage en côte, intersections, ronds-points, changement de voie, dépassement et circulation. Chaque compétence possède un niveau de progression.

Créer un **planning complet** avec vue jour, semaine et mois. Afficher les cours, examens, séances de conduite, rendez-vous et événements. Créer une interface de création de séance et afficher visuellement les conflits lorsqu'un moniteur, un véhicule ou un élève est déjà occupé.

Créer un module **Véhicules** avec marque, modèle, immatriculation, catégorie, kilométrage, statut, assurance, visite technique et maintenance. Prévoir également un historique d'entretien.

Créer un module **Présences** permettant de marquer présent, absent, retard ou excusé et afficher les statistiques par élève et groupe.

Créer un module **Paiements** affichant montant, montant payé, reste, statut, date, méthode et historique. Créer une interface de facture ou reçu. Les paiements doivent être MOCKÉS pour le moment.

Créer un module **Documents** permettant upload, téléchargement, aperçu, catégories, expiration et statut. Prévoir les états valide, bientôt expiré et expiré.

Créer un module de **Messagerie** permettant conversation individuelle, conversation de groupe, annonces et pièces jointes. Le moniteur peut écrire à ses élèves et l'administration peut écrire aux élèves ou aux moniteurs.

Créer un **centre de notifications** avec notifications pour nouveau devoir, nouvel examen, séance programmée, modification de séance, message, paiement, document expirant et annonce.

Créer un espace **Élève mobile-first** avec dashboard affichant progression globale, prochains événements, devoirs, examens, cours, dernières notes, compétences et notifications. Créer les pages ou interfaces pour les cours, devoirs, examens, résultats, progression, calendrier, conduite, documents, messages et profil.

Créer une page de **progression intelligente** affichant progression globale, théorie, pratique, examens, compétences, moyenne, points faibles et points forts. Ajouter des graphiques et une section « À améliorer » avec par exemple Priorités 54 %, Signalisation 72 %, Stationnement 88 %.

Créer un **Dashboard Moniteur** spécifique avec élèves suivis, séances du jour, devoirs, examens, corrections en attente, élèves en difficulté et activité récente. Ajouter des actions rapides : Créer un devoir, Créer un examen, Planifier une séance et Évaluer un élève.

L'application doit être réellement responsive. Sur desktop, utiliser une sidebar et une topbar. Sur mobile, utiliser une navigation adaptée, notamment une bottom navigation lorsque cela est pertinent. Pour l'élève mobile, prévoir Accueil, Formation, Devoirs, Planning et Profil. Pour le moniteur, prévoir Accueil, Élèves, Planning, Devoirs et Profil.

Créer un système complet de **mock data** avec au minimum 3 auto-écoles, 10 moniteurs, 100 élèves, groupes, examens, questions, devoirs, séances, véhicules, paiements, documents et notifications. Ne jamais placer toutes les données fictives directement dans les composants. Créer des fichiers et services mockés séparés.

Organiser proprement le projet avec une architecture pouvant utiliser `app/`, `components/`, `features/`, `lib/`, `hooks/`, `services/`, `types/`, `mocks/`, `stores/` et `schemas/`. Utiliser une architecture par fonctionnalités lorsque cela améliore la maintenabilité. Prévoir notamment `features/students`, `features/instructors`, `features/assignments`, `features/exams`, `features/courses`, `features/driving`, `features/calendar`, `features/payments`, `features/vehicles`, `features/documents` et `features/messaging`.

Créer une couche de services mockés telle que `students.ts`, `instructors.ts`, `assignments.ts`, `exams.ts`, `courses.ts`, `payments.ts` et `vehicles.ts`. Les composants ne doivent pas dépendre directement des données mockées. Ils doivent appeler les services afin que plus tard le système puisse passer proprement d'un **Mock Service à une API réelle** sans réécrire toute l'interface.

Pour chaque page importante, prévoir les états loading, empty, error, success, confirmation et skeleton. Ne jamais laisser une page vide lorsque les données sont absentes. Créer suffisamment de données d'exemple pour visualiser immédiatement le produit.

Préparer les permissions par rôle, routes protégées, navigation conditionnelle, pages interdites et gestion de session mockée. La sécurité réelle sera implémentée côté backend plus tard. Ne jamais considérer les permissions front-end comme une sécurité suffisante.

Le système doit être conçu dès le départ comme **multi-tenant**. Créer un contexte d'organisation mocké, par exemple `currentOrganization: { id: "school_001", name: "Auto-école Horizon" }`. Toutes les interfaces doivent fonctionner avec cette organisation. Créer la possibilité de changer d'organisation uniquement pour les comptes qui ont plusieurs organisations. Prévoir l'architecture afin que chaque requête future puisse inclure `organizationId`.

Créer un **dark mode complet**, sans simplement inverser les couleurs. Vérifier spécialement les tableaux, graphiques, formulaires, modales, sidebar, notifications, cartes et badges.

Utiliser des animations légères pour les transitions, apparition des pages, statistiques, menus et modales, sans animations excessives. La priorité doit rester la productivité et les performances.

Le code doit utiliser TypeScript strict, des composants réutilisables, éviter la duplication inutile, éviter `any` sauf nécessité exceptionnelle, utiliser des types propres, valider les formulaires avec Zod, créer des formulaires propres et accessibles et maintenir un code lisible. Les commentaires doivent uniquement être utilisés lorsqu'ils apportent une vraie valeur.

Il ne faut surtout pas créer une simple démo. Je veux une **véritable interface de produit**. Chaque module doit être navigable. Les boutons doivent fonctionner avec les données mockées. Lorsqu'un devoir est créé, il doit apparaître dans la liste. Lorsqu'un élève est ajouté, il doit apparaître dans la liste. Lorsqu'un devoir est attribué, il doit apparaître dans l'espace élève. Lorsqu'un examen est terminé, son résultat doit apparaître dans l'historique. Lorsqu'une séance est modifiée, le calendrier doit se mettre à jour. Lorsqu'une organisation différente est sélectionnée, les données mockées doivent changer.

Le système doit permettre de tester les scénarios suivants : connexion en tant qu'administrateur, affichage de son auto-école, ajout d'un moniteur, ajout d'un élève, création d'un groupe, consultation du dossier élève et planification d'une séance ; connexion en tant que moniteur, consultation de ses élèves, ouverture d'un dossier élève, création d'un devoir, sélection de plusieurs élèves, publication du devoir et consultation des résultats ; connexion en tant qu'élève, consultation d'un devoir reçu, réalisation du devoir, obtention du résultat, consultation de la progression et de la prochaine séance ; connexion avec une autre auto-école et vérification qu'aucune donnée de la première auto-école n'apparaît.

À la fin, produire le projet Next.js complet avec toutes les pages, composants, layouts, données mockées, types TypeScript, services mockés, formulaires, validations, dashboards, interfaces mobiles, dark mode, états loading/empty/error, navigation complète et un README expliquant comment lancer le projet.

Ne crée pas encore de backend réel. Ne crée pas encore de système de paiement réel. Ne crée pas encore d'authentification réelle. Prépare cependant toute l'architecture pour pouvoir les intégrer proprement plus tard.

Commence directement par construire l'architecture générale, le design system et l'application complète. Le résultat doit être cohérent visuellement et fonctionnellement, comme un véritable produit prêt à être présenté à une auto-école. À chaque modification, vérifie que l'application reste fonctionnelle, compilable et sans erreurs TypeScript.

## Development

### Prérequis

- **Node.js** 20+ — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** ou **bun**

### Installation

```sh
npm i
```

### Lancer en développement

```sh
npm run dev
```

### Build de production

```sh
npm run build
```

### Lint

```sh
npm run lint
```

### Formatage

```sh
npm run format
```

## 🏗️ Stack technique

- **TanStack Start** (React 19 + Vite 8) — framework SSR
- **TypeScript strict** — typage complet
- **Tailwind CSS v4** — styles utilitaires
- **shadcn/ui** — composants UI accessibles
- **TanStack Query** — gestion des données
- **TanStack Router** — routage typesafe
- **Zod** — validation de formulaires
- **Recharts** — graphiques
- **Nitro** — déploiement serverless (Cloudflare Module par défaut)

## 🏗️ Architecture

- `src/routes/` — routes TanStack (file-based routing)
- `src/components/` — composants UI réutilisables
- `src/services/` — couche de services mockés (remplaçable par une API réelle)
- `src/mocks/` — données mockées multi-établissements
- `src/types/` — types TypeScript du domaine
- `src/lib/` — utilitaires et providers
- `src/hooks/` — hooks réutilisables
- `public/` — assets statiques (favicon, robots.txt)

## 🔐 Comptes de démo

| Rôle | Email |
|------|-------|
| Super Admin | `superadmin@platform.test` |
| Admin auto-école | `admin@horizon.test` |
| Moniteur | `moniteur@horizon.test` |
| Élève | `eleve@horizon.test` |
