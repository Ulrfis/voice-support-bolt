# Audiogami — Voice Support Demo

> Transformez la voix de vos clients en tickets structurés, en temps réel.

**Version** : 0.4.0 | **Stack** : React + TypeScript + Vite + Tailwind + Supabase + Gamilab SDK

---

## Présentation

Audiogami est une démonstration de collecte vocale de tickets de support. L'agent de support parle — l'IA transcrit, structure et pré-remplit le ticket. Un humain valide en quelques secondes avant envoi.

Le flow complet en 3 étapes :

1. **Parler** — L'agent ou le client décrit son problème à voix haute. Gamilab transcrit et extrait les champs en temps réel.
2. **Vérifier** — Un écran HITL (Human-In-The-Loop) permet de corriger, compléter et valider les données extraites.
3. **Envoyer** — Le ticket est enregistré dans Supabase, prêt à être poussé vers Notion ou tout autre outil.

---

## Cas d'usage supportés

| Cas d'usage | Portail Gamilab | Champs clés |
|-------------|----------------|-------------|
| IT Support | `33` | device, symptoms, frequency, environment, actions_tried, impact |
| E-commerce | `34` | order_number, problem_type, product_description, delivery_status, desired_resolution |
| SaaS CRM | `35` | feature, symptoms, steps_to_reproduce, impact |
| Dev Portal | `36` | request_type, description, urgency, context, expected_behavior, ideas_needs |

---

## Architecture

```
src/
├── components/
│   ├── Screen1Home.tsx         # Sélection du cas d'usage
│   ├── Screen2Recording.tsx    # Enregistrement + extraction temps réel (Gamilab SDK)
│   ├── Screen3HITL.tsx         # Validation humaine des champs extraits
│   ├── Screen4Confirmation.tsx # Succès + push Notion
│   └── Backoffice.tsx          # Tableau de bord des tickets
├── contexts/
│   └── LanguageContext.tsx     # i18n FR/EN
├── data/
│   ├── useCases.ts             # Définitions des cas d'usage (questions, champs requis)
│   └── transcripts.ts          # Exemples de transcripts (référence)
├── lib/
│   ├── gamilab.ts              # SDK wrapper : waitForGami(), connectGami(), mapStructToTicket(), PORTAL_IDS
│   ├── notion.ts               # Placeholder push Notion
│   └── supabase.ts             # Client Supabase singleton
└── types.ts                    # Types TypeScript (Ticket, UseCaseId, Priority…)
```

---

## Variables d'environnement

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Gamilab — Portails FR
VITE_GAMILAB_PORTAL_IT_SUPPORT_ID=33
VITE_GAMILAB_PORTAL_ECOMMERCE_ID=34
VITE_GAMILAB_PORTAL_SAAS_ID=35
VITE_GAMILAB_PORTAL_DEV_PORTAL_ID=36

# Gamilab — Portails EN
VITE_GAMILAB_PORTAL_IT_SUPPORT_EN_ID=33
VITE_GAMILAB_PORTAL_ECOMMERCE_EN_ID=43
VITE_GAMILAB_PORTAL_SAAS_EN_ID=44
VITE_GAMILAB_PORTAL_DEV_PORTAL_EN_ID=45

# PostHog (analytics)
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://eu.i.posthog.com

# Notion (optionnel — à activer pour le push via Edge Function)
VITE_NOTION_TOKEN=
VITE_NOTION_DATABASE_ID=
```

---

## Intégration Gamilab

Le SDK est chargé via un script `defer` dans `index.html` :

```html
<script defer src="https://gamilab.ch/js/sdk.js"></script>
```

Initialisation via l'événement `gami:init` (géré dans `src/lib/gamilab.ts`) :

```typescript
const gami = await waitForGami();      // attend que le SDK soit prêt
await connectGami('gamilab.ch');       // connexion idempotente (une seule fois par session)
await gami.use_portal('33');           // portal IT Support
await gami.create_thread();
await gami.start_recording();          // démarre le micro
```

> **Note** : `connectGami()` utilise un flag interne — appeler `connect()` plusieurs fois sur le singleton Gamilab corrompt l'état du canal WebSocket (bug production uniquement, masqué par HMR en local).

Événements SDK utilisés :

| Événement | Usage |
|-----------|-------|
| `audio:recording` | Mise à jour de l'état bouton (idle / recording / paused) |
| `thread:text_current` | Transcription live avec curseur animé |
| `thread:text_history` | Historique complet de transcription (fourni entier par le SDK) |
| `thread:struct_current` | Données structurées complètes en temps réel → `Partial<Ticket>` (fournies entières par le SDK) |
| `thread:extraction_status` | Détecte la fin de l'extraction après arrêt |

---

## Intégration Notion (à implémenter)

Le push Notion est architecturé mais nécessite une **Supabase Edge Function** pour contourner le CORS (l'API Notion n'accepte pas les appels directs depuis le navigateur).

Étapes pour activer :
1. Créer une Edge Function Supabase qui appelle `https://api.notion.com/v1/pages`
2. Mapper les champs du `Ticket` vers les propriétés de la database Notion cible
3. Renseigner `VITE_NOTION_TOKEN` et `VITE_NOTION_DATABASE_ID` dans `.env`
4. Implémenter l'appel dans `src/lib/notion.ts`

---

## Lancer le projet

```bash
npm install
npm run dev
```

---

## Déploiement

### Docker / Coolify

Le projet inclut un `Dockerfile` multi-stage (Node 20 → Nginx Alpine) prêt à l'emploi :

```bash
docker build -t audiogami .
docker run -p 8080:80 audiogami
```

Pour Coolify : sélectionner **Dockerfile** comme build pack, port `80`. Toutes les variables `VITE_*` doivent être configurées en **Build Variables** dans Coolify (elles sont embarquées au moment du build).

Voir `docs/deploy-coolify.md` pour le guide complet.

### Netlify

```bash
npm run build
```

Le `netlify.toml` configure automatiquement le build et les redirects SPA.

---

## Compatibilité responsive

L'application est entièrement optimisée pour desktop et smartphone :

| Écran | Mobile | Tablette | Desktop |
|-------|--------|----------|---------|
| Accueil | 1 col + étapes empilées | 2 cols | 2 cols |
| Enregistrement | Vue unique empilée | Vue unique empilée | Côte à côte (3+2 col) |
| Revue HITL | Champs en colonne | 3 cols selects | 3 cols selects |
| Confirmation | Stats 2×2 | Stats 4 cols | Stats 4 cols |
| Backoffice | Sheet modal + filtres empilés | Tableau scrollable | Vue complète |

---

## Stack technique

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS
- **Base de données** : Supabase (PostgreSQL + RLS)
- **Transcription & extraction** : Gamilab SDK (WebSocket temps réel)
- **Icônes** : Lucide React
- **Analytics** : PostHog
- **Push externe** : Notion (scaffolding — à implémenter)
- **Conteneur** : Docker (Nginx Alpine), compatible Coolify, Railway, Render, etc.
