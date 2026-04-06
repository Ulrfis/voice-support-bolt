# Deploiement sur Coolify (self-hosted)

Ce guide explique comment deployer l'application **Audiogami Voice Support Demo** sur une instance Coolify auto-hebergee.

---

## Prerequis

- Une instance Coolify fonctionnelle (v4+) accessible via son dashboard
- Un serveur avec Docker installe (Coolify le gere automatiquement)
- Le depot Git de l'application accessible depuis Coolify (GitHub, GitLab, Gitea, ou depot prive)
- Node.js 20 (gere automatiquement via Nixpacks ou Dockerfile)

---

## 1. Creer une nouvelle ressource dans Coolify

1. Dans le dashboard Coolify, cliquer sur **New Resource**
2. Choisir **Application**
3. Selectionner la source : **Git Repository**
4. Connecter votre depot (GitHub, GitLab, etc.) et selectionner le bon repo
5. Choisir la branche a deployer (ex: `main`)

---

## 2. Configurer le build

Dans les parametres de l'application :

| Champ | Valeur |
|---|---|
| **Build Pack** | `Nixpacks` (recommande) ou `Dockerfile` |
| **Build Command** | `npm run build` |
| **Start Command** | *(laisser vide, voir section Nginx ci-dessous)* |
| **Publish Directory** | `dist` |
| **Node Version** | `20` |

> **Important** : cette application est un site statique (SPA React/Vite). Il n'y a pas de serveur Node.js a lancer en production. Le `dist/` genere doit etre servi par un serveur statique.

---

## 3. Servir le site statique avec Nginx

Coolify peut servir directement les fichiers statiques. Deux options :

### Option A — Nixpacks (automatique)

Coolify detecte automatiquement un projet Vite/React et configure Nginx pour servir `dist/`. Verifier que le **Publish Directory** est bien `dist`.

### Option B — Dockerfile personnalise

Creer un fichier `Dockerfile` a la racine du projet :

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Et un fichier `nginx.conf` a la racine :

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

> Le `try_files ... /index.html` est **obligatoire** pour que le routage SPA fonctionne (memes routes que le `redirects` Netlify).

---

## 4. Variables d'environnement

Dans Coolify, aller dans **Environment Variables** et ajouter les variables suivantes. Ces valeurs correspondent a celles du fichier `.env` local.

### Supabase

```
VITE_SUPABASE_URL=https://lfyrrsnhxrhnkagubokt.supabase.co
VITE_SUPABASE_ANON_KEY=<votre_clef_anon_supabase>
```

### Gamilab SDK

```
VITE_GAMILAB_API_KEY=<votre_clef_api_gamilab>

VITE_GAMILAB_PORTAL_IT_SUPPORT_ID=33
VITE_GAMILAB_PORTAL_ECOMMERCE_ID=34
VITE_GAMILAB_PORTAL_SAAS_ID=35
VITE_GAMILAB_PORTAL_DEV_PORTAL_ID=36

VITE_GAMILAB_PORTAL_IT_SUPPORT_EN_ID=33
VITE_GAMILAB_PORTAL_ECOMMERCE_EN_ID=43
VITE_GAMILAB_PORTAL_SAAS_EN_ID=44
VITE_GAMILAB_PORTAL_DEV_PORTAL_EN_ID=45
```

### PostHog (analytics)

```
VITE_POSTHOG_KEY=<votre_clef_posthog>
VITE_POSTHOG_HOST=https://eu.i.posthog.com
```

### Notion (optionnel)

```
VITE_NOTION_TOKEN=
VITE_NOTION_DATABASE_ID=
```

> **Note securite** : ne jamais committer le fichier `.env` avec les valeurs reelles. Ces variables sont injectees par Vite au moment du build (`import.meta.env.*`). Elles sont donc embarquees dans le bundle JS — ne pas y mettre de secrets sensibles cote serveur.

---

## 5. Domaine et HTTPS

1. Dans Coolify, aller dans **Domains**
2. Ajouter votre domaine (ex: `voice-support-demo.audiogami.com`)
3. Activer **Let's Encrypt** pour le certificat SSL automatique
4. Verifier que les DNS pointent vers l'IP de votre serveur Coolify

---

## 6. Lancer le premier deploiement

1. Cliquer sur **Deploy** dans le dashboard Coolify
2. Suivre les logs en temps reel pour verifier :
   - Installation des dependances (`npm ci`)
   - Build Vite (`npm run build`)
   - Demarrage du conteneur Nginx
3. Une fois le deploiement termine, l'application est accessible sur le domaine configure

---

## 7. Deploiements automatiques (CI/CD)

Pour declencher un deploiement automatique a chaque push sur la branche :

1. Dans Coolify, activer **Auto Deploy** sur la branche `main`
2. Coolify cree automatiquement un webhook sur le depot Git
3. Chaque push declenchera un nouveau build et deploiement sans interruption (rolling deploy)

---

## 8. Verification post-deploiement

Une fois deploye, verifier :

- [ ] La page d'accueil charge correctement
- [ ] Le changement de langue (FR/EN) fonctionne
- [ ] La navigation vers un use case charge l'ecran d'enregistrement
- [ ] Le SDK Gamilab se charge (pas d'erreur `join crashed` dans la console)
- [ ] Le panel debug accessible via `?debug-panel` dans l'URL

---

## 9. Troubleshooting

### Erreur 404 sur les routes

Le serveur Nginx doit rediriger toutes les routes vers `index.html`. Verifier la config `nginx.conf` avec `try_files $uri $uri/ /index.html`.

### Variables d'environnement manquantes

Les variables `VITE_*` sont injectees **au build**. Si une variable est ajoutee apres le premier build, il faut **relancer un deploiement** (pas juste redemarrer le conteneur).

### Le SDK Gamilab ne se charge pas

Verifier que le serveur autorise les requetes sortantes vers `gamilab.ch` (pas de firewall bloquant). Le SDK est charge depuis `https://gamilab.ch/js/sdk.js` via une balise `<script>`.

### Erreur CORS avec Supabase

L'URL du projet Supabase doit etre ajoutee dans les **Allowed Origins** du projet Supabase (Authentication > URL Configuration).
