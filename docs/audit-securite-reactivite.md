# Audit sécurité et réactivité — Voice Support Bolt

Date: 2026-02-19
Scope: frontend React/Vite + intégrations Supabase/Gamilab/PostHog + schéma SQL
Méthode: revue statique du code + configuration runtime/build

## Résumé exécutif

Le projet est fonctionnel pour une démo, mais il n’est pas prêt pour une exposition production sans durcissement.

Risques majeurs:
- Base de données entièrement modifiable/lisible/supprimable par rôle anonyme.
- Données sensibles (transcripts) potentiellement exposées via logs console et politiques RLS permissives.
- Scripts tiers chargés sans politique CSP stricte.
- Dégradation de réactivité côté UI due à des écritures réseau déclenchées à chaque frappe.

## Plan d’amélioration (priorisé)

### Phase 0 (0-48h) — Bloquer les risques critiques
1. Restreindre RLS Supabase: supprimer accès `anon` global en écriture/lecture, introduire policies minimales par use-case.
2. Supprimer le seed automatique en runtime (`seedDatabase`) et le limiter à un script dev explicite.
3. Retirer les logs verbeux contenant contenu métier/transcript en production.
4. Retirer le bootstrap PostHog inline dans `index.html` (double init) et centraliser via env dans `src/main.tsx`.

### Phase 1 (Sprint 1) — Réactivité/perf et robustesse
1. Débouncer les updates HITL ou sauvegarder `onBlur`/`onSubmit` plutôt que sur chaque `onChange`.
2. Paginer le backoffice (`select` partiel + pagination) au lieu de `select('*')`.
3. Ajouter validation stricte côté DB (CHECK constraints) et côté client (zod/valibot).
4. Ajouter gestion d’erreurs UX non bloquante (toasts) et retry contrôlé.

### Phase 2 (Sprint 2+) — Durcissement complet
1. Ajouter CSP (via headers Netlify), `connect-src` limité, et stratégie de scripts tiers.
2. Déplacer tout secret serveur (Notion token) en Edge Function uniquement (jamais côté `VITE_*`).
3. Ajouter garde anti-abus (rate-limit côté edge, captcha, quotas IP/clé).
4. Instrumenter SLO front (LCP, TTI, erreur réseau Supabase) et budget perf.

## Findings détaillés

## Critique

### SEC-001 — RLS anonymes permissives (lecture/écriture/suppression globales)
Impact: Toute personne ayant accès à l’app peut lire, modifier ou supprimer tous les tickets.

Preuves:
- `supabase/migrations/20251201141030_create_tickets_table.sql:101`
- `supabase/migrations/20251201141030_create_tickets_table.sql:107`
- `supabase/migrations/20251201141030_create_tickets_table.sql:113`
- `supabase/migrations/20251201141030_create_tickets_table.sql:120`

Recommandations:
- Supprimer policies `TO anon USING (true)` en prod.
- Introduire auth (JWT Supabase) + policies par propriétaire/tenant.
- Interdire DELETE côté anon.

### SEC-002 — Seed de données déclenché automatiquement au boot
Impact: insertion non contrôlée en prod, pollution des données, risque de fuite de PII de démonstration.

Preuves:
- `src/main.tsx:13`
- `src/seedData.ts:97`
- `src/seedData.ts:110`

Recommandations:
- Conditionner via `if (import.meta.env.DEV && VITE_ENABLE_SEED === 'true')`.
- Exécuter via script manuel (`npm run seed:dev`) hors runtime utilisateur.

## Haut

### SEC-003 — Données sensibles loggées en console (transcript + struct)
Impact: Exposition de données utilisateurs via navigateur, extensions, captures, support tooling.

Preuves:
- `src/components/Screen2Recording.tsx:149`
- `src/components/Screen2Recording.tsx:155`
- `src/components/Screen2Recording.tsx:157`
- `src/components/DebugPanel.tsx:64`

Recommandations:
- Supprimer logs de payload métier en prod.
- Ajouter helper logger redaction (`[REDACTED]`) et gating `import.meta.env.DEV`.

### SEC-004 — Scripts tiers sans CSP stricte
Impact: surface d’attaque supply chain/XSS élargie.

Preuves:
- `index.html:17`
- `index.html:27`

Recommandations:
- Ajouter headers CSP dans `netlify.toml` (`default-src 'self'; script-src ...; connect-src ...`).
- Réduire les scripts inline (nonce/hash) et centraliser chargement.

### SEC-005 — Risque de fuite future de secret Notion côté client
Impact: si implémenté en l’état, le token Notion serait exposé au navigateur.

Preuves:
- `src/lib/notion.ts:4`
- `src/lib/notion.ts:17`
- `README.md:71`

Recommandations:
- Ne jamais utiliser `VITE_NOTION_TOKEN` pour un secret réel.
- Déplacer entièrement l’appel Notion dans Supabase Edge Function/Backend.

## Moyen

### PERF-001 — Écritures Supabase à chaque frappe dans le formulaire HITL
Impact: latence perçue, surcharge réseau, coût DB, risque de conflits de sauvegarde.

Preuves:
- `src/components/Screen3HITL.tsx:30`
- `src/components/Screen3HITL.tsx:35`
- `src/components/Screen3HITL.tsx:120`
- `src/components/Screen3HITL.tsx:130`

Recommandations:
- Debounce 300-600ms minimum ou passage à sauvegarde `onBlur`.
- Bouton “Enregistrer” explicite pour batch update.

### PERF-002 — Chargement backoffice non paginé et `select('*')`
Impact: temps de chargement et mémoire croissants avec volume tickets/transcripts.

Preuves:
- `src/components/Backoffice.tsx:24`
- `src/components/Backoffice.tsx:26`

Recommandations:
- Ajouter pagination (`range`) + projection partielle des colonnes.
- Charger transcript complet à la demande sur détail ticket.

### PERF-003 — Double initialisation PostHog
Impact: duplication potentielle d’événements, overhead réseau et bruit analytics.

Preuves:
- `index.html:18`
- `src/main.tsx:8`

Recommandations:
- Garder une seule init (idéalement `src/main.tsx`), pilotée par env.

### REL-001 — Validation de configuration absente (env)
Impact: erreurs runtime difficiles à diagnostiquer en cas de variables manquantes.

Preuves:
- `src/lib/supabase.ts:4`
- `src/lib/supabase.ts:7`
- `src/lib/gamilab.ts:51`

Recommandations:
- Ajouter validation au démarrage (ex: `assertEnv`) avec message bloquant explicite.

## Faible

### PERF-004 — Recalculs fréquents côté Backoffice
Impact: coût CPU client évitable sur gros volumes.

Preuves:
- `src/components/Backoffice.tsx:71`
- `src/components/Backoffice.tsx:79`

Recommandations:
- Mémoriser (`useMemo`) `filteredTickets` et `statusCounts`.

## Plan d’exécution détaillé (tickets techniques)

1. Durcissement DB/RLS
- Écrire migration de retrait des policies `anon` permissives.
- Ajouter policies minimales par rôle authentifié.
- Ajouter CHECK constraints (`status`, `priority`, `language`, longueur champs critiques).

2. Hygiène secrets/intégrations
- Supprimer `VITE_NOTION_TOKEN` des flows front.
- Implémenter Edge Function Notion (token stocké côté serveur).
- Revoir README pour distinguer variables publiques vs secrètes.

3. Réactivité UX
- Remplacer autosave par debounce/batch.
- Ajouter pagination backoffice + lazy details.
- Ajouter toasts + gestion fine des erreurs réseau.

4. Observabilité et garde-fous
- Logger structuré sans PII.
- Ajout d’un mode debug strictement DEV.
- KPI: temps moyen sauvegarde, erreurs Supabase, taille payload.

## Vérifications effectuées / limites

Vérifications réalisées:
- Revue statique des composants principaux, libs et migration SQL.
- Inspection config Vite/Netlify/index.

Limites:
- `npm run typecheck` et `npm run build` non exécutables localement car dépendances non installées (`tsc` et `vite` introuvables).
- Aucune campagne de test E2E ni test de charge exécutée dans cet audit.

## Conclusion

Priorité absolue: corriger RLS + désactiver le seed runtime + nettoyer logs sensibles.
Ensuite: traiter la réactivité (autosave, pagination) pour améliorer la qualité perçue et la scalabilité.
