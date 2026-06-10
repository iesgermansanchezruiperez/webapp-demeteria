# Research: Gráficos Históricos y Exportación CSV

**Feature**: `004-history-chart-csv` | **Date**: 2026-06-10

## R1 — Formato de datos para Tremor LineChart

**Decision**: Prop `series` como array `{ date: string, value: number, sensorName: string }` donde `date` es ISO 8601 corto o `Date` parseable; Tremor usa prop `index="date"` y `categories={['value']}`.

**Rationale**: Tremor LineChart espera array plano de objetos; `index` es el eje X temporal. ISO strings ordenan lexicográficamente si mismo formato.

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Eje X como epoch number | Tremor formatea fechas mejor con strings/Date en index |
| Múltiples categories (multi-sensor) | Fuera de alcance v1 |

---

## R2 — Query Firestore histórica

**Decision**: `query(collection(db,'readings'), where('sensorId','==', id), orderBy('timestamp','asc'))` con `onSnapshot` en contenedor `HistorySection.jsx`.

**Rationale**: Issue #11 exige filtro por sensor + orden cronológico. Snapshot mantiene coherencia con dashboard en vivo.

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Reutilizar snapshot global de readings en Dashboard | Filtrar en cliente con miles de docs es ineficiente; query es requisito explícito |
| getDocs one-shot | No actualiza en vivo; snapshot opcional pero consistente |

**Nota índice compuesto**: Firestore puede requerir índice compuesto `sensorId ASC + timestamp ASC`. Firebase Console muestra enlace auto-generado al primer error.

---

## R3 — Mapper histórico vs mapper live

**Decision**: Nuevo `mapReadingsToHistorySeries(readings, sensorName)` en `src/mappers/mapReadingsToHistorySeries.js`; reutiliza `toTimestampMs` exportado desde `mapFirestoreToSensors.js`.

**Rationale**: Separación de responsabilidades; live mapper emite latest-only, histórico emite serie completa ordenada.

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Extender mapFirestoreToSensors | Contratos distintos (4 keys vs 3 keys chart) |
| Inline en Dashboard | Viola atomicidad y testabilidad mock-first |

---

## R4 — Exportación CSV vía Blob

**Decision**: `exportToCSV(rows, filename)` en `src/utils/export.js`:
- BOM UTF-8 opcional para Excel (`\uFEFF`)
- Escapar comillas en celdas con `"` → `""`
- Columnas: `Fecha,Valor,Sensor`
- Fecha: `toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })`

**Rationale**: Issue exige Blob download; locale es-ES legible para memoria académica española.

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| ISO en CSV | Spec permite ISO o local; local preferido para operadores |
| Librería papaparse | Violación control de alcance (sin deps nuevas) |

---

## R5 — Selector de sensor v1

**Decision**: `<select>` nativo Tailwind en `HistorySection.jsx`; default = primer sensor `active: true` del catálogo ya cargado.

**Rationale**: Spec asume un sensor; selector mínimo sin component library extra.

**Alternatives considered**:
| Alternativa | Descartada porque |
|-------------|-------------------|
| Click en SensorCard | Nice-to-have; no en issue |
| Tremor Select | No requerido; select nativo suficiente |

---

## R6 — Mock firestoreData.json vs sensorData.json

**Decision**: Crear `firestoreData.json` con ≥ 10 readings históricos por al menos un sensor; mantener `sensorData.json` para live dashboard sin duplicar obligatoriamente.

**Rationale**: Issue pide archivo explícito; histórico necesita más puntos que live mock.
