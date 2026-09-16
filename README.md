# Playlife Connect

Plateforme de missions solidaires : des voyageurs et des animateurs/enseignants organisent la remise de packs de matériel sportif à des enfants, via des structures locales partenaires.

## Stack

| Rôle | Outil |
|---|---|
| Interface | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Navigation | React Router 7 (pages chargées à la demande) |
| Backend | Supabase (PostgreSQL + RLS, Auth, Storage, Edge Functions) |
| Hébergement | Netlify |

## Démarrer en local

Prérequis : Node.js 20 ou plus.

```bash
npm install
cp .env.example .env   # puis renseigner l'URL et la clé publique Supabase
npm run dev
```

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement (http://localhost:5173) |
| `npm run build` | Vérification TypeScript + build de production dans `dist/` |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run preview` | Sert le build de production en local |

## Pages

| Route | Accès | Contenu |
|---|---|---|
| `/` | public | Accueil, diaporama, chiffres clés |
| `/missions` | public | Missions publiées (en cours / terminées) |
| `/structures` | public | Structures partenaires validées |
| `/impact` | public | Parcours Playlife |
| `/ressources` | public | Guides PDF |
| `/contact` | public | Coordonnées |
| `/login`, `/register` | public | Connexion, inscription |
| `/mot-de-passe-oublie`, `/nouveau-mot-de-passe` | public | Réinitialisation du mot de passe |
| `/dashboard` | connecté | Profil, mes missions, photos |
| `/settings` | super admin | Modération missions et structures, chiffres clés, diaporama |

## Organisation du code

```
src/
  app/
    App.tsx            routes et mise en page
    components/        composants partagés (formulaires, modales, navigation…)
    pages/             une page par route ; pages/settings/ = sections d'administration
  contexts/            AuthContext (session + profil)
  hooks/               lecture de site_config (chiffres clés, diaporama)
  lib/                 client Supabase, formatage, erreurs, Storage, missions
  types/               types de la base de données
supabase/
  MIGRATION_COMPLETE_SECURISEE.sql   schéma initial (nouvelle instance)
  migrations/                        migrations à appliquer ensuite, dans l'ordre
  functions/notify-new-mission/      email à l'équipe quand une mission est créée
  set_super_admin.sql                promouvoir un compte administrateur
  archive/                           anciens scripts, conservés pour l'historique
```

## Règles métier

- **Missions** : une mission créée est **invisible** jusqu'à sa publication par un super admin (`/settings`). Le créateur la voit dans son tableau de bord avec le badge « En attente de validation ».
- **Structures** : une structure proposée a le statut « à valider playlife » ; seules les structures « validée » sont publiques.
- Ces règles sont **garanties côté base** (triggers + RLS), pas seulement dans l'interface.

## Base de données

### Nouvelle instance

Dans le SQL Editor Supabase, exécuter dans l'ordre :

1. `supabase/MIGRATION_COMPLETE_SECURISEE.sql`
2. chaque fichier de `supabase/migrations/` (ordre alphabétique)
3. `supabase/set_super_admin.sql` après avoir créé votre compte (remplacer l'email)

### Instance existante

Exécuter uniquement les fichiers de `supabase/migrations/` qui n'ont pas encore été appliqués. Ils sont idempotents (ré-exécutables sans risque).

### Réglages Supabase à vérifier

- **Authentication → URL Configuration** : *Site URL* = l'adresse du site en production, et ajouter `https://<site>/**` et `http://localhost:5173/**` dans *Redirect URLs* (liens de confirmation d'email et de réinitialisation du mot de passe).
- **Authentication → Emails** : personnaliser les modèles d'email en français.

## Fonction de notification (optionnelle)

Envoie un email à l'équipe via [Resend](https://resend.com) à chaque nouvelle mission.

```bash
npx supabase login
npx supabase secrets set RESEND_API_KEY=... SITE_URL=https://<site> --project-ref rqrkorimpcobmbbsdcgz
npx supabase functions deploy notify-new-mission --no-verify-jwt --project-ref rqrkorimpcobmbbsdcgz
```

Secrets optionnels : `NOTIFY_TO_EMAIL` (défaut `missions@playlife.today`), `NOTIFY_FROM_EMAIL` (domaine vérifié dans Resend).

## Déploiement Netlify

`netlify.toml` contient déjà la commande de build, la redirection des routes et les en-têtes de sécurité.

1. Créer le site (depuis le dépôt GitHub, ou `netlify init`).
2. Ajouter les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. Déployer, puis reporter l'adresse du site dans la configuration Auth de Supabase (voir plus haut).
