/**
 * Adapta colecciones Firestore `sensors` + `readings` a props planas para SensorCard.
 * Contrato: `{ name, current, value_type, date }`
 * Implements FR-004 (JOIN + latest reading) and FR-006 (field mapping).
 */

/** Normaliza timestamp Firestore (Timestamp, ms number, ISO string) a epoch ms. */
export function toTimestampMs(value) {
  if (value == null) return NaN
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Date.parse(value)
  if (value instanceof Date) return value.getTime()
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.toDate === 'function') return value.toDate().getTime()
  if (typeof value.seconds === 'number') {
    return value.seconds * 1000 + (value.nanoseconds ?? 0) / 1e6
  }
  return NaN
}

export function resolveLatestReadings(readingsList) {
  const latestBySensorId = new Map()

  for (const reading of readingsList ?? []) {
    if (!reading?.sensorId) continue

    const ts = toTimestampMs(reading.timestamp)
    if (Number.isNaN(ts)) continue

    const prev = latestBySensorId.get(reading.sensorId)
    if (!prev || ts > toTimestampMs(prev.timestamp)) {
      latestBySensorId.set(reading.sensorId, reading)
    }
  }

  return latestBySensorId
}

function toFlatSensor(sensor, reading) {
  const date = new Date(toTimestampMs(reading.timestamp))
  if (Number.isNaN(date.getTime())) return null

  return {
    name: sensor.name,
    value_type: sensor.unit,
    current: String(reading.value),
    date: date.toISOString(),
  }
}

export function mapFirestoreToSensors(sensorsList, latestReadings) {
  const latestMap =
    latestReadings instanceof Map
      ? latestReadings
      : resolveLatestReadings(latestReadings)

  const result = []

  for (const sensor of sensorsList ?? []) {
    if (sensor?.active !== true) continue
    if (!sensor?.id) continue

    const reading = latestMap.get(sensor.id)
    if (!reading) continue

    const flat = toFlatSensor(sensor, reading)
    if (flat) result.push(flat)
  }

  return result
}
