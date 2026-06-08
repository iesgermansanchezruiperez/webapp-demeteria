# Quickstart: Validación Issue #13 (artefactos de repo)

**Feature**: `001-netlify-cicd` | **Prerequisito**: Implementación de los 3 archivos
según [plan.md](./plan.md)

## 1. Prerrequisitos

- Node.js y npm instalados
- Dependencias instaladas: `npm install`
- Rama `001-netlify-cicd` (o rama con los cambios)

## 2. Checklist de archivos

| Archivo | Existe | Contenido correcto |
|---------|--------|-------------------|
| `public/_redirects` | ☐ | `/* /index.html 200` |
| `.gitignore` (sección env) | ☐ | `.env`, `.env.local`, `.env.production` |
| `.env.example` | ☐ | 7 claves `VITE_FIREBASE_*` |

## 3. Validación local (solo repo)

### 3.1 Regla SPA en build

```bash
npm run build
cat dist/_redirects
```

**Esperado**: línea `/* /index.html 200`

### 3.2 Blindaje `.gitignore`

```bash
touch .env .env.local .env.production
git check-ignore -v .env .env.local .env.production
rm .env .env.local .env.production
```

**Esperado**: cada archivo matched por regla en `.gitignore`

### 3.3 Plantilla commiteable

```bash
git check-ignore .env.example; echo "exit: $?"
grep '^VITE_FIREBASE_' .env.example | wc -l
```

**Esperado**: exit 1 (no ignorado); count = 7

### 3.4 Sin regresiones de build

```bash
npm run lint
npm run build
```

**Esperado**: cero errores (constitución DemeterIA)

## 4. Onboarding desarrollador (< 10 min)

```bash
cp .env.example .env
# Editar .env con credenciales de Firebase Console → Project settings → Web app
npm run dev
```

Ver [contracts/env-variables.md](./contracts/env-variables.md) para lista de claves.

## 5. Validación Netlify (manual, post-merge a main)

1. **Alta del site**: Netlify → Add new site → Import from Git → seleccionar repo
2. **Build settings** (auto-detect Vite):
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables**: Site configuration → Environment variables → añadir las
   7 claves `VITE_FIREBASE_*` con valores reales del proyecto Firebase
4. **Deploy**: push a `main` → verificar build exitoso en Deploys
5. **SPA test**: abrir URL `.netlify.app`, navegar a ruta interna (cuando exista
   router), recargar → MUST NOT ver página 404 de Netlify

## 6. Criterios de aceptación (Issue #13)

| Criterio | Cómo verificar |
|----------|----------------|
| Commit a `main` → deploy automático | Push y revisar panel Netlify |
| SPA carga en URL pública | Abrir URL tras deploy |
| Firebase sin claves en GitHub | Auditar repo; `.env` ignorado |
| Recarga sin 404 | `dist/_redirects` + prueba en Netlify |

## Referencias

- [plan.md](./plan.md) — diseño de implementación
- [contracts/spa-redirects.md](./contracts/spa-redirects.md)
- [contracts/env-variables.md](./contracts/env-variables.md)
