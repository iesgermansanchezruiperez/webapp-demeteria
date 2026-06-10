# Research: Conexión Realtime con Firestore SDK y Mapeo Combinado

**Feature**: `003-firestore-realtime` | **Date**: 2026-06-10

## R1 — Patrón de suscripción dual (sensors + readings)

**Decision**: Dos listeners `onSnapshot` independientes en `Dashboard.jsx`, con recomputación del JOIN en cada callback de cualquiera de las dos colecciones.

**Rationale**:
- FR-008 exige listeners sobre ambas colecciones.
- FR-010 exige invocar el mapper tras cada actualización, recomputando `latestReadings` antes del JOIN.
- Un único listener no cubre cambios en catálogo (`sensors`) ni en mediciones (`readings`) por separado.

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Query compuesta Firestore (`where` + `orderBy` por sensor) | Fuera de alcance (spec); requiere índices compuestos y N queries |
| Cloud Function que materialice `/dashboard` | Dependencia backend extra; viola alcance minimalista |
| Polling periódico | No cumple SC-001 (< 1 s, tiempo real) |

---

## R2 — Resolución de última lectura (FR-004)

**Decision**: Función pura `resolveLatestReadings(readingsList)` que reduce el array completo de `readings` a un `Map<sensorId, Reading>` conservando el documento con mayor `timestamp` por cada `sensorId`.

**Rationale**:
- FR-004: cruzar por ID y resolver lectura más reciente (mayor `timestamp`).
- El dashboard escucha la colección `readings` completa; la reducción ocurre en cliente antes del mapper.
- Complejidad O(n) sobre lecturas; escala académica (~7 sensores, lecturas moderadas).

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Subcolección `sensors/{id}/readings/latest` | Cambio de schema backend no especificado |
| Ordenar en Firestore con `limit(1)` por sensor | N listeners o batch queries; complejidad innecesaria |

---

## R3 — Contrato de transformación de campos (FR-006)

**Decision**: Mapeo unidireccional fijo en `mapFirestoreToSensors`:

| Origen (Firestore) | Destino (SensorCard) | Transformación |
|--------------------|----------------------|----------------|
| `sensors.name` | `name` | Copia directa (string) |
| `sensors.unit` | `value_type` | Copia directa (string) |
| `readings.value` | `current` | `String(value)` |
| `readings.timestamp` | `date` | `new Date(timestamp).toISOString()` |

**Rationale**: FR-006 define el contrato exacto; FR-007 prohíbe emitir claves intermedias (`value`, `unit`, `timestamp`, `sensorId`).

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| `current` como number | FR-005 exige string; `SensorCard` usa `parseFloat` pero contrato es string |
| Formatear `date` con `toLocaleString` en mapper | FR-006 exige ISO 8601; formateo visual queda en `SensorCard` |

---

## R4 — Cliente Firebase (FR-002)

**Decision**: `src/services/firebase.js` exporta `db = getFirestore(app)` inicializado con `import.meta.env.VITE_FIREBASE_*`.

**Rationale**: Firestore no requiere `databaseURL` para operar; las vars existentes en `.env.example` siguen válidas para `initializeApp`.

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Mantener `getDatabase` + Firestore | Backend único es Firestore; código RTDB obsoleto |
| SDK modular solo `@firebase/firestore` | FR-001 permite paquete `firebase` ya instalado |

---

## R5 — Filtrado de sensores en JOIN

**Decision**: Omitir sensores con `active !== true` y sensores activos sin lectura emparejada.

**Rationale**: Edge cases del spec + SC-006 (solo activos con lectura en grid).

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Mostrar tarjeta vacía sin lectura | Spec: "MUST omitirlo (no inventar valores)" |
| Incluir inactivos | SC-006 explícito |
