# Data Model: Firestore sensors + readings

**Feature**: `003-firestore-realtime` | **Date**: 2026-06-10

## Colecciones Firestore

### 1. Sensor (`sensors/{docId}`)

Documento de catálogo — metadatos del hardware instalado.

| Campo | Tipo | Obligatorio | Uso en JOIN |
|-------|------|-------------|-------------|
| `id` | string | Sí | Clave de cruce → `readings.sensorId` (FR-004) |
| `name` | string | Sí | → `name` (FR-006) |
| `unit` | string | Sí | → `value_type` (FR-006) |
| `active` | boolean | Sí | Filtro: solo `true` entra al grid |
| `type` | string | No | Metadato; no sale del mapper |
| `description` | string | No | Metadato |
| `location` | string | No | Metadato |
| `minValue` | number | No | Metadato (umbrales futuros) |
| `maxValue` | number | No | Metadato |
| `pin` | string | No | Metadato |
| `raspiId` | string | No | Metadato |
| `createdAt` | string/timestamp | No | Metadato |

**Reglas de validación (mapper)**:
- Sin `id` → documento ignorado en JOIN.
- `active !== true` → omitido (SC-006).

---

### 2. Reading (`readings/{docId}`)

Documento de medición puntual — histórico append-only.

| Campo | Tipo | Obligatorio | Uso en JOIN |
|-------|------|-------------|-------------|
| `sensorId` | string | Sí | Clave de cruce → `sensors.id` (FR-004) |
| `value` | number | Sí | → `current` via `String(value)` (FR-006) |
| `timestamp` | number (epoch ms) | Sí | → `date` via ISO 8601 (FR-006) |

**Reglas de validación (mapper)**:
- Múltiples docs con mismo `sensorId` → conservar mayor `timestamp` (FR-004).
- `timestamp` inválido (NaN) → omitir ese par sensor/lectura.
- Sin lectura para sensor activo → sensor omitido del grid.

---

### 3. Latest Reading (derivado en cliente)

No persiste en Firestore. Se calcula en memoria antes del mapper.

| Atributo | Tipo | Derivación |
|----------|------|------------|
| `sensorId` | string | Agrupación por `readings.sensorId` |
| `value` | number | Del doc con max `timestamp` |
| `timestamp` | number | Max entre docs del mismo `sensorId` |

**Función**: `resolveLatestReadings(readingsList) → Map<sensorId, Reading>`

---

### 4. Sensor Flat Props (salida mapper — contrato UI)

| Campo | Tipo | Origen |
|-------|------|--------|
| `name` | string | `sensors.name` |
| `current` | string | `String(readings.value)` |
| `value_type` | string | `sensors.unit` |
| `date` | string (ISO 8601) | `new Date(readings.timestamp).toISOString()` |

**Invariantes (FR-005, FR-007)**:
- Exactamente 4 claves por objeto.
- PROHIBIDO: `value`, `unit`, `timestamp`, `sensorId`, anidamiento.

---

### 5. Dashboard State (React)

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `data` | `SensorFlatProps[]` | Salida del mapper; alimenta grid |
| `loading` | boolean | `true` hasta primer snapshot de ambas colecciones |
| `error` | `string \| null` | Mensaje de error Firestore |

**Refs internos (no estado UI)**:
- `sensorsRaw[]` — último snapshot de `sensors`
- `readingsRaw[]` — último snapshot de `readings`

## Relaciones

```text
sensors (1) ──< readings (N)     via sensors.id = readings.sensorId
resolveLatestReadings(readings) → (1) por sensorId
mapFirestoreToSensors(sensors, latest) → SensorFlatProps[]
SensorFlatProps → SensorCard.props.sensor
```

## Mock canónico

Ver `.cursorrules` y `src/mocks/sensorData.json` (estructura `{ sensors: [], readings: [] }`).
