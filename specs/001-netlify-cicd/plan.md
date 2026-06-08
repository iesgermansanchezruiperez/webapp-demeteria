# Implementation Plan: CI/CD en Netlify y Protección de Variables de Entorno

**Branch**: `001-netlify-cicd` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-netlify-cicd/spec.md`

**Alcance de esta fase**: Manipulación exclusiva de archivos del repositorio. **Prohibido**
modificar código React (`src/`), configuración de Vite más allá de lo ya existente, ni
añadir dependencias npm.

## Summary

Preparar el repositorio para despliegue continuo en Netlify mediante tres artefactos
estáticos: (1) regla SPA en `public/_redirects`, (2) blindaje de secretos en
`.gitignore`, y (3) plantilla documental `.env.example` con las claves públicas
Firebase requeridas por Vite. Vite copia automáticamente `public/` a `dist/` durante
`npm run build`; Netlify publica `dist/` y aplica `_redirects` en el edge.

## Technical Context

**Language/Version**: JavaScript (JSX) — sin cambios en esta fase

**Primary Dependencies**: Vite 8.x (build existente); Netlify (hosting externo, config
manual en panel)

**Storage**: N/A — solo archivos de configuración en repo

**Testing**: Validación manual vía `npm run build`, `git check-ignore`, inspección de
`dist/_redirects`

**Target Platform**: Netlify static hosting (build: `npm run build`, publish: `dist/`)

**Project Type**: SPA React + Vite (single frontend)

**Performance Goals**: N/A para artefactos estáticos

**Constraints**:

- Cero modificaciones en `src/**`
- Sin nuevas dependencias npm
- Contenido exacto de `_redirects` según Issue #13: `/* /index.html 200`
- `.env`, `.env.local`, `.env.production` MUST aparecer explícitamente en `.gitignore`

**Scale/Scope**: 3 archivos (1 nuevo, 1 modificado, 1 nuevo); ~15 líneas de contenido
efectivo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md` (DemeterIA v1.0.0):

- [x] **I. Despliegue rápido:** alcance minimalista — solo 3 artefactos de repo
- [x] **II. Componentes atómicos:** N/A — sin cambios React en esta fase
- [x] **III. Tailwind exclusivo:** N/A — sin cambios de estilos
- [x] **IV. Mock-first RTDB:** N/A — no se toca lógica de datos
- [x] **V. Premium Agrotech:** N/A — sin cambios UI
- [x] **VI. Control de alcance:** sin librerías ni funcionalidades extra

**Post-design re-check**: PASS — el diseño se limita estrictamente a archivos solicitados.

## Project Structure

### Documentation (this feature)

```text
specs/001-netlify-cicd/
├── plan.md              # Este archivo
├── research.md          # Decisiones técnicas Phase 0
├── data-model.md        # Entidades de configuración
├── quickstart.md        # Guía de validación
├── contracts/
│   ├── spa-redirects.md # Contrato del archivo _redirects
│   └── env-variables.md # Contrato de variables VITE_FIREBASE_*
└── tasks.md             # Generado por /speckit-tasks (no creado aquí)
```

### Archivos del repositorio afectados (this feature)

```text
webapp-demeteria/
├── .gitignore           # MODIFICAR — sección Environment variables
├── .env.example         # CREAR — plantilla Firebase (sin valores reales)
└── public/
    ├── _redirects       # CREAR — regla SPA Netlify
    ├── favicon.svg      # sin cambios
    └── icons.svg        # sin cambios
```

**Structure Decision**: Single Vite project en raíz. Los artefactos viven en rutas
estándar de Vite/Netlify; no se introduce `netlify.toml` en esta fase (Netlify
auto-detecta Vite: build `npm run build`, publish `dist`).

## Implementation Design

### Tarea 1 — Crear `public/_redirects`

| Campo | Valor |
|-------|-------|
| **Acción** | Crear archivo nuevo |
| **Ruta** | `public/_redirects` |
| **Extensión** | Ninguna (nombre literal `_redirects`) |
| **Contenido exacto** | Ver bloque abajo |

```
/* /index.html 200
```

**Comportamiento**:

- Netlify lee `_redirects` en la raíz del sitio publicado.
- Vite copia todo `public/` a `dist/` sin transformación → `dist/_redirects` existe
  tras `npm run build`.
- La regla `/* /index.html 200` reescribe cualquier ruta al `index.html` de la SPA
  devolviendo HTTP 200 (no 301/302), evitando 404 al recargar rutas internas.

**Verificación post-implementación**:

```bash
npm run build && cat dist/_redirects
# Debe imprimir: /* /index.html 200
```

---

### Tarea 2 — Actualizar `.gitignore`

| Campo | Valor |
|-------|-------|
| **Acción** | Añadir sección dedicada |
| **Ruta** | `.gitignore` (raíz) |
| **Estado actual** | Contiene `*.local` (cubre `.env.local` implícitamente) pero **no** `.env` ni `.env.production` explícitos |

**Bloque a insertar** (después de la sección de logs o antes de Editor):

```gitignore
# Environment variables (Firebase credentials — NEVER commit)
.env
.env.local
.env.production
```

**Notas**:

- Entradas **explícitas** según requisito del Issue #13; no depender solo de `*.local`.
- `.env.example` MUST **no** estar en `.gitignore` — es commiteable como documentación.
- Mantener la línea existente `*.local` por compatibilidad con otros archivos locales
  de Vite (p. ej. `vite.config.js.local`).

**Verificación post-implementación**:

```bash
touch .env .env.local .env.production
git check-ignore -v .env .env.local .env.production
# Cada archivo debe listar una regla de .gitignore
rm .env .env.local .env.production
```

---

### Tarea 3 — Crear `.env.example`

| Campo | Valor |
|-------|-------|
| **Acción** | Crear archivo nuevo |
| **Ruta** | `.env.example` (raíz) |
| **Valores** | Placeholders vacíos o de ejemplo claramente falsos — **nunca** credenciales reales |

**Contenido canónico**:

```dotenv
# DemeterIA — Firebase Web SDK (plantilla local)
# Copia este archivo como .env y rellena con tus credenciales de Firebase Console.
# Las mismas claves (prefijo VITE_) deben configurarse en Netlify → Environment variables.

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**Convenciones**:

- Prefijo `VITE_` obligatorio para que Vite exponga la variable al cliente en build-time.
- `VITE_FIREBASE_DATABASE_URL` es crítica para RTDB (DemeterIA).
- Comentarios en español alineados con el proyecto académico.
- El equipo copia: `cp .env.example .env` y rellena valores desde Firebase Console →
  Project settings → Your apps → Web app config.

**Verificación post-implementación**:

```bash
git check-ignore .env.example
# Debe fallar (exit 1) — el archivo NO está ignorado y puede committearse
grep -c '^VITE_FIREBASE_' .env.example
# Debe devolver 7
```

---

## Orden de ejecución recomendado

```text
1. public/_redirects     (independiente)
2. .gitignore            (independiente)
3. .env.example          (independiente)
```

Los tres archivos no tienen dependencias entre sí; pueden implementarse en paralelo.

## Fuera de alcance (esta fase)

| Elemento | Motivo |
|----------|--------|
| `src/**` (React, Firebase client) | Explícitamente excluido por usuario |
| `netlify.toml` | Netlify auto-detecta Vite; no requerido para `_redirects` |
| Alta del site en Netlify | Configuración manual (Issue #13, panel web) |
| Variables en panel Netlify | Configuración manual post-merge |
| Cliente Firebase / hooks RTDB | Feature futura |

## Complexity Tracking

> No aplica — todos los gates de constitución pasan sin excepciones.

## Referencias cruzadas

- [research.md](./research.md) — decisiones Netlify/Vite
- [data-model.md](./data-model.md) — entidades de configuración
- [contracts/spa-redirects.md](./contracts/spa-redirects.md) — contrato `_redirects`
- [contracts/env-variables.md](./contracts/env-variables.md) — contrato variables
- [quickstart.md](./quickstart.md) — validación end-to-end local
