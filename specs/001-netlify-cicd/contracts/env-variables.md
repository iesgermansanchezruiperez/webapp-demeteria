# Contract: Environment Variables (`.env.example` / `.gitignore`)

**Version**: 1.0.0 | **Feature**: `001-netlify-cicd`

## `.gitignore` Contract

The root `.gitignore` MUST contain these exact patterns (dedicated section):

```gitignore
# Environment variables (Firebase credentials — NEVER commit)
.env
.env.local
.env.production
```

### Ignore Rules

| File | Git tracked | Git ignored |
|------|-------------|-------------|
| `.env` | MUST NOT | MUST |
| `.env.local` | MUST NOT | MUST |
| `.env.production` | MUST NOT | MUST |
| `.env.example` | MUST | MUST NOT |

## `.env.example` Contract

### Required Keys (all MUST be present, prefix `VITE_`)

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Value Rules

- MUST NOT contain real Firebase credentials in the committed file
- Values MUST be empty (`KEY=`) or clearly fake placeholders
- MUST include header comments explaining copy-to-`.env` workflow

## Netlify Parity Contract

For production builds, Netlify Environment variables MUST mirror `.env.example` keys:

| Variable | Required in Netlify |
|----------|---------------------|
| `VITE_FIREBASE_API_KEY` | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes |
| `VITE_FIREBASE_DATABASE_URL` | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes |
| `VITE_FIREBASE_APP_ID` | Yes |

## Verification

```bash
# Ignore contract
touch .env .env.local .env.production
git check-ignore -q .env .env.local .env.production

# Template contract
git check-ignore -q .env.example && exit 1 || true
grep -E '^VITE_FIREBASE_(API_KEY|AUTH_DOMAIN|DATABASE_URL|PROJECT_ID|STORAGE_BUCKET|MESSAGING_SENDER_ID|APP_ID)=$' .env.example | wc -l
# Expected: 7
```
