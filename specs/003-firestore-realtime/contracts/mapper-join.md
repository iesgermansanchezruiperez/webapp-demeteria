# Contract: Mapper JOIN (`mapFirestoreToSensors`)

**Version**: 1.0.0 | **Feature**: `003-firestore-realtime`

**Implements**: FR-004, FR-005, FR-006, FR-007

## Function Signature

```js
/**
 * @param {SensorDoc[]} sensorsList — documentos de colección `sensors`
 * @param {ReadingDoc[] | Map<string, ReadingDoc>} latestReadings
 *   — lecturas ya reducidas a la más reciente por sensorId,
 *     o array completo (el mapper invoca resolveLatestReadings internamente)
 * @returns {SensorFlatProps[]}
 */
export function mapFirestoreToSensors(sensorsList, latestReadings)
```

## Helper (interno o exportado para tests)

```js
export function resolveLatestReadings(readingsList) → Map<sensorId, ReadingDoc>
```

## JOIN Algorithm (FR-004)

```text
INPUT:  sensorsList[], readingsList[] (o Map precomputado)
STEP 1: latestMap = resolveLatestReadings(readingsList)
        FOR EACH reading IN readingsList:
          IF reading.sensorId NOT IN latestMap OR reading.timestamp > latestMap[reading.sensorId].timestamp:
            latestMap[reading.sensorId] = reading
STEP 2: FOR EACH sensor IN sensorsList:
          IF sensor.active !== true → SKIP
          IF sensor.id NOT IN latestMap → SKIP
          reading = latestMap[sensor.id]
          IF invalid timestamp(reading) → SKIP
          EMIT flat object (FR-006)
OUTPUT: SensorFlatProps[]
```

## Field Mapping (FR-006)

| Source | Target | Rule |
|--------|--------|------|
| `sensor.name` | `name` | string, sin transformación |
| `sensor.unit` | `value_type` | string, sin transformación |
| `reading.value` | `current` | `String(reading.value)` |
| `reading.timestamp` | `date` | `new Date(reading.timestamp).toISOString()` |

## Output Contract (FR-005, FR-007)

Cada elemento MUST ser:

```ts
{
  name: string,
  current: string,
  value_type: string,
  date: string  // ISO 8601
}
```

### Prohibited output keys

`value`, `unit`, `timestamp`, `sensorId`, `id`, `active`, `type`, objetos anidados.

## Example

**Input sensors**:
```json
[{ "id": "sensor_humedad_01", "name": "Sensor Humedad Ambiente", "unit": "%", "active": true }]
```

**Input readings**:
```json
[
  { "sensorId": "sensor_humedad_01", "timestamp": 1778185448335, "value": 54 },
  { "sensorId": "sensor_humedad_01", "timestamp": 1778185448000, "value": 52 }
]
```

**Output** (una tarjeta — timestamp 1778185448335 gana):
```json
[{
  "name": "Sensor Humedad Ambiente",
  "current": "54",
  "value_type": "%",
  "date": "2026-06-07T..."
}]
```

## Verification

```bash
# Tras implementar: validar contra mock
node -e "
  import { mapFirestoreToSensors } from './src/mappers/mapFirestoreToSensors.js'
  import mock from './src/mocks/sensorData.json' with { type: 'json' }
  const out = mapFirestoreToSensors(mock.sensors, mock.readings)
  console.log(JSON.stringify(out, null, 2))
"
```

Expected: cada item tiene exactamente 4 keys; `current` y `date` son strings.
