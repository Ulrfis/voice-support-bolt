# Audiogami — Voice Support Demo

> Transformez la voix de vos clients en tickets structurés, en temps réel.

**Version** : 0.2.2 | **Stack** : React + TypeScript + Vite + Tailwind + Supabase + Gamilab SDK

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
│   ├── gamilab.ts              # SDK wrapper : waitForGami(), mapStructToTicket(), PORTAL_IDS
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

# Gamilab
VITE_GAMILAB_API_KEY=
VITE_GAMILAB_PORTAL_IT_SUPPORT=33
VITE_GAMILAB_PORTAL_ECOMMERCE=34
VITE_GAMILAB_PORTAL_SAAS=35
VITE_GAMILAB_PORTAL_DEV_PORTAL=36

# Notion (optionnel — à activer pour le push)
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
waitForGami()                          // attend que le SDK soit prêt
  .then(gami => gami.connect('gamilab.ch'))
  .then(() => gami.use_portal('33'))   // portal IT Support
  .then(() => gami.create_thread())
  .then(() => gami.start_recording()); // démarre le micro
```

Événements SDK utilisés :

| Événement | Usage |
|-----------|-------|
| `audio:recording` | Mise à jour de l'état bouton (idle / recording / paused) |
| `thread:text_current` | Transcription live avec curseur animé |
| `thread:text_history` | Transcript accumulé |
| `thread:struct_current` | Champs extraits en temps réel → `Partial<Ticket>` |
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

## Stack technique

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS
- **Base de données** : Supabase (PostgreSQL + RLS)
- **Transcription & extraction** : Gamilab SDK (WebSocket temps réel)
- **Icônes** : Lucide React
- **Analytics** : PostHog
- **Push externe** : Notion (scaffolding — à implémenter)
