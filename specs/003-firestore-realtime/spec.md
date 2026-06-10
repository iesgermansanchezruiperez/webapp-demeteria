# Feature Specification: Conexión Realtime con Firestore SDK y Mapeo Combinado

**Feature Branch**: `003-firestore-realtime`

**Created**: 2026-06-10

**Status**: Draft

**Input**: Issue #12 — Conexión Realtime con Firestore SDK y Mapeo Combinado

**Issue**: [#12 — Conexión Realtime con Firestore SDK y Mapeo Combinado](https://github.com/iesgermansanchezruiperez/webapp-demeteria/issues/12)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lecturas en vivo desde Firestore (Priority: P1)

Como operador del invernadero, quiero que el dashboard muestre las lecturas más
recientes de cada sensor en tiempo real, combinando catálogo y mediciones, para
monitorizar el cultivo sin recargar la página.

**Why this priority**: Es el valor central del Issue #12; sin suscripción reactiva a
Firestore no hay dashboard en vivo.

**Independent Test**: Insertar un nuevo documento en la colección `readings` desde
Firebase Console y verificar que la tarjeta del sensor correspondiente actualiza su
valor en menos de 1 segundo sin reload.

**Acceptance Scenarios**:

1. **Given** credenciales Firebase válidas en `.env`, **When** el dashboard carga,
   **Then** se suscribe en tiempo real a las colecciones `sensors` y `readings`.
2. **Given** listeners activos, **When** se añade o actualiza una lectura en
   `readings`, **Then** la UI refleja el nuevo valor en < 1 segundo.
3. **Given** el componente desmontado, **When** el usuario navega fuera,
   **Then** ambos listeners se cancelan (cleanup de `useEffect`).

---

### User Story 2 - Mapper con JOIN y contrato SensorCard (Priority: P1)

Como desarrollador, quiero que `mapFirestoreToSensors(sensorsList, latestReadings)`
cruce ambas colecciones por ID y devuelva props planas `{ name, current, value_type,
date }` para que `SensorCard` las consuma sin adaptación adicional.

**Why this priority**: La información está dividida en dos colecciones; la UI exige
objetos planos. El mapper centraliza el JOIN y la transformación.

**Independent Test**: Pasar arrays mock de `sensors` y `readings` al mapper y
verificar que cada elemento del array tiene exactamente las 4 claves con tipos
correctos (`current` y `date` string).

**Acceptance Scenarios**:

1. **Given** un sensor con `id: "sensor_humedad_01"`, `name`, `unit: "%"` y una
   lectura con `sensorId: "sensor_humedad_01"`, `value: 54`, `timestamp` ms,
   **When** ejecuta `mapFirestoreToSensors(sensorsList, latestReadings)`,
   **Then** devuelve `{ name: "Sensor Humedad Ambiente", current: "54", value_type: "%", date: ISO 8601 }`.
2. **Given** múltiples lecturas del mismo `sensorId`, **When** el dashboard resuelve
   la última lectura, **Then** usa la de `timestamp` más reciente.
3. **Given** `Dashboard.jsx`, **When** renderiza tarjetas, **Then** no existe acceso
   JSX a campos crudos de Firestore (`sensorId`, `unit`, `value`, etc.).

---

### User Story 3 - Estados loading y error (Priority: P2)

Como usuario, quiero ver un skeleton durante la carga inicial y un mensaje claro si
Firestore falla, para entender el estado del sistema.

**Why this priority**: Mejora UX sin bloquear la conexión en vivo (P1).

**Independent Test**: Simular arranque (skeleton visible) y credenciales inválidas
(mensaje error accesible).

**Acceptance Scenarios**:

1. **Given** primera carga, **When** `loading === true`, **Then** muestra skeleton
   Tailwind (Premium Agrotech) en lugar de tarjetas vacías.
2. **Given** error de conexión, **When** `error` está definido, **Then** muestra
   mensaje accesible sin crashear la app.
3. **Given** ambos snapshots recibidos, **When** `loading` pasa a false,
   **Then** renderiza grid de `SensorCard` con datos mapeados.

---

### User Story 4 - Configuración segura (Priority: P2)

Como responsable del proyecto, quiero que Firebase se inicialice solo con variables
`VITE_*` de entorno, sin credenciales en el repositorio.

**Why this priority**: Complementa Issue #13; prerequisito de producción.

**Independent Test**: Verificar que `firebase.js` lee `import.meta.env.VITE_FIREBASE_*`
y que `.env` no está en Git.

**Acceptance Scenarios**:

1. **Given** `.env` local con vars, **When** `npm run dev`, **Then** Firebase init
   exitoso y Firestore accesible.
2. **Given** vars en Netlify, **When** build producción, **Then** app conecta sin
   claves hardcodeadas.

---

### Edge Cases

- Sensor `active: false`: mapper MUST omitirlo del grid.
- Sensor activo sin lectura en `readings`: mapper MUST omitirlo (no inventar valores).
- Múltiples lecturas por `sensorId`: MUST usar la de mayor `timestamp`.
- `timestamp` inválido: mapper MUST omitir ese sensor o producir `date` válida.
- Colección `readings` vacía: grid vacío tras loading, sin crash.
- Pérdida de conexión: UI muestra error accesible si persiste.
- Sin `.env`: error claro al iniciar (no mock silencioso en producción).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST instalar únicamente el paquete `firebase` (si no está presente).
- **FR-002**: MUST configurar `src/services/firebase.js` inicializando app con
  `import.meta.env.VITE_FIREBASE_*` y exportar instancia Firestore via `getFirestore(app)`.
- **FR-003**: MUST implementar `mapFirestoreToSensors(sensorsList, latestReadings)` en
  `src/mappers/mapFirestoreToSensors.js`.
- **FR-004**: El mapper MUST cruzar `sensors[].id` con `readings[].sensorId` y
  resolver la lectura más reciente por sensor (mayor `timestamp`).
- **FR-005**: Salida del mapper MUST ser array de `{ name, current, value_type, date }`
  donde `current` y `date` son strings.
- **FR-006**: MUST mapear `sensors.name` → `name`, `sensors.unit` → `value_type`,
  `readings.value` → `current` via `String(value)`, `readings.timestamp` (ms) → `date`
  via `new Date(timestamp).toISOString()`.
- **FR-007**: PROHIBIDO emitir claves obsoletas o anidadas en salida mapper (`value`,
  `unit`, `timestamp`, `sensorId`, objetos anidados).
- **FR-008**: MUST implementar `useEffect` con listeners `onSnapshot` sobre colecciones
  `sensors` y `readings` en `Dashboard.jsx`, con cleanup de ambas unsubscribes.
- **FR-009**: MUST gestionar estados atómicos `data` (sensores mapeados), `loading`,
  `error` con `useState`.
- **FR-010**: MUST invocar el mapper tras cada actualización de cualquiera de las dos
  colecciones, recomputando `latestReadings` antes del JOIN.
- **FR-011**: MUST pasar objetos mapper directamente a `<SensorCard sensor={...} />`
  sin transformación intermedia en JSX.
- **FR-012**: MUST renderizar skeleton Tailwind-only mientras `loading === true` hasta
  el primer snapshot resuelto de ambas colecciones.
- **FR-013**: PROHIBIDO acceder a documentos Firestore crudos en componentes UI.
- **FR-014**: MUST actualizar mock en `src/mocks/sensorData.json` al schema Firestore
  canónico (`sensors[]` + `readings[]`) según `.cursorrules`.
- **FR-015**: MUST mantener cero warnings ESLint y build.

### Key Entities

- **Firebase App / Firestore**: Cliente configurado via env vars.
- **Sensor (colección `sensors`)**: Catálogo de sensores instalados (`id`, `name`,
  `unit`, `type`, `active`, `minValue`, `maxValue`, metadatos hardware).
- **Reading (colección `readings`)**: Medición puntual (`sensorId`, `value`, `timestamp`).
- **Latest reading (derivado)**: Lectura de mayor `timestamp` por `sensorId`.
- **Sensor flat props**: `{ name, current, value_type, date }` — contrato UI.
- **Dashboard state**: `{ data[], loading, error }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nuevo documento en `readings` visible en UI en < 1 segundo sin reload.
- **SC-002**: Cada tarjeta renderizada cumple contrato exacto
  `{ name, current, value_type, date }` (4 claves, sin anidamiento).
- **SC-003**: 0 accesos a campos Firestore crudos en componentes UI.
- **SC-004**: Skeleton visible en carga inicial antes del primer snapshot combinado.
- **SC-005**: `npm run lint` y `npm run build` sin errores ni warnings.
- **SC-006**: Solo sensores `active: true` con lectura disponible aparecen en el grid.

## Assumptions

- Issue #13 completado (`.env.example`, Netlify, `.gitignore`).
- Issue #9 completado (`SensorCard`, grid Premium Agrotech).
- Backend de producción es **Cloud Firestore** con colecciones `sensors` y `readings`
  (schema canónico en `.cursorrules`).
- `SensorCard` NO cambia contrato de props; mapper asume toda la transformación.
- Reglas Firestore permiten lectura con credenciales del proyecto académico.
- Implementación RTDB previa (`002-firebase-rtdb`) queda obsoleta; esta feature la
  sustituye.
- Número de tarjetas es dinámico (depende de sensores activos con lectura), no fijo.

## Out of Scope

- Autenticación Firebase / gestión de reglas Firestore.
- Históricos, gráficas, queries compuestas con índices compuestos.
- Escritura de datos desde el dashboard.
- Modificación de contrato `SensorCard`.
- Tests automatizados E2E.
- Cambios CSS fuera de skeleton/error mínimos.
- Migración de datos RTDB → Firestore.
