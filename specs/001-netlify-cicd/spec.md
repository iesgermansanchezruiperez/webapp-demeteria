# Feature Specification: CI/CD en Netlify y Protección de Variables de Entorno

**Feature Branch**: `001-netlify-cicd`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Issue #13: CI/CD en Netlify y Protección de Variables de Entorno. Necesitamos configurar el repositorio para su despliegue continuo. Crea el archivo `_redirects` (sin extensión) dentro del directorio `public` con la regla exacta para evitar errores HTTP 404 en la SPA. Comprueba y garantiza que el archivo `.env` esté explícitamente listado en el `.gitignore` para blindar las futuras credenciales de la base de datos."

**Issue**: [#13 — CI/CD en Netlify y Protección de Variables de Entorno](https://github.com/iesgermansanchezruiperez/webapp-demeteria/issues/13)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Despliegue automático en cada cambio a main (Priority: P1)

Como miembro del equipo de desarrollo, quiero que cada commit integrado en la rama
`main` dispare automáticamente un build y despliegue exitoso, para que los usuarios
siempre tengan la versión más reciente del dashboard sin intervención manual.

**Why this priority**: Sin pipeline de despliegue continuo no hay entrega de valor al
usuario final; es el requisito habilitador de toda la feature.

**Independent Test**: Integrar un commit trivial en `main` y verificar que la
plataforma de hosting ejecuta build y publica una nueva versión accesible en la URL
pública, sin pasos manuales adicionales.

**Acceptance Scenarios**:

1. **Given** el repositorio vinculado a un site de Netlify, **When** se hace push a
   `main`, **Then** Netlify inicia automáticamente un build que finaliza con estado
   exitoso.
2. **Given** un build exitoso, **When** el despliegue termina, **Then** la URL
   pública de Netlify sirve la versión actualizada del dashboard.
3. **Given** un build fallido por error de compilación, **When** el equipo revisa el
   panel de Netlify, **Then** puede identificar el commit y los logs del fallo.

---

### User Story 2 - Navegación SPA sin errores 404 (Priority: P2)

Como usuario del dashboard DemeterIA, quiero acceder y recargar cualquier ruta de la
aplicación sin recibir un error HTTP 404, para poder usar enlaces directos y
actualizar la página con normalidad.

**Why this priority**: Una SPA desplegada sin reglas de reescritura devuelve 404 al
recargar rutas internas, bloqueando el uso real del producto aunque el build sea
correcto.

**Independent Test**: Navegar a una ruta interna del dashboard, recargar el
navegador y confirmar que la aplicación carga correctamente (HTTP 200) en lugar de
una página de error del hosting.

**Acceptance Scenarios**:

1. **Given** el dashboard desplegado en Netlify, **When** el usuario accede a la
   URL raíz, **Then** la aplicación carga correctamente.
2. **Given** una ruta interna de la SPA (p. ej. futura ruta de React Router),
   **When** el usuario recarga la página o abre un enlace directo, **Then** Netlify
   sirve `index.html` con código HTTP 200 y la SPA renderiza la vista esperada.
3. **Given** el archivo `public/_redirects` en el repositorio, **When** se ejecuta
   el build de producción, **Then** el artefacto desplegado incluye la regla de
   reescritura `/* /index.html 200`.

---

### User Story 3 - Credenciales Firebase protegidas en producción (Priority: P1)

Como responsable de seguridad del proyecto, quiero que las credenciales del SDK de
Firebase nunca se suban al repositorio público y se inyecten de forma segura en
tiempo de compilación, para que la conexión con la base de datos funcione en
producción sin exponer secretos en GitHub.

**Why this priority**: Compartir credenciales en el código fuente es un riesgo
crítico de seguridad; la feature no puede considerarse completa sin este blindaje.

**Independent Test**: Auditar el historial y el contenido visible del repositorio
público confirmando ausencia de claves Firebase; verificar que el dashboard en
producción se conecta a Firebase usando variables configuradas en el panel de Netlify.

**Acceptance Scenarios**:

1. **Given** un archivo `.env` local con credenciales Firebase, **When** un
   desarrollador ejecuta `git status`, **Then** `.env` no aparece como archivo
   rastreado ni commiteable (listado explícitamente en `.gitignore`).
2. **Given** variables de entorno configuradas en Netlify (p. ej.
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`,
   `VITE_FIREBASE_PROJECT_ID`), **When** Netlify compila la aplicación, **Then** las
   variables están disponibles en el bundle de producción sin estar en el repositorio.
3. **Given** el dashboard desplegado en producción, **When** un usuario accede a la
   URL pública, **Then** la aplicación establece conexión con Firebase RTDB sin
   errores de autenticación por credenciales ausentes o hardcodeadas.

---

### Edge Cases

- ¿Qué ocurre si un desarrollador intenta hacer commit de `.env`? Git MUST ignorarlo
  de forma persistente gracias a la entrada explícita en `.gitignore`.
- ¿Qué ocurre si falta una variable de entorno en Netlify? El build puede completarse
  pero la app MUST fallar de forma visible (error en consola o mensaje al usuario)
  en lugar de usar credenciales por defecto inventadas.
- ¿Qué ocurre al acceder a rutas inexistentes dentro de la SPA? La regla
  `_redirects` entrega `index.html`; la responsabilidad de mostrar una vista 404
  interna recae en React Router (fuera de alcance de esta feature si no hay router
  aún).
- ¿Qué ocurre si el build de Netlify falla por dependencias? El despliegue anterior
  MUST permanecer activo; el equipo MUST poder diagnosticar vía logs de Netlify.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El proyecto MUST estar vinculado a un site de Netlify conectado a este
  repositorio Git.
- **FR-002**: Cada push a la rama `main` MUST disparar automáticamente un build en
  Netlify.
- **FR-003**: El build de producción MUST completarse exitosamente usando el comando
  estándar de Vite (`npm run build` o equivalente definido en `package.json`).
- **FR-004**: El directorio de publicación MUST ser `dist` (comportamiento por
  defecto de Vite).
- **FR-005**: El archivo `.env` MUST estar listado explícitamente en `.gitignore` para
  impedir que credenciales locales se suban al repositorio.
- **FR-006**: MUST existir un archivo `public/_redirects` (sin extensión) con el
  contenido exacto: `/* /index.html 200`.
- **FR-007**: La regla `_redirects` MUST incluirse en el artefacto de build desplegado
  (Vite copia `public/` a `dist/`).
- **FR-008**: Las variables de entorno de Firebase MUST configurarse exclusivamente
  en el panel de Netlify (Site configuration → Environment variables), no en el
  código fuente.
- **FR-009**: Las variables MUST usar el prefijo `VITE_` requerido por Vite para
  exposición en el cliente (p. ej. `VITE_FIREBASE_API_KEY`,
  `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`,
  `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`).
- **FR-010**: MUST proporcionarse un archivo `.env.example` (sin valores reales) que
  documente las variables requeridas para desarrollo local.
- **FR-011**: El repositorio MUST NOT contener claves, tokens ni credenciales Firebase
  en ningún archivo rastreado por Git.
- **FR-012**: La aplicación desplegada MUST poder conectarse a Firebase RTDB en
  producción usando las variables inyectadas en tiempo de build.

### Key Entities

- **Site de Netlify**: Instancia de hosting vinculada al repositorio; gestiona builds,
  despliegues y variables de entorno.
- **Variable de entorno (`VITE_*`)**: Configuración inyectada en compile-time; nunca
  commiteada; replicada manualmente en panel Netlify para producción.
- **Regla `_redirects`**: Directiva de reescritura SPA que mapea todas las rutas a
  `index.html` con HTTP 200.
- **Artefacto de build (`dist/`)**: Salida estática generada por Vite epublicada por
  Netlify.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los commits integrados en `main` durante la validación
  disparan un build automático en Netlify que finaliza con estado exitoso.
- **SC-002**: El 100% de las pruebas de recarga en rutas internas de la SPA devuelven
  HTTP 200 y renderizan la aplicación (cero errores 404 del hosting).
- **SC-003**: Cero credenciales Firebase detectables en el repositorio público de
  GitHub (auditoría de archivos rastreados e historial reciente).
- **SC-004**: El dashboard accesible en la URL pública de Netlify establece conexión
  funcional con Firebase RTDB en la primera carga, sin intervención manual post-
  despliegue.
- **SC-005**: Un desarrollador nuevo puede configurar su entorno local siguiendo
  `.env.example` en menos de 10 minutos.

## Assumptions

- El repositorio es público en GitHub bajo la organización del proyecto académico;
  la protección de secretos es obligatoria.
- Netlify es la plataforma de hosting acordada para esta feature (definida en Issue
  #13); no se evalúan alternativas (Vercel, GitHub Pages) en este alcance.
- La rama de producción es `main`; despliegues desde otras ramas quedan fuera de
  alcance salvo configuración explícita posterior en Netlify.
- React Router puede no estar implementado aún; la regla `_redirects` se incluye de
  forma preventiva según Issue #13.
- Las variables Firebase siguen la convención oficial del SDK web con prefijo `VITE_`
  para compatibilidad con Vite.
- El proyecto MUST cumplir la constitución DemeterIA v1.0.0: despliegue rápido, cero
  warnings en build, control de alcance (sin librerías no solicitadas).
- La configuración manual del panel de Netlify (alta del site, variables de entorno)
  es responsabilidad del equipo/alumno; esta spec cubre los artefactos de repositorio
  y los criterios verificables del pipeline.

## Out of Scope

- Configuración de dominio personalizado o certificados SSL (Netlify los gestiona por
  defecto en subdominio `.netlify.app`).
- Preview deployments para pull requests (puede añadirse en iteración futura).
- Rotación automatizada de secretos o integración con gestores de secretos externos.
- Implementación del cliente Firebase en código (feature separada; esta spec solo
  garantiza que el entorno de despliegue esté preparado).
