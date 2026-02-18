# Audiogami — Development Story

> **Status**: 🟡 In Progress
> **Creator**: Ulrich Fischer
> **Started**: 2025-11-30
> **Last Updated**: 2026-02-18 (v0.2.2)

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
