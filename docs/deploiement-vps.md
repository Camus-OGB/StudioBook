# Déploiement VPS — IMA Studio

Guide pour déployer l'application en production sur un VPS Linux (Ubuntu/Debian),
de façon **sécurisée** : Docker + reverse proxy HTTPS + firewall.

> Pré-requis : un VPS, un nom de domaine pointant vers son IP (enregistrement DNS A),
> accès SSH.

---

## 1. Préparer le serveur

```bash
sudo apt update && sudo apt upgrade -y
# Docker + plugin compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # se reconnecter ensuite
```

## 2. Firewall (n'ouvrir que l'essentiel)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

> Postgres (5432) et l'app (3000) sont liés à `127.0.0.1` dans `docker-compose.yml` :
> ils ne sont **pas** accessibles depuis l'extérieur. Ne les ouvre pas dans ufw.

## 3. Récupérer le code et configurer les secrets

```bash
git clone <repo> ima-studio && cd ima-studio
```

Génère le fichier `.env` avec des **secrets forts et aléatoires** (script fourni) :

```bash
sh scripts/generate-secrets.sh https://ton-domaine.bj
```

Le script crée un `.env` (permissions `600`) avec `POSTGRES_PASSWORD`,
`NEXTAUTH_SECRET` et `ADMIN_PASSWORD` générés aléatoirement, et **affiche le mot de
passe administrateur une seule fois** — note-le. Pour régénérer (écrase les secrets) :
`sh scripts/generate-secrets.sh --force`.

> ⚠️ `DATABASE_URL` y utilise l'hôte `db` (réseau Docker interne), **pas** `localhost`.
> Le `.env` ne doit jamais être commité (déjà dans `.gitignore`).

## 4. Lancer la base + l'app

```bash
docker compose up -d --build
```

C'est tout : le service **`migrate`** applique automatiquement les migrations
(`prisma migrate deploy`) **et** le seed du catalogue **avant** que l'app ne démarre
(grâce à `depends_on: service_completed_successfully`). Le seed est idempotent — il
peut tourner à chaque déploiement sans créer de doublon.

> L'image de l'app est construite en **mode standalone** (multi-stage) : image
> minimale, exécutée en utilisateur **non-root**, écoutant sur `127.0.0.1:3000`
> (non exposée publiquement — c'est le reverse proxy qui sert le public).

Suivi des migrations : `docker compose logs migrate`.

## 5. Reverse proxy HTTPS

### Option simple — Caddy (HTTPS automatique)

`/etc/caddy/Caddyfile` :

```
ton-domaine.bj {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo apt install -y caddy && sudo systemctl reload caddy
```

Caddy obtient et renouvelle le certificat Let's Encrypt automatiquement, et
transmet `X-Forwarded-Proto=https` (indispensable pour le cookie `secure`).

### Option Nginx + Certbot

`/etc/nginx/sites-available/ima` :

```nginx
server {
    listen 80;
    server_name ton-domaine.bj;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;   # requis (cookie secure + IP réelle)
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ima /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ton-domaine.bj   # installe le HTTPS + renouvellement auto
```

> `X-Forwarded-For` est important : le rate limiting de l'app identifie les clients
> par cette en-tête. `X-Forwarded-Proto` permet au cookie `secure` de fonctionner.

## 6. Vérifications post-déploiement

- [ ] `https://ton-domaine.bj` s'ouvre en HTTPS (cadenas valide)
- [ ] `/admin` redirige vers `/admin/login`
- [ ] Connexion admin OK avec `ADMIN_PASSWORD`
- [ ] `https://ton-domaine.bj:5432` et `:3000` **inaccessibles** depuis l'extérieur
- [ ] Inscription → réservation → admin fonctionnent

## 7. Exploitation

```bash
docker compose logs -f app          # logs
docker compose pull && docker compose up -d --build   # mise à jour
docker compose exec db pg_dump -U ima_user ima_studio > backup_$(date +%F).sql   # sauvegarde DB
```

Planifie une **sauvegarde régulière** du volume `ima_studio_pgdata` (cron + `pg_dump`).

---

## Récapitulatif sécurité

| Couche | Mesure |
|---|---|
| Transport | HTTPS/TLS via reverse proxy (cookie `secure`) |
| Réseau | DB & app liées à `127.0.0.1` + firewall ufw (80/443/22) |
| Secrets | `ADMIN_PASSWORD`, `NEXTAUTH_SECRET`, `POSTGRES_PASSWORD` forts et hors Git |
| Admin | Middleware + cookie signé HMAC ; brute-force limité (5/15 min) |
| Endpoints publics | Rate limiting (inscription, réservation, vérification) |
| Données | Vérification usager exige identifiant **+ nom** (anti-énumération) |
| En-têtes | HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy |

### Limites connues (à faire évoluer si besoin)
- Rate limiting **en mémoire** : suffisant pour une instance unique ; passer à Redis si
  plusieurs instances / load-balancer.
- **Secret partagé** pour l'admin (pas de comptes individuels ni de journal d'audit).
- Pas de sauvegarde automatisée par défaut (à mettre en place — cf. §7).
