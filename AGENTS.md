# DriveHub — Guide pour les agents IA

## Stack technique

- **TanStack Start** (React 19 + Vite 8) — framework SSR
- **TypeScript strict** — typage complet
- **Tailwind CSS v4** — styles utilitaires
- **shadcn/ui** — composants UI accessibles
- **TanStack Query** — gestion des données
- **TanStack Router** — routage typesafe
- **Zod** — validation de formulaires
- **Recharts** — graphiques

## Commandes

```sh
npm run dev       # Serveur de développement
npm run build     # Build de production
npm run lint      # Vérification ESLint
npm run format    # Formatage Prettier
```

## Architecture

- `src/routes/` — routes TanStack (file-based routing)
- `src/components/` — composants UI réutilisables
- `src/services/` — couche de services mockés (remplaçable par une API réelle)
- `src/mocks/` — données mockées multi-établissements
- `src/types/` — types TypeScript du domaine
- `src/lib/` — utilitaires et providers
- `src/hooks/` — hooks réutilisables
- `public/` — assets statiques (favicon, robots.txt)