# Bouderka SARL – Plateforme Web de Gestion Commerciale et Catalogue Automobile

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![EMSI](https://img.shields.io/badge/EMSI-Projet%20de%20Fin%20d'Ann%C3%A9e-CC0000)

## 📑 Sommaire

- [Présentation](#1-présentation)
- [Aperçu](#-aperçu)
- [Fonctionnalités](#2-fonctionnalités-principales)
- [Technologies](#3-technologies-utilisées)
- [Architecture](#4-architecture-du-projet)
- [Installation](#5-installation)
- [Tests automatisés](#6-tests-automatisés)
- [Variables d'environnement](#7-variables-denvironnement)
- [Comptes de démonstration](#8-comptes-de-démonstration)
- [Structure du projet](#9-structure-du-projet)
- [Captures d'écran](#10-captures-décran)
- [Fonctionnalités futures](#11-fonctionnalités-futures)
- [Auteur](#auteur)
- [Licence](#-licence)

---

Plateforme web full-stack développée pour **Bouderka SARL**, une concession automobile fictive basée à Marrakech (concessionnaire Volkswagen, Audi, Škoda et Porsche), permettant la gestion commerciale interne (véhicules, rendez-vous, essais, entretiens) ainsi qu'un catalogue public destiné aux clients.

---

## 1. Présentation

Bouderka SARL est une concession automobile présentée dans ce projet comme distributeur des marques **Volkswagen, Audi, Škoda et Porsche** à Marrakech. Ce projet est une plateforme web moderne développée dans le cadre d'un Projet de Fin d'Année, qui numérise les principaux processus métier d'une concession automobile :

- la gestion du parc de véhicules et de leurs médias (photos, couleurs, équipements) ;
- la gestion des rendez-vous clients (prise de rendez-vous, créneaux, confirmation) ;
- la gestion des essais routiers (Test Drive) ;
- le suivi de l'historique d'entretien des véhicules clients ;
- un catalogue public consultable sans authentification ;
- des espaces de travail dédiés à chacun des quatre rôles de l'organisation : **Administrateur**, **Commercial**, **Chef d'atelier** et **Client**.

L'application est architecturée en deux services indépendants : un frontend React (SPA) et une API REST Node.js/Express, connectés à une base de données MySQL via l'ORM Prisma.

---

## 🎯 Aperçu

Bouderka SARL est une plateforme web moderne conçue pour une concession automobile, offrant des espaces dédiés à quatre profils d'utilisateurs : l'**Administrateur** (supervision globale et gestion des utilisateurs), le **Commercial** (véhicules, médias et test drives), le **Chef d'atelier** (rendez-vous et suivi atelier) et le **Client** (catalogue, prise de rendez-vous, essais et suivi de son historique). Chaque espace propose une interface et des fonctionnalités adaptées au rôle de l'utilisateur connecté.

---

## 2. Fonctionnalités principales

- **Authentification JWT** (inscription, connexion, déconnexion, rafraîchissement de token, consultation/mise à jour du profil, changement de mot de passe) via cookies `httpOnly`.
- **Gestion des rôles** : `CLIENT`, `COMMERCIAL`, `CHEF_ATELIER`, `ADMIN`, avec contrôle d'accès par rôle sur chaque route sensible.
- **Gestion des véhicules** : création, modification, suppression, consultation (espace Commercial).
- **Gestion des médias véhicule** : photos, couleurs disponibles, équipements, version/finition, disponibilité.
- **Catalogue public** : consultation par marque, recherche, pagination, fiche véhicule détaillée (galerie avec visionneuse plein écran, véhicules similaires).
- **Rendez-vous** : prise de rendez-vous par le client, calcul des créneaux libres, confirmation/refus par le Chef d'atelier, gestion des plages horaires bloquées.
- **Test Drive** : demande d'essai par le client, approbation/refus par le Commercial.
- **Ventes** : enregistrement d'une vente par le Commercial (véhicule, client, CIN, mode de paiement), passage automatique du véhicule au statut Vendu, notification client, statistiques de chiffre d'affaires pour l'Administrateur.
- **Historique d'entretien** : suivi des interventions par véhicule, alertes de vidange et de contrôle technique à venir.
- **Notifications** : notification automatique du client lorsqu'un rendez-vous ou un test drive est confirmé/approuvé ou refusé, avec liste des notifications et compteur de notifications non lues.
- **Tableaux de bord** : statistiques par rôle (véhicules, rendez-vous, clients, test drives).
- **Localisation Google Maps** : carte intégrée et lien d'itinéraire dans la section Contact de la page d'accueil.
- **Interface responsive** adaptée mobile/tablette/desktop.

> Le champ ci-dessus liste uniquement les fonctionnalités effectivement implémentées et opérationnelles dans le code à ce jour.

---

## 3. Technologies utilisées

| Catégorie | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, React Router DOM 6, Tailwind CSS 3, Axios, React Hot Toast, Headless UI, Lucide React |
| **Backend** | Node.js, Express 4, Prisma ORM 5 |
| **Base de données** | MySQL |
| **Authentification** | JSON Web Token (`jsonwebtoken`), cookies `httpOnly`, hachage des mots de passe (`bcryptjs`) |
| **Sécurité & validation** | Helmet, CORS, express-rate-limit, express-validator |
| **Outils (frontend)** | ESLint, Prettier |
| **Outils (backend)** | Nodemon, Prisma CLI, Jest, Supertest |

⚠️ ESLint et Prettier sont installés côté `client/` (scripts `npm run lint` / `npm run format`) mais **aucun fichier de configuration** (`.eslintrc`, `eslint.config.js`, `.prettierrc`) n'est présent dans le projet. En l'état, `npm run lint` échoue avec *"ESLint couldn't find a configuration file"* ; `npm run format` fonctionne (Prettier utilise ses réglages par défaut) mais le code n'est pas formaté de façon homogène, donc rien n'indique qu'il ait été appliqué systématiquement. Le `server/` ne dispose d'aucun outil de lint/format.

---

## 4. Architecture du projet

Le projet est structuré en deux applications indépendantes :

```
bouderka-pwa/
├── client/     → Application frontend React (Vite)
└── server/     → API backend Express + Prisma
```

### `client/`
Application React organisée par rôle et par responsabilité :
- `src/pages/` — pages de l'application, réparties en sous-dossiers par espace (`admin/`, `atelier/`, `commercial/`, `client/`, `auth/`) et pages publiques (accueil, catalogue, fiche véhicule).
- `src/layouts/` — mises en page (sidebar, navigation) propres à chaque rôle.
- `src/components/` — composants réutilisables (tableaux, badges de statut, pagination, squelettes de chargement, etc.).
- `src/context/` — contexte d'authentification global (`AuthContext`).
- `src/hooks/` — hooks personnalisés (ex. `useDebounce`).
- `src/services/` — client HTTP centralisé (`api.js`, instance Axios).
- `src/assets/` — logos et ressources statiques.

### `server/`
API REST organisée en couches :
- `src/routes/` — définition des routes Express et validation des entrées (`express-validator`).
- `src/controllers/` — logique métier de chaque module (véhicules, rendez-vous, test drives, ventes, entretiens, notifications, clients, plages bloquées, authentification).
- `src/middlewares/` — middleware d'authentification JWT et de contrôle des rôles.
- `src/config/prisma.js` — instance unique de `PrismaClient`, partagée par tous les contrôleurs (remplacée par un mock dans les tests).
- `src/utils/` — utilitaires partagés (formatage de réponse API standardisé).
- `src/app.js` — configuration de l'application Express (middlewares globaux, montage des routes, gestion d'erreurs), sans démarrage du serveur.
- `server.js` — point d'entrée : importe `src/app.js` et démarre l'écoute (`app.listen`).
- `prisma/schema.prisma` — modèle de données et configuration de la base MySQL.
- `prisma/migrations/` — historique des migrations de schéma.
- `tests/` — configuration Jest (mock Prisma, variables d'environnement de test) et utilitaires partagés entre les suites de tests.

---

## 5. Installation

### Prérequis
- Node.js (version LTS recommandée, ≥ 18 requise par Vite 5)
- npm
- Un serveur MySQL accessible

### Étapes

**1. Cloner le dépôt**
```bash
git clone <url-du-depot>
cd bouderka-pwa
```

**2. Installer les dépendances du backend**
```bash
cd server
npm install
```

**3. Installer les dépendances du frontend**
```bash
cd ../client
npm install
```

**4. Configurer les variables d'environnement**

Depuis la racine du projet, copier le fichier d'exemple vers `server/.env` :
```bash
cp .env.example server/.env
```
Puis renseigner les vraies valeurs dans `server/.env` (voir section [Variables d'environnement](#6-variables-denvironnement)).

**5. Configurer MySQL**

Créer une base de données MySQL correspondant à celle définie dans `DATABASE_URL` (ex. `bouderka_db`), puis vérifier que les identifiants dans `server/.env` correspondent à votre instance MySQL locale.

**6. Générer le client Prisma et appliquer les migrations**
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

**7. Lancer le backend** (depuis `server/`)
```bash
npm run dev
```
L'API démarre par défaut sur `http://localhost:5000`.

**8. Lancer le frontend** (dans un second terminal, depuis `client/`)
```bash
npm run dev
```
L'application est accessible sur `http://localhost:5173` (le serveur de développement Vite proxifie automatiquement les appels `/api` vers le backend, voir `client/vite.config.js`).

---

## 6. Tests automatisés

Le backend dispose d'une suite de tests automatisés (Jest + Supertest), exécutée contre l'application Express réelle (`src/app.js`) mais avec Prisma entièrement mocké (`jest-mock-extended`) : aucune base de données réelle n'est sollicitée pendant les tests.

**Lancer les tests** (depuis `server/`) :
```bash
npm test
```

**État actuel : 4 fichiers, 12 tests, tous passants.**

| Fichier | Ce qui est testé |
|---|---|
| `auth.test.js` | Inscription (rôle CLIENT par défaut), doublon d'email (409), connexion valide/invalide (401), accès `/me` sans cookie (401) |
| `roles.test.js` | Contrôle d'accès par rôle : un CLIENT est bloqué en création de véhicule et sur la liste des clients réservée à l'Administrateur (403) |
| `rdv.test.js` | Création d'un rendez-vous pour soi-même, refus de création pour un autre client (403), confirmation/refus par le Chef d'atelier avec notification créée |
| `testdrive.test.js` | Approbation d'une demande d'essai par le Commercial avec notification créée |

⚠️ Modules **non couverts** par des tests automatisés à ce jour : véhicules, entretiens, plages bloquées, notifications, clients, ventes. Aucun test frontend n'est configuré (pas de Jest/Vitest/React Testing Library côté `client/`).

---

## 7. Variables d'environnement

Variables définies dans `.env.example` (à copier vers `server/.env`) :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Chaîne de connexion MySQL utilisée par Prisma (`mysql://utilisateur:motdepasse@host:port/nom_base`). |
| `JWT_SECRET` | Clé secrète utilisée pour signer les tokens d'accès JWT. |
| `JWT_REFRESH_SECRET` | Clé secrète utilisée pour signer les tokens de rafraîchissement JWT. |
| `PORT` | Port d'écoute du serveur Express (par défaut `5000`). |
| `NODE_ENV` | Environnement d'exécution (`development` ou `production`) ; influence le rate limiting, le flag `secure` des cookies et le niveau de détail des erreurs renvoyées. |
| `CLIENT_URL` | URL du frontend, utilisée pour configurer l'origine autorisée par CORS. |

⚠️ Le fichier `server/.env` réel ne doit jamais être commité (il est exclu via `.gitignore`).

---

## 8. Comptes de démonstration

Le projet ne fournit aucun compte de démonstration préconfiguré (aucun script d'amorçage/seed n'est présent). Pour tester l'application :
- Créer un compte via la page d'inscription publique (`/register`) — le rôle attribué par défaut est `CLIENT`.
- Pour tester les espaces **Commercial**, **Chef d'atelier** ou **Administrateur**, il est nécessaire de modifier manuellement le champ `role` de l'utilisateur concerné en base de données (par exemple via `npm run prisma:studio`).

---

## 9. Structure du projet

```
bouderka-pwa/
├── .env.example
├── client/
│   ├── src/
│   │   ├── assets/
│   │   │   └── logos/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── atelier/
│   │   │   ├── auth/
│   │   │   ├── client/
│   │   │   └── commercial/
│   │   ├── services/
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── server/
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── routes/
    │   ├── utils/
    │   └── app.js
    ├── tests/
    ├── server.js
    └── package.json
```

---

## 10. Captures d'écran

**Accueil**
![Accueil](docs/screenshots/accueil.png)

**Catalogue**
![Catalogue](docs/screenshots/catalogue.png)

**Fiche véhicule**
![Fiche véhicule](docs/screenshots/fiche-vehicule.png)

**Dashboard**
![Dashboard](docs/screenshots/dashboard.png)

**Gestion Média**
![Gestion Média](docs/screenshots/gestion-media.png)

**Rendez-vous**
![Rendez-vous](docs/screenshots/rendez-vous.png)

**Notifications**
![Notifications](docs/screenshots/notifications.png)

---

## 11. Fonctionnalités futures

Pistes d'évolution cohérentes avec le périmètre actuel du projet :

- Réinitialisation de mot de passe par email.
- Filtres de recherche avancés sur le catalogue (prix, carburant, transmission).
- Comparateur de véhicules.
- Favoris client sur le catalogue public.
- Export PDF (devis véhicule, historique d'entretien).
- Statistiques temporelles sur les tableaux de bord (évolution mensuelle des ventes/rendez-vous).
- Finalisation du support hors-ligne (Progressive Web App installable).

---

## Auteur

- **Nom** : Ismail Ibourane
- **Établissement** : EMSI
- **Projet** : Projet de Fin d'Année
- **Entreprise représentée** : Bouderka SARL

---

## 📄 Licence

Ce projet a été réalisé dans le cadre d'un Projet de Fin d'Année (PFA) à l'EMSI. Il est destiné à un usage pédagogique et ne constitue pas un produit commercial officiel de Bouderka SARL.
