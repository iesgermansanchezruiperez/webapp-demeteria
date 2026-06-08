# Research: CI/CD Netlify — Issue #13

**Feature**: `001-netlify-cicd` | **Date**: 2026-06-05

## R1 — Enrutamiento SPA en Netlify

**Decision**: Usar archivo `public/_redirects` con la regla `/* /index.html 200`.

**Rationale**:

- Netlify procesa `_redirects` en el directorio publicado (`dist/` tras build Vite).
- El código `200` (rewrite) sirve `index.html` manteniendo la URL del navegador; es el
  patrón estándar para SPAs sin SSR.
- Alternativa `netlify.toml` con `[[redirects]]` es equivalente pero añade un cuarto
  artefacto no solicitado; `_redirects` es la opción mínima del Issue #13.

**Alternatives considered**:

| Alternativa | Descartada porque |
|-------------|-------------------|
| `netlify.toml` redirects | Fuera de alcance explícito; `_redirects` es suficiente |
| `_redirects` con 301/302 | Cambia URL visible; 200 es correcto para SPA |
| `public/404.html` fallback | No intercepta recargas en rutas profundas igual que rewrite |

## R2 — Propagación de `_redirects` vía Vite

**Decision**: Colocar `_redirects` en `public/`; confiar en el copy estático de Vite.

**Rationale**:

- Vite documenta que todos los archivos en `public/` se copian a la raíz de `dist/`
  sin hash ni transformación.
- No requiere cambios en `vite.config.js`.

**Alternatives considered**:

| Alternativa | Descartada porque |
|-------------|-------------------|
| Plugin Vite custom | Viola principio de simplicidad; copy nativo suficiente |
| Post-build script | Complejidad innecesaria para un archivo estático |

## R3 — Protección de variables de entorno

**Decision**: Entradas explícitas `.env`, `.env.local`, `.env.production` en
`.gitignore` + plantilla `.env.example` commiteable.

**Rationale**:

- El `.gitignore` actual incluye `*.local` (cubre `.env.local` parcialmente) pero **no**
  `.env` ni `.env.production` de forma explícita.
- Issue #13 exige listado explícito de `.env`; el usuario amplía a `.env.local` y
  `.env.production`.
- `.env.example` sin secretos es práctica estándar para onboarding (SC-005).

**Alternatives considered**:

| Alternativa | Descartada porque |
|-------------|-------------------|
| Solo `*.env*` glob | Ignoraría `.env.example`; requiere negación extra |
| git-secrets / pre-commit hook | Fuera de alcance; `.gitignore` es el mínimo del issue |
| Depender solo de `*.local` | No bloquea `.env` ni `.env.production` explícitamente |

## R4 — Convención de variables Firebase con Vite

**Decision**: Prefijo `VITE_` en las siete claves estándar del Firebase Web SDK config
object.

**Rationale**:

- Vite solo expone al bundle variables con prefijo `VITE_` (seguridad por defecto).
- Las claves del config web de Firebase son consideradas identificadores públicos del
  proyecto, pero MUST NOT committearse en `.env` — se inyectan vía Netlify en CI.
- `VITE_FIREBASE_DATABASE_URL` es obligatoria para RTDB (dominio DemeterIA).

**Alternatives considered**:

| Alternativa | Descartada porque |
|-------------|-------------------|
| `import.meta.env` sin prefijo | Vite no las expone al cliente |
| Hardcode en `src/firebase.js` | Viola FR-011 y SC-003 |

## R5 — Configuración Netlify (referencia, no repo)

**Decision**: Documentar en `quickstart.md`; no crear `netlify.toml` en esta fase.

**Rationale**:

- Netlify detecta Vite automáticamente: Build command `npm run build`, Publish
  directory `dist`.
- Variables se configuran en UI: Site configuration → Environment variables.
- El alcance del plan se limita a artefactos Git según instrucción del usuario.

**Alternatives considered**:

| Alternativa | Descartada porque |
|-------------|-------------------|
| `netlify.toml` con `[build]` | Redundante con auto-detect; añade scope |
| Branch deploy rules en repo | Configuración de panel, no archivo de repo |
