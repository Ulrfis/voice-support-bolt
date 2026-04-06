# Deploiement sur Coolify (self-hosted)

Ce guide explique comment deployer l'application **Audiogami Voice Support Demo** sur une instance Coolify auto-hebergee.

Le projet est une **SPA React/Vite** compilee en fichiers statiques servis par Nginx. Il n'y a pas de serveur Node.js en production.

---

## Fichiers de deploiement inclus dans le repo

| Fichier | Role |
|---|---|
| `Dockerfile` | Build multi-stage : Node 20 pour compiler, Nginx Alpine pour servir |
| `nginx.conf` | Config Nginx avec regle SPA (`try_files`) et gzip |
| `netlify.toml` | Config Netlify (alternatif a Coolify) |

---

## Prerequis

- Instance Coolify v4+ accessible
- Serveur avec Docker (gere par Coolify)
- Acces au depot Git depuis Coolify (GitHub, GitLab, Gitea, depot prive)

---

## 1. Creer une nouvelle ressource dans Coolify

1. Dashboard Coolify → **New Resource** → **Application**
2. Source : **Git Repository**
3. Connecter le depot et selectionner la branche `main`

---

## 2. Configurer le build

Dans les parametres de l'application, choisir **Dockerfile** comme build pack.

| Champ | Valeur |
|---|---|
| **Build Pack** | `Dockerfile` |
| **Dockerfile Path** | `./Dockerfile` |
| **Port** | `80` |

Le `Dockerfile` a la racine du projet gere tout automatiquement :
- Installation des dependances (`npm ci`)
- Build Vite (`npm run build`)
- Copie du `dist/` dans Nginx

> **Important** : les variables d'environnement `VITE_*` sont injectees **au moment du build**. Elles doivent etre configurees dans Coolify **avant** de lancer le premier deploiement.

---

## 3. Variables d'environnement

Dans Coolify → **Environment Variables**, ajouter les variables suivantes.

Cocher **"Build Variable"** pour chacune (les variables `VITE_*` sont injectees au build, pas au runtime).

### Supabase

```
VITE_SUPABASE_URL=https://lfyrrsnhxrhnkagubokt.supabase.co
VITE_SUPABASE_ANON_KEY=<votre_clef_anon_supabase>
```

### Gamilab SDK — Portails FR

```
VITE_GAMILAB_PORTAL_IT_SUPPORT_ID=33
VITE_GAMILAB_PORTAL_IT_SUPPORT_TOKEN=<embed_token_portal_it_support_fr>
VITE_GAMILAB_PORTAL_ECOMMERCE_ID=34
VITE_GAMILAB_PORTAL_ECOMMERCE_TOKEN=<embed_token_portal_ecommerce_fr>
VITE_GAMILAB_PORTAL_SAAS_ID=35
VITE_GAMILAB_PORTAL_SAAS_TOKEN=<embed_token_portal_saas_fr>
VITE_GAMILAB_PORTAL_DEV_PORTAL_ID=36
VITE_GAMILAB_PORTAL_DEV_PORTAL_TOKEN=<embed_token_portal_dev_fr>
```

### Gamilab SDK — Portails EN

```
VITE_GAMILAB_PORTAL_IT_SUPPORT_EN_ID=33
VITE_GAMILAB_PORTAL_IT_SUPPORT_EN_TOKEN=<embed_token_portal_it_support_en>
VITE_GAMILAB_PORTAL_ECOMMERCE_EN_ID=43
VITE_GAMILAB_PORTAL_ECOMMERCE_EN_TOKEN=<embed_token_portal_ecommerce_en>
VITE_GAMILAB_PORTAL_SAAS_EN_ID=44
VITE_GAMILAB_PORTAL_SAAS_EN_TOKEN=<embed_token_portal_saas_en>
VITE_GAMILAB_PORTAL_DEV_PORTAL_EN_ID=45
VITE_GAMILAB_PORTAL_DEV_PORTAL_EN_TOKEN=<embed_token_portal_dev_en>
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

---

## 4. Domaine et HTTPS

1. Coolify → **Domains** → ajouter votre domaine
2. Activer **Let's Encrypt** pour le certificat SSL automatique
3. Verifier que les DNS pointent vers l'IP du serveur Coolify

---

## 5. Lancer le premier deploiement

1. Cliquer **Deploy**
2. Suivre les logs :
   - `npm ci` — installation des dependances
   - `npm run build` — compilation Vite
   - Demarrage du conteneur Nginx sur le port 80
3. L'application est accessible sur le domaine configure

---

## 6. Deploiements automatiques (CI/CD)

1. Dans Coolify, activer **Auto Deploy** sur la branche `main`
2. Coolify cree un webhook sur le depot Git
3. Chaque push declenche un nouveau build automatiquement

---

## 7. Supabase — configuration des origines autorisees

Dans le dashboard Supabase du projet :

1. **Authentication → URL Configuration**
2. Ajouter l'URL de production dans **Allowed Origins** :
   ```
   https://votre-domaine.com
   ```

---

## 8. Checklist post-deploiement

- [ ] Page d'accueil charge correctement
- [ ] Changement de langue FR/EN fonctionne
- [ ] Navigation vers un use case charge l'ecran d'enregistrement
- [ ] Console browser : aucune erreur `join crashed`
- [ ] Panel debug accessible via `?debug-panel` dans l'URL
- [ ] HTTPS actif (cadenas dans la barre d'adresse)

---

## 9. Troubleshooting

### Erreur 404 sur les routes

Le `nginx.conf` inclus dans le repo contient la regle `try_files $uri $uri/ /index.html` qui redirige toutes les routes vers l'app React. Si cette erreur apparait, verifier que le `nginx.conf` est bien copie dans le conteneur (etape `COPY nginx.conf` du Dockerfile).

### Variables d'environnement manquantes / mal appliquees

Les variables `VITE_*` sont embarquees **au moment du build** dans le bundle JS. Si une variable est ajoutee ou modifiee dans Coolify apres un deploiement, il faut **relancer un deploiement complet** — redemarrer le conteneur ne suffit pas.

### Le SDK Gamilab ne se charge pas

Verifier que le serveur autorise les connexions sortantes vers `gamilab.ch`. Le SDK est charge depuis `https://gamilab.ch/js/sdk.js`.

Si la console affiche `join crashed`, verifier d'abord que le portail est appele avec son **embed token** (`use_portal(id, token)`) et que toutes les variables `VITE_GAMILAB_PORTAL_*_TOKEN` sont bien definies en **Build Variable** avant de redeployer.

### Erreur PostHog au demarrage

Si `VITE_POSTHOG_KEY` n'est pas definie, PostHog s'initialise avec une cle vide et emet un warning. L'app continue de fonctionner normalement. Pour desactiver PostHog completement, laisser la variable vide.

### Build echoue sur `npm ci`

Verifier que le fichier `package-lock.json` est bien commite dans le depot. `npm ci` requiert ce fichier. Ne pas utiliser `npm install` dans le Dockerfile.
