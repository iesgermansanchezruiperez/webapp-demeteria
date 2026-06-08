# Data Model: Artefactos de Configuración — Issue #13

**Feature**: `001-netlify-cicd` | **Date**: 2026-06-05

Este feature no introduce entidades de dominio agrícola; modela tres artefactos de
configuración del repositorio y su relación con el pipeline de despliegue.

## Entidades

### 1. SPA Redirect Rule (`public/_redirects`)

| Atributo | Tipo | Regla |
|----------|------|-------|
| `from` | path pattern | Siempre `/*` |
| `to` | file path | Siempre `/index.html` |
| `status` | HTTP code | Siempre `200` (rewrite, not redirect) |
| `location_in_build` | path | `dist/_redirects` post-`npm run build` |

**Relaciones**: Generado en repo → copiado por Vite → consumido por Netlify edge.

**Validación**: Una sola línea activa; sin BOM; newline final opcional pero recomendado.

---

### 2. Environment Ignore Policy (`.gitignore`)

| Patrón ignorado | Propósito |
|-----------------|-----------|
| `.env` | Credenciales locales de desarrollo |
| `.env.local` | Overrides locales Vite (prioridad sobre `.env`) |
| `.env.production` | Credenciales locales de build producción |

| Patrón NO ignorado | Propósito |
|--------------------|-----------|
| `.env.example` | Plantilla commiteable para el equipo |

**Regla de negocio**: Ningún archivo con valores reales de Firebase MUST ser rastreado
por Git.

---

### 3. Environment Template (`.env.example`)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_FIREBASE_API_KEY` | Sí | API key del proyecto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Sí | Dominio auth (`*.firebaseapp.com`) |
| `VITE_FIREBASE_DATABASE_URL` | Sí | URL RTDB (`https://*.firebaseio.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Sí | ID del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Sí | Bucket Storage (`*.appspot.com`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sí | Sender ID FCM |
| `VITE_FIREBASE_APP_ID` | Sí | App ID web |

**Formato**: `KEY=` (valor vacío) o `KEY=your_value_here` con placeholder genérico.

**Relaciones**:

```text
.env.example (repo, tracked)
    │
    ├──[copia manual]──► .env (local, ignored)
    │
    └──[réplica manual]──► Netlify Environment Variables (producción)
```

---

### 4. Build Artifact (`dist/`)

| Atributo | Valor |
|----------|-------|
| Generador | `npm run build` (Vite) |
| Contiene | `index.html`, assets hasheados, `_redirects` |
| Publicado por | Netlify (directorio `dist`) |
| En `.gitignore` | Sí (`dist` ya ignorado) |

## State Transitions

```text
[Dev] cp .env.example → .env → rellena valores → git ignore ✓
[CI]  Netlify env vars → vite build → dist/ con _redirects → deploy
[User] Navega /ruta → Netlify rewrite 200 → index.html → SPA
```

## Invariantes

1. `dist/_redirects` MUST existir tras cada build exitoso.
2. `.env` MUST NOT aparecer en `git ls-files`.
3. `.env.example` MUST aparecer en `git ls-files` tras commit.
4. Las siete variables `VITE_FIREBASE_*` MUST estar presentes en `.env.example`.
