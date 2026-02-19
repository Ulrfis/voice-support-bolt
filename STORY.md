# Audiogami — Development Story

> **Status**: 🟡 In Progress
> **Creator**: Ulrich Fischer
> **Started**: 2025-11-30
> **Last Updated**: 2026-02-19 (v0.3.1)

---

## Genesis Block

*Fill this section BEFORE starting development. This is your "before" snapshot.*

### The Friction

*What personal pain, frustration, or observation sparked this project? Be specific and honest.*

```
[Your authentic starting point — the "I was frustrated because..." or "I noticed that..." moment]
```

### The Conviction

*Why does this matter? Why you? Why now?*

```
[Your "why" — not the business case, but the personal belief]
```

### Initial Vision

*What did you imagine building? Paste your original PRD, brief, or first prompt here.*

```
[Original PRD or initial description — preserve exactly as written, warts and all]
```

### Target Human

*Who is this for? One specific person archetype.*

```
[Describe them: their context, their struggle, what success looks like for them]
```

### Tools Arsenal

*What vibe-coding tools are you using?*

| Tool | Role |
|------|------|
| Bolt.new | Prototypage UI initial, structure du projet |
| Claude (Sonnet 4.6) | Logique, intégrations API, refactoring, documentation |

---

## Feature Chronicle

*Each feature gets an entry. Major features (🔷) get full treatment. Minor features (🔹) get brief notes.*

### Entry Template

```markdown
### [DATE] — [FEATURE NAME] 🔷/🔹

**Intent**: What you wanted to achieve
**Prompt(s)**: Key prompts used (can be summarized)
**Tool**: Which tool handled this
**Outcome**: What actually happened
**Surprise**: Anything unexpected (good or bad)
**Friction**: Blockers encountered
**Resolution**: How blockers were solved (if solved)
**Time**: Approximate duration
```

---

### 2025-12-15 — Branding Setup (Favicon & OG Image) 🔹

**Intent**: Set up proper branding with Audiogami logo for favicon and social sharing

**Outcome**: Updated index.html with Audiogami logo as favicon and added comprehensive OG/Twitter meta tags for social sharing

**Time**: ~2 min

---

### 2026-02-18 — Intégration SDK Gamilab (Enregistrement & Extraction Réels) 🔷

**Intent**: Remplacer la simulation typewriter demo par une vraie expérience : enregistrement microphone réel, transcription live, extraction structurée en temps réel via Gamilab, puis push vers Notion.

**Prompt(s)**:
> "Il faut intégrer la SDK de Gamilab, voir les fichiers attachés pour la documentation. L'objectif est de pouvoir remplacer la mécanique demo par un réel usage de la SDK Gamilab permettant de faire l'expérience réellement, avec Gamilab qui fait la transcription + transformation et ensuite pousser le résultat structuré vers Notion."

**Tool**: Claude (Sonnet 4.6)

**Outcome**:
- 4 Modèles Gamilab créés via l'API REST avec schémas mappés exactement sur le type `Ticket` TypeScript
- 4 Portails créés (un par cas d'usage), IDs stockés en variables d'environnement
- `Screen2Recording` entièrement réécrit — plus aucune donnée simulée
- Connexion WebSocket automatique au montage du composant, création de thread, démarrage d'enregistrement
- Transcription live avec curseur animé, champs structurés qui apparaissent au fur et à mesure
- Détection des champs manquants → proposition d'enregistrement complémentaire ciblé
- Architecture Notion scaffoldée (placeholder prêt pour Edge Function Supabase)
- Build propre, zéro erreur TypeScript

**Surprise**: Le SDK Gamilab a un mécanisme de retry sur `gami:init` — si `Gami()` n'est pas appelé, l'événement se re-déclenche. Ce comportement rend l'initialisation robuste sans avoir à gérer de race condition complexe.

**Friction**:
- La distinction entre extraction "en cours pendant l'enregistrement" et "finalisée après arrêt" nécessitait un guard ref (`finalizingRef`) pour éviter les faux positifs sur `thread:extraction_status: done`.
- L'API Notion ne supporte pas les appels directs depuis le navigateur (CORS) — nécessite une Edge Function Supabase pour le push.

**Resolution**: Guard ref synchrone (`finalizingRef.current = true` avant `pause_recording()`) résout proprement la détection de fin d'extraction. Push Notion architecturé comme placeholder avec instructions claires.

**Time**: ~45 min

---

### 2026-02-18 — Corrections Stabilité Enregistrement Multi-Pass 🔷

**Intent**: Corriger deux bugs critiques qui bloquaient le deuxième enregistrement (et les suivants) lors d'une session.

**Prompt(s)**:
> "j'ai essayé à nouveau et le démarrage enregistrement de la transcription a bloqué — TypeError: Cannot read properties of null (reading 'device')"
> "j'ai essayé de faire un deuxième enregistrement à la suite, et ça bloque, rien ne se passe"

**Tool**: Claude (Sonnet 4.6)

**Outcome**:
- Bug #1 corrigé : `mapStructToTicket(null)` plantait sur le premier champ du tableau (`device`) car le SDK Gamilab émet `thread:struct_current: null` à l'init du thread — guard ajouté
- Bug #2 corrigé : `handleStopRecording` n'avait pas de protection contre les double-appels — un verrou `isStoppingRef` + mise à jour immédiate de l'état UI sans attendre l'événement SDK

**Surprise**: Le premier bug (null device) se produisait à chaque init, mais l'erreur était non-fatale dans la majorité des cas — sauf qu'elle corrompait silencieusement l'état du SDK, ce qui expliquait pourquoi le deuxième enregistrement était parfois bloqué même si le premier semblait avoir fonctionné.

**Friction**: Notion Web Clipper avait affiché une notification "Démarrer la transcription" au même moment, ce qui semblait pointer vers une interférence audio externe — piste incorrecte. Le vrai bug était interne.

**Resolution**: Guard null dans `mapStructToTicket` + verrou UI dans `handleStopRecording` + `finalizeExtraction()` force maintenant `setIsRecording(false)` comme filet de sécurité.

**Time**: ~15 min

---

### 2026-02-19 — Correction Channel Error (Canaux Phoenix Fantômes) 🔷

**Intent**: Résoudre le `Channel error` persistant qui bloquait la transcription audio à chaque tentative d'enregistrement.

**Prompt(s)**:
> "J'ai toujours un souci pour transcrire l'input audio"
> *(Screenshot du DebugPanel montrant : connect → use_portal → create_thread → start_recording → `audio:recording → recording` → `Uncaught (in promise) Error: Channel error`)*
> "Il faut aller voir les bonnes ID depuis l'API Gamilab, et me donner les bonnes ID pour les divers Models"

**Tool**: Claude (Sonnet 4.6)

**Outcome**:
- Portal IDs vérifiés via `curl` sur l'API REST Gamilab avec la clé Bearer — 33/34/35/36 sont corrects, workspace 7 confirmé
- Code source du SDK Gamilab (`sdk.js`, ~1200 lignes minifiées) analysé en intégralité
- Cause racine identifiée : le `thread_channel.join()` échouait à cause d'un canal Phoenix précédent en état `errored` persistant dans le singleton, bloquant tous les `push` suivants via guard synchrone (`if(this.error) return reject`)
- Solution : `disconnectGami()` ajouté dans `gamilab.ts` + appelé en début d'init et au cleanup dans `Screen2Recording`
- Chaque session d'enregistrement repart maintenant d'un socket et d'un `thread_channel` frais

**Surprise**: Le SDK Gamilab expose clairement dans son code que `Channel.error` est irréversible une fois défini — le canal est mort et aucun push ne peut passer. Il faut absolument recréer le canal en entier. Ce n'est pas documenté dans la SDK doc publique mais lisible directement dans le source.

**Friction**:
- Première piste : les Portal IDs étaient peut-être incorrects (33/34/35/36 semblaient arbitraires). Vérification via API — piste incorrecte, les IDs sont bons.
- Deuxième piste : la clé API n'était pas passée au WebSocket `connect()`. Analyse du SDK source — piste incorrecte, le SDK Phoenix gère l'auth via subprotocol Bearer au niveau du socket, pas besoin de passer la clé API manuellement.
- Vraie cause : cycle de vie du singleton vs cycle de vie du composant React. Le composant se recrée à chaque navigation ; le singleton SDK non. Les canaux en erreur s'accumulent sans être nettoyés.

**Resolution**: `disconnectGami()` force un cycle complet avant chaque nouvelle session. Le flag `_connected` est reset, le socket se reconnecte proprement, les nouveaux canaux sont sains.

**Time**: ~30 min (dont ~15 min d'analyse du SDK source)

---

### 2026-02-19 — Channel Error Round 2 : Disconnect/Reconnect = Poison 🔷

**Intent**: Résoudre définitivement le `Channel error` sur `init_audio` / `append_record_data` qui persistait malgré le fix v0.2.4.

**Prompt(s)**:
> "j'ai retesté, cf capture d'écran — voir pourquoi l'enregistrement ne fonctionne pas (plus)"
> *(Logs : connect → use_portal(33) → create_thread → start_recording → `audio:recording → recording` → `Uncaught (in promise) Error: Channel error`)*

**Tool**: Claude (Sonnet 4.6)

**Outcome**:
- SDK source (`sdk.js`) analysé en profondeur : `connect()` dans la classe `A` crée un nouveau socket **mais ne reset aucune propriété interne** — `portal_channel`, `thread_channel`, `thread_info`, `seq`, `state` survivent intacts
- `create_thread()` appelle `this.portal_channel.push("create_thread")` — sur le vieux canal de l'ancien socket → comportement indéfini (probablement retourne les infos d'un ancien thread)
- `thread_channel` créé avec ces infos corrompues → `init_audio` push sur un canal invalide → `Channel error`
- Solution : ne **jamais** appeler `disconnect()` entre les sessions. Le socket reste connecté pour toute la vie de l'app. `use_portal()` + `create_thread()` à chaque montage du composant recréent les canaux proprement sur le socket existant
- `disconnectGami()` supprimé de `gamilab.ts` et de tous les usages dans `Screen2Recording`

**Surprise**: Le SDK Gamilab (basé sur Phoenix/Elixir) utilise un pattern de canaux qui s'appuient sur un socket persistant. Les portals Gamilab sont **publics** — aucune authentification WebSocket requise. L'auth se fait uniquement via le `token` retourné par `create_thread()`, passé dans les params du `thread_channel`. La connexion WebSocket elle-même est anonyme.

**Friction**:
- La v0.2.4 (disconnect/reconnect) était basée sur une lecture partielle du problème — le `Channel error` était bien un canal corrompu, mais la cause n'était pas l'accumulation de canaux fantômes, c'était la survie des propriétés internes après disconnect
- Signe trompeur dans les logs : `thread:extraction_status → done` arrivait immédiatement après `create_thread()`. Cela indiquait que le SDK récupérait l'état d'un ancien thread (celui du `portal_channel` corrompu), pas qu'un nouveau thread propre était créé

**Resolution**: Supprimer tout appel à `disconnect()`. Le socket est établi une fois, les canaux sont recréés à chaque session via `use_portal()` + `create_thread()`.

**Time**: ~30 min (dont ~20 min d'analyse du SDK source + hypothèses)

---

### 2026-02-19 — Fiabilité Enregistrement & Aller-Retour HITL ↔ Recording 🔷

**Intent**: Deux bugs bloquants : (1) l'enregistrement ne fonctionne pas a tous les coups (parfois rien ne se passe), (2) le retour depuis la page HITL vers l'enregistrement ne fonctionne pas -- les donnees sont perdues et une nouvelle session vocale ne peut pas enrichir un ticket existant.

**Prompt(s)**:
> "la mecanique enregistrement et transcription ne fonctionne pas a tous les coups; parfois rien ne se passe. Verifier pourquoi et assurer une mecanique qui fonctionne a 100%"
> "une fois que l'on est sur la page human in the loop et que l'on veut revenir sur la page enregistrement pour completer ou corriger, cela ne fonctionne pas"

**Tool**: Claude (Opus 4.6)

**Outcome**:
- Analyse complete du flux d'initialisation SDK : 5 points de defaillance identifies (pas de timeout sur `waitForGami()`, pas de retry, erreur micro silencieuse, events post-unmount, pas de re-init sans reload)
- Machine d'etat a 6 phases (`loading_sdk` → `connecting` → `joining_portal` → `creating_thread` → `registering_events` → `ready`) avec feedback bilingue a chaque etape
- Retry automatique 3x avec backoff exponentiel + timeout 10s sur chargement SDK
- Detection intelligente de la permission microphone (message specifique au lieu d'erreur generique)
- Guard `mountedRef` sur tous les callbacks SDK pour eviter les updates post-unmount
- Aller-retour HITL ↔ Recording : `Screen3HITL.onBack` remonte les donnees editees du formulaire, `App.tsx` les passe en `initialData` + `existingTranscript` au composant Recording
- Chaque nouvelle session cree un nouveau thread Gamilab (limitation SDK : pas de resume_thread cross-session), mais les donnees sont mergees au niveau React (`{...existingData, ...newData}`) et le transcript est cumule
- Build propre, zero erreur TypeScript

**Surprise**: Le SDK Gamilab ne supporte pas le "resume" d'un thread dans un nouveau contexte de composant. `resume_recording()` ne fonctionne que sur le thread courant du singleton. La solution est de creer un nouveau thread a chaque retour depuis HITL, laisser Gamilab re-extraire les nouveaux champs, et fusionner au niveau applicatif. Ce pattern de merge cote client est plus robuste que de tenter de reutiliser un thread zombie.

**Friction**:
- Le `waitForGami()` original ne rejectait jamais -- si le script SDK ne charge pas (CDN down, bloqueur), l'utilisateur restait bloque sur "Connexion..." indefiniment sans message d'erreur
- Le `thread:text_history` remplacait le transcript au lieu de l'appender -- sur un aller-retour, tout le transcript precedent etait ecrase par celui du nouveau thread

**Resolution**: Timeout 10s sur `waitForGami()`, retry avec backoff, AbortController pour annuler l'init au demontage, merge des donnees au niveau App, cumul des transcripts.

**Time**: ~30 min

---

### 2026-02-19 — Responsive Mobile Complet 🔷

**Intent**: Assurer une compatibilité 100% mobile sur tous les écrans — l'app devait être pleinement utilisable sur smartphone sans aucune mise en page cassée.

**Prompt(s)**:
> "Assurer compatibilité 100% maximale pour responsive. Vérifier que l'UI et l'UX fonctionnent bien sur desktop ET smartphone"

**Tool**: Claude (Sonnet 4.6)

**Outcome**:
- Audit complet de tous les composants — identification de 10 problèmes responsive classés par sévérité
- `Screen1Home` : indicateur d'étapes empilé verticalement sur mobile, cartes en 1 colonne
- `Screen2Recording` : grille 5 colonnes remplacée par `grid-cols-1 lg:grid-cols-5` — vue empilée sur mobile/tablette
- `Screen3HITL` : selects statut/priorité/catégorie en `sm:grid-cols-3`, boutons d'action en colonne sur mobile
- `Screen4Confirmation` : métadonnées du ticket en `grid-cols-2 sm:grid-cols-4`
- `Backoffice` : barre de filtres empilée, modal en bottom sheet sur mobile, breakpoint intermédiaire sur les stats, grille de détails responsive
- `App.tsx` : panel debug limité au grand écran (`lg:pr-[380px]`)
- Build propre — aucune erreur TypeScript ni CSS

**Surprise**: Le panel de debug en position fixe avec `pr-[380px]` appliqué sans breakpoint poussait tout le contenu hors écran sur mobile — silencieusement, sans erreur.

**Friction**: Patterns Tailwind inconsistants entre les composants — certains utilisaient déjà `md:` correctement, d'autres avaient des grilles hardcodées sans aucun breakpoint.

**Resolution**: Audit systématique composant par composant, corrections ciblées sans toucher à la logique métier.

**Time**: ~15 min

---

### 2026-02-19 — Nettoyage Conformité SDK Gamilab 🔹

**Intent**: Supprimer toutes les surcouches applicatives qui reproduisaient ce que le SDK Gamilab gère déjà nativement, sur la base d'une lecture attentive de la documentation SDK.

**Prompt(s)**:
> "Le retry est déjà dans la SDK, il faut pas mettre. Détection permission micro aussi dans la SDK il faut pas mettre. Cumul des transcripts non plus, la SDK le fait tout seul. Le merge structurel aussi la SDK fait. Timeout SDK -> il faut pas ça, il y a un event quand elle est chargée, si elle charge pas c'est que le réseau est merdique, donc dans ce cas elle marchera de toute façon pas."

**Tool**: Claude (Sonnet 4.6)

**Outcome**:
- `waitForGami()` : timeout 10s supprimé — attend `gami:init` sans limite, le SDK ne chargera pas si le réseau est down de toute façon
- Retry avec backoff exponentiel supprimé de `initSession()` — le SDK gère les retries en interne
- Détection manuelle de la permission micro supprimée de `handleStartRecording()` — `start_recording()` gère ça nativement
- `thread:text_history` : accumulation manuelle (`prev + ' ' + newText`) remplacée par un simple `setTranscript(text)` — le SDK livre l'historique complet
- `thread:struct_current` : merge manuel (`{ ...prev, ...mapped }`) remplacé par `setStructData(mapped)` — le SDK livre les données complètes
- Build propre, zéro erreur TypeScript

**Surprise**: La v0.3.0 avait réimplémenté plusieurs comportements en doublon du SDK, parfois en contradiction avec lui. En particulier l'accumulation des transcripts : le merge applicatif ajoutait du texte doublon lors d'une deuxième session dans un même thread.

**Friction**: Les comportements SDK n'étaient pas documentés de façon explicite dans les entrées précédentes de STORY — certaines surcouches avaient été ajoutées par précaution ("au cas où le SDK ne ferait pas X"), sans vérifier la doc.

**Resolution**: Lecture directe de la doc SDK (`SDK_doc_Gamilab.md`) et application stricte : si le SDK le fait, on ne le refait pas côté app.

**Time**: ~10 min

---

### 2026-02-18 — Documentation & Changelog 🔹

**Intent**: Documenter l'historique complet du projet dans CHANGELOG, README et STORY

**Outcome**: README réécrit avec architecture, tableau des portails, guide d'intégration Gamilab, instructions Notion. CHANGELOG initialisé avec v0.1.0 (prototype demo) et v0.2.0 (SDK réel). STORY mise à jour.

**Time**: ~5 min

---

## Pivots & Breakages

*Major direction changes, things that broke badly, abandoned approaches. This is where story gold lives.*

### [DATE] — [What Happened]

**What broke / What changed**: 

**Why**: 

**What you learned**: 

**Emotional state**: 

---

## Pulse Checks

*Subjective snapshots. AI should prompt these every 3-5 features or at major moments.*

### [DATE] — Pulse Check #[N]

**Energy level** (1-10): 

**Current doubt**: 

**Current satisfaction**: 

**If you stopped now, what would you regret?**: 

**One word for how this feels**: 

---

## Insights Vault

*Learnings that transcend this specific project. Things you'd tell someone starting a similar journey.*

- 2026-02-18: Quand un SDK Web utilise des événements pour son initialisation, toujours vérifier si un mécanisme de retry existe avant de complexifier la gestion de la race condition. Gamilab re-fire `gami:init` si `Gami()` n'est pas appelé — ça simplifie tout.
- 2026-02-18: Les APIs tierces (Notion, etc.) bloquent souvent les appels directs depuis le navigateur par CORS. Toujours prévoir une couche serveur (Edge Function) dès le scaffolding pour éviter de devoir refactorer plus tard.
- 2026-02-18: Un SDK peut émettre des événements "vides" (null, {}) lors de son initialisation — toujours défendre les fonctions de mapping contre ces valeurs limites. Ne pas supposer que les données reçues sont toujours valides même si elles viennent d'une source "contrôlée".
- 2026-02-18: Quand un bouton d'arrêt ne répond pas visuellement immédiatement, l'utilisateur reclique. La solution n'est pas un debounce — c'est de mettre à jour l'état UI instantanément au clic, sans attendre la confirmation du système sous-jacent.
- 2026-02-19: Les bugs "fonctionne en local, casse en prod" avec un SDK chargé via `<script>` sont presque toujours des problèmes de singleton + cycle de vie SPA. En local, HMR masque tout. En prod, le singleton persiste entre les navigations React. Toujours tester le flow complet (navigation aller-retour) dans un build de production avant de déclarer victoire.
- 2026-02-19: Quand un bug résiste à deux hypothèses successives, lire le code source du SDK. La documentation publique ne dit pas tout — le source montre que `Channel.error` est irréversible une fois posé. 30 secondes de lecture auraient évité 20 minutes sur de mauvaises pistes.
- 2026-02-19: Avant de chercher un bug d'authentification ou de configuration, vérifier les données de base via l'API directement (`curl` avec Bearer token). Ici : 2 commandes curl ont éliminé l'hypothèse "Portal IDs incorrects" en 30 secondes.
- 2026-02-19: Dans un SDK basé sur Phoenix Channels, `disconnect()` + `connect()` ne reset **pas** l'état interne. Les propriétés comme `portal_channel`, `thread_channel` survivent et pointent vers des canaux de l'ancien socket. La bonne approche : garder le socket vivant, recréer seulement les canaux (`use_portal()` + `create_thread()`) à chaque nouvelle session.
- 2026-02-19: Un log `thread:extraction_status → done` qui arrive immédiatement après `create_thread()` est un signal fort que le SDK opère sur un thread précédent (état corrompu), pas sur un thread frais. Ce pattern anormal aurait dû être identifié plus tôt.
- 2026-02-19: Quand un SDK tiers peut silencieusement echouer (pas de timeout, pas d'erreur visible), toujours ajouter ses propres timeouts et retries. Une Promise qui ne resolve jamais est pire qu'une erreur explicite.
- 2026-02-19: Pour un aller-retour entre deux ecrans qui enrichissent les memes donnees, ne pas essayer de reutiliser la session SDK -- creer une session fraiche et fusionner les resultats cote client. Le merge applicatif est plus previsible et debuggable qu'un resume d'etat SDK interne.
- 2026-02-19: Lire la doc SDK avant d'ajouter des gardes applicatives. Si le SDK gère le retry, les permissions micro, l'historique complet et les données complètes — ne pas le réimplémenter. Une surcouche qui double le SDK crée des conflits silencieux (ex : transcript dupliqué) et du code mort à maintenir.

---

## Artifact Links

*Screenshots, recordings, deployed URLs, social posts — external evidence of the journey.*

| Date | Type | Link/Location | Note |
|------|------|---------------|------|
| | | | |

---

## Narrative Seeds

*Raw material for the final story. Quotes, moments, metaphors that emerged during the build.*

- "[Something you said or thought that captures a moment]"
- "[A metaphor that emerged]"
- "[A user reaction worth preserving]"

---

## Story Synthesis Prompt

*When ready to generate the narrative, use this prompt with the entire STORY.md as context:*

```
You are helping me write the genesis story of Audiogami.

Using the documented journey in this file, craft a compelling narrative following this structure:
1. Open with the Friction (make readers feel the problem)
2. Establish my Conviction (why I had to build this)
3. Show the messy Process (failures, pivots, surprises)
4. Highlight key Progression moments (the wins that built momentum)
5. Weave in Human moments (from Pulse Checks)
6. Close with Durable Insights (what transcends this project)

Tone: Honest, specific, humble but confident. Like Pieter Levels meets Julia Evans.
Length: [specify: tweet thread / blog post / case study]
```

---

## AI Instructions

*These instructions are for the AI assistant helping build this project:*

```
STORY.md MAINTENANCE PROTOCOL:

1. AFTER EACH FEATURE:
   - Add entry to "Feature Chronicle"
   - 🔷 Major = new capability, significant UI change, integration
   - 🔹 Minor = bug fix, tweak, small improvement
   
2. ON ERRORS/PIVOTS:
   - Add entry to "Pivots & Breakages" immediately
   - Capture emotional context if shared
   
3. EVERY 3-5 FEATURES:
   - Trigger Pulse Check: Ask creator ONE question from:
     * "How's your energy right now, 1-10?"
     * "What's your biggest doubt at this moment?"
     * "What's giving you satisfaction in this build?"
     * "If you had to stop now, what would you regret not finishing?"
     * "One word for how this project feels today?"
   - Record answer in "Pulse Checks" section
   
4. ON INSIGHTS:
   - When creator expresses a learning, add to "Insights Vault"
   
5. ON ARTIFACTS:
   - When screenshots/links are shared, add to "Artifact Links"
   
6. ALWAYS:
   - Update "Last Updated" date
   - Preserve exact prompts when significant
   - Don't sanitize failures or confusion
```
