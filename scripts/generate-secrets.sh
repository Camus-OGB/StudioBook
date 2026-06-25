#!/usr/bin/env sh
# Génère un fichier .env avec des secrets forts et aléatoires pour le déploiement.
# À exécuter UNE FOIS sur l'hôte (le VPS), AVANT `docker compose up`.
#
#   sh scripts/generate-secrets.sh [https://ton-domaine.bj] [--force]
#
# - Sans --force, refuse d'écraser un .env existant (pour ne pas perdre les secrets,
#   ce qui invaliderait les sessions admin et le mot de passe de la base).
# - DATABASE_URL pointe vers l'hôte « db » (réseau Docker interne).

set -eu

ENV_FILE=".env"
FORCE=0
APP_URL="http://localhost:3000"

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    http://*|https://*) APP_URL="$arg" ;;
    *) echo "Argument ignoré : $arg" ;;
  esac
done

if [ -f "$ENV_FILE" ] && [ "$FORCE" -ne 1 ]; then
  echo "❌ $ENV_FILE existe déjà."
  echo "   Régénérer écraserait les secrets (sessions admin + mot de passe DB invalidés)."
  echo "   Relancez avec --force si c'est vraiment voulu."
  exit 1
fi

# Secret hexadécimal (openssl, sinon /dev/urandom)
rand_hex() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "$1"
  else
    head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'
  fi
}

# Mot de passe alphanumérique (évite les caractères spéciaux dans DATABASE_URL)
rand_pw() {
  LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c "$1"
}

POSTGRES_DB="ima_studio"
POSTGRES_USER="ima_user"
POSTGRES_PASSWORD="$(rand_pw 24)"
NEXTAUTH_SECRET="$(rand_hex 32)"
ADMIN_PASSWORD="$(rand_pw 20)"

umask 077  # le .env ne sera lisible que par son propriétaire
cat > "$ENV_FILE" <<EOF
# Généré par scripts/generate-secrets.sh — NE PAS COMMITER
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@db:5432/$POSTGRES_DB
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ADMIN_PASSWORD=$ADMIN_PASSWORD
NEXT_PUBLIC_APP_URL=$APP_URL
EOF

echo "✅ $ENV_FILE généré (permissions 600)."
echo ""
echo "   Mot de passe administrateur : $ADMIN_PASSWORD"
echo ""
echo "   ⚠️  Notez ce mot de passe : il n'est affiché qu'ici."
echo "   DATABASE_URL utilise l'hôte « db » (Docker). Pour un usage hors Docker,"
echo "   remplacez « @db: » par « @localhost: »."
