# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [0.3.1] - 2026-02-19

### Corrigé
- **Conformité SDK Gamilab** : suppression de toutes les surcouches redondantes avec ce que le SDK gère nativement
- `waitForGami()` : timeout 10s supprimé — le SDK émet `gami:init` quand il est prêt, s'il ne charge pas c'est un problème réseau et la session ne fonctionnerait de toute façon pas
- `Screen2Recording` : retry automatique avec backoff exponentiel supprimé — le SDK gère les retries en interne
- `Screen2Recording` : détection manuelle de la permission microphone supprimée — `start_recording()` gère les permissions navigateur nativement selon la doc SDK
- `Screen2Recording` : accumulation manuelle des transcripts supprimée — `thread:text_history` fournit l'historique complet à chaque événement (plus besoin de concaténer avec le transcript précédent)
- `Screen2Recording` : merge structurel manuel supprimé — `thread:struct_current` fournit les données structurées complètes à chaque événement (plus besoin de `{ ...prev, ...mapped }`)

---

## [0.3.0] - 2026-02-19

### Ajouté
- **Fiabilité enregistrement** : machine d'état d'initialisation à 6 phases (`loading_sdk` → `connecting` → `joining_portal` → `creating_thread` → `registering_events` → `ready`) avec feedback visuel détaillé à chaque étape
- **Retry automatique** : jusqu'à 3 tentatives avec backoff exponentiel (1s, 2s, 4s) en cas d'échec d'initialisation du SDK ou de la connexion WebSocket
- **Timeout SDK** : `waitForGami()` échoue proprement après 10 secondes si le script SDK ne se charge pas (au lieu de bloquer indéfiniment)
- **Détection permission micro** : message d'erreur spécifique et actionnable si l'accès au microphone est refusé par le navigateur
- **Aller-retour HITL ↔ Enregistrement** : retour fonctionnel depuis la page de validation vers l'enregistrement — les données existantes (champs structurés + transcript) sont conservées et enrichies par la nouvelle session vocale
- **Cumul des transcripts** : chaque session d'enregistrement ajoute au transcript existant au lieu de le remplacer
- **Merge structurel** : les données structurées Gamilab de la nouvelle session sont fusionnées (merge) avec les données existantes — les nouveaux champs s'ajoutent, les champs existants sont mis à jour

### Corrigé
- `Screen2Recording` : le composant ne bloquait plus indéfiniment sur "Connexion..." si le SDK ne se chargeait pas
- `Screen2Recording` : les events SDK (`struct_current`, `text_history`) reçus après démontage du composant ne corrompent plus l'état React (guard `mountedRef`)
- `Screen2Recording` : `struct_current: null` émis à l'init du thread est ignoré (seuls les objets non-vides sont mergés)
- `Screen3HITL` : le bouton "Retour à l'enregistrement" / "Dicter à la voix" remonte les données du formulaire courant (pas les données initiales) avant de naviguer
- `App.tsx` : les données structurées sont mergées (`{...ticketData, ...data}`) au lieu d'être remplacées lors du retour de l'enregistrement
- Imports inutilisés supprimés (`Language`, `useEffect`, `Category`, `pass2Prompt`)

---

## [0.2.6] - 2026-02-19

### Corrigé
- **Responsive mobile complet** sur tous les écrans de l'application
- `Screen1Home` : indicateur d'étapes (1-2-3) s'empile verticalement sur mobile, les cartes cas d'usage passent en 1 colonne sur petit écran
- `Screen2Recording` : grille 5 colonnes (questions + transcription) remplacée par une mise en page empilée sur mobile/tablette (`lg:grid-cols-5` uniquement sur grand écran)
- `Screen3HITL` : les 3 selects statut/priorité/catégorie passent en colonne unique sur mobile (`sm:grid-cols-3`), boutons d'action empilés sur mobile
- `Screen4Confirmation` : métadonnées du ticket en grille 2×2 sur mobile au lieu de 4 colonnes fixes
- `Backoffice` : barre de recherche+filtre empilée sur mobile, modal en sheet depuis le bas sur mobile (rounded-t-xl), grille des stats avec breakpoint intermédiaire (`sm:grid-cols-3`), grille de détails du ticket responsive
- `App.tsx` : panel debug (`pr-[380px]`) activé uniquement sur grand écran (`lg:pr-[380px]`) pour ne pas écraser le contenu mobile

---

## [0.2.5] - 2026-02-19

### Corrigé
- `Channel error` persistant sur `append_record_data` / `init_audio` : cause racine identifiée — `disconnect()` + `connect()` crée un nouveau socket **sans réinitialiser** `portal_channel` et `thread_channel` dans le singleton SDK. Ces propriétés pointaient toujours vers les anciens canaux de l'ancien socket (déconnecté). `create_thread()` appelait `this.portal_channel.push("create_thread")` sur un canal invalide, retournant possiblement les infos d'un ancien thread. Le `thread_channel` créé ensuite était basé sur cet état corrompu → `init_audio` rejeté → Channel error.
- `disconnectGami()` supprimé de `gamilab.ts` et de tous les appels dans `Screen2Recording` — le socket ne doit **jamais** être déconnecté/reconnecté entre les sessions
- `connectGami()` garde son flag `_connected` — la connexion est établie une seule fois pour toute la durée de vie de l'application
- `use_portal()` + `create_thread()` sont appelés à chaque montage du composant sur le socket **existant** — ces opérations recréent proprement `portal_channel` et `thread_channel` sans toucher au socket

### Analysé (hypothèses explorées avant résolution)
- Hypothèse 1 : le `thread_channel` était en état `errored` après une session précédente → solution v0.2.4 `disconnectGami()` → inefficace car `disconnect()` ne reset pas les propriétés internes du SDK
- Hypothèse 2 : problème d'authentification, clé API non passée au WebSocket → SDK source analysé : les portals sont publics, auth via token de thread, pas de clé API WebSocket requise
- Hypothèse 3 (confirmée) : `connect()` dans le SDK Gamilab ne reset pas `portal_channel`, `thread_channel`, `thread_info` ni `seq` — ces propriétés survivent au cycle disconnect/connect et pointent vers des canaux invalides

---

## [0.2.4] - 2026-02-19

### Corrigé (solution partielle — supersédée par v0.2.5)
- `disconnectGami()` ajouté pour forcer un cycle disconnect/reconnect avant chaque session
- Cette approche s'est révélée incorrecte : `disconnect()` dans le SDK ne reset pas l'état interne (`portal_channel`, `thread_channel`), rendant la reconnexion corrompue

---

## [0.2.3] - 2026-02-19

### Corrigé
- `connectGami()` : extraction du `connect()` dans une fonction dédiée avec flag `_connected` — empêche les appels multiples à `connect()` sur le singleton Gamilab lors du remontage du composant (cause du `Channel error` sur Netlify)
- `Screen2Recording` : suppression du `disconnect()` au démontage du composant — déconnecter le singleton rompait la session WebSocket de manière irréversible pour les navigations suivantes
- `Screen2Recording` : utilisation de `connectGami()` au lieu de `gami.connect()` directement pour garantir l'idempotence des connexions successives

---

## [0.2.2] - 2026-02-18

### Corrigé
- `mapStructToTicket()` : ajout d'un guard `if (!struct) return {}` — le SDK envoie `null` sur `thread:struct_current` lors de l'init du thread, provoquant une `TypeError: Cannot read properties of null (reading 'device')` qui corrompait l'état du SDK et bloquait les enregistrements suivants
- `handleStopRecording` : ajout d'un verrou `isStoppingRef` qui empêche le double-appel à `pause_recording()` (l'UI ne répondait pas visuellement immédiatement, ce qui poussait l'utilisateur à recliquer)
- `handleStopRecording` : `isRecording` et `isProcessing` sont maintenant mis à jour immédiatement au clic, sans attendre l'événement SDK `audio:recording → stopped` (qui pouvait ne jamais arriver)
- `finalizeExtraction()` : force `setIsRecording(false)` pour garantir le déblocage de l'UI même si l'événement SDK n'arrive pas
- Timeout précédent effacé avant d'en créer un nouveau dans `handleStopRecording`

---

## [0.2.0] - 2026-02-18

### Ajouté
- Intégration complète du SDK navigateur Gamilab (WebSocket temps réel)
- Enregistrement audio réel via microphone — remplacement total de la simulation
- 4 Modèles Gamilab créés automatiquement via l'API REST (IT Support, E-commerce, SaaS, Dev Portal) avec schémas correspondant exactement au type `Ticket`
- 4 Portails Gamilab créés (IDs : 33 IT Support, 34 E-commerce, 35 SaaS, 36 Dev Portal)
- Transcription en direct (`thread:text_current`) affichée avec curseur animé pendant l'enregistrement
- Extraction structurée en temps réel (`thread:struct_current`) — les champs s'affichent au fur et à mesure que l'IA les identifie
- Gestion d'état de l'enregistrement via l'événement `audio:recording` du SDK
- Indicateur visuel pulsant (bouton rouge animé) pendant l'enregistrement actif
- Visualiseur de forme d'onde animé en attente de données extraites
- Phase de traitement avec spinner après arrêt de l'enregistrement
- Détection automatique des champs manquants (required fields non remplis)
- Possibilité d'enregistrement complémentaire ciblé sur les champs manquants
- Prompt dynamique généré à partir des champs réellement manquants
- Connexion/déconnexion propre du SDK au montage/démontage du composant
- Gestion d'erreurs avec bouton "Réessayer" en cas d'échec de connexion
- Barre de progression animée basée sur l'état réel (connexion → enregistrement → traitement → terminé)
- Module `src/lib/gamilab.ts` : interface TypeScript du SDK, `waitForGami()`, `mapStructToTicket()`, constante `PORTAL_IDS`
- Module `src/lib/notion.ts` : placeholder pour push Notion (scaffolding complet prêt pour implémentation via Edge Function)
- Section "Push to Notion" dans l'écran de confirmation avec état visuel et instructions de configuration
- Script SDK Gamilab ajouté dans `index.html` (`defer`)
- 18 nouvelles clés de traduction FR/EN dans `LanguageContext`
- Variables d'environnement : `VITE_GAMILAB_API_KEY`, `VITE_GAMILAB_PORTAL_*`, `VITE_NOTION_TOKEN`, `VITE_NOTION_DATABASE_ID`

### Modifié
- `Screen2Recording` : réécriture complète — suppression de la simulation typewriter, intégration SDK réelle
- `Screen4Confirmation` : ajout du bloc Notion avec icône, statut et bouton d'action
- `LanguageContext` : 18 nouvelles clés pour les états d'enregistrement et Notion

### Supprimé
- Simulation typewriter (effet machine à écrire demo)
- Boutons "Test Passe 1" / "Test Passe 2"
- Dépendance à `transcriptExamples` dans l'écran d'enregistrement
- Logique de sélection aléatoire d'exemples prédéfinis

---

## [0.1.0] - 2025-11-30

### Ajouté
- Structure initiale du projet (Vite + React + TypeScript + Tailwind CSS)
- Système de routage entre 4 écrans : Home, Recording, HITL, Confirmation
- 4 cas d'usage : IT Support, E-commerce, SaaS, Dev Portal
- Simulation de transcription en deux passes avec effet typewriter (40ms/char)
- Données d'exemple de transcripts en FR/EN pour chaque cas d'usage
- Écran HITL (Human-In-The-Loop) avec édition de tous les champs extraits
- Auto-sauvegarde des champs dans Supabase à chaque modification
- Gestion du statut, priorité, catégorie et tags par cas d'usage
- Validation des champs obligatoires avant soumission
- Écran de confirmation avec agents disponibles et temps estimés
- Back-office avec tableau de bord, filtres, recherche et export CSV
- Support bilingue complet FR/EN avec LanguageContext
- Intégration Supabase (table `tickets` avec RLS)
- Migration SQL initiale pour la table tickets
- Seed de données de démo (6 tickets)
- Branding Audiogami : logo, favicon, meta tags OG/Twitter
- Intégration PostHog analytics
- Système de couleurs custom Tailwind (spicy-sweetcorn, chunky-bee, rockman-blue…)
- Composant Backoffice avec modal de détails, suppression, export CSV

---

<!--
GUIDE RAPIDE:
- "Ajouté" pour les nouvelles fonctionnalités
- "Modifié" pour les changements de fonctionnalités existantes
- "Déprécié" pour les fonctionnalités qui seront supprimées
- "Supprimé" pour les fonctionnalités supprimées
- "Corrigé" pour les corrections de bugs
- "Sécurité" pour les vulnérabilités corrigées

VERSIONING:
- 0.x.x = prototype/dev
- 1.0.0 = première release stable
- x.Y.x = nouvelle fonctionnalité
- x.x.Z = correction de bug
-->
