# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

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
