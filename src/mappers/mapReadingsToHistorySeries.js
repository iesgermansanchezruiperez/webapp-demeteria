import { toTimestampMs } from './mapFirestoreToSensors'

/**
 * Transforma lecturas Firestore en serie temporal para HistoryChart / CSV.
 * Contrato: `{ date, value, sensorName }`
 */
export function mapReadingsToHistorySeries(readings, sensorName) {
  return (readings ?? [])
    .map((reading) => {
      const ms = toTimestampMs(reading.timestamp)
      if (Number.isNaN(ms)) return null

      return {
        date: new Date(ms).toISOString(),
        value: reading.value,
        sensorName: sensorName ?? reading.sensorId ?? '',
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date))
}
