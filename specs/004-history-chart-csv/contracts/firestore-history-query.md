# Contract: Firestore History Query

**Version**: 1.0.0 | **Feature**: `004-history-chart-csv`

## Location

`src/components/HistorySection.jsx` (contenedor; NOT in HistoryChart)

## Query

```js
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

const q = query(
  collection(db, 'readings'),
  where('sensorId', '==', selectedSensorId),
  orderBy('timestamp', 'asc')
)
```

## Snapshot → series pipeline

```text
onSnapshot(q) → docs[].data()
  → mapReadingsToHistorySeries(readings, sensorName)
  → setSeries(points)
```

## mapReadingsToHistorySeries

File: `src/mappers/mapReadingsToHistorySeries.js`

```js
export function mapReadingsToHistorySeries(readings, sensorName) {
  return (readings ?? [])
    .map((r) => ({
      date: new Date(toTimestampMs(r.timestamp)).toISOString(),
      value: r.value,
      sensorName,
    }))
    .filter((p) => !Number.isNaN(new Date(p.date).getTime()))
    .sort((a, b) => a.date.localeCompare(b.date))
}
```

Reuses `toTimestampMs` from `mapFirestoreToSensors.js`.

## Composite index

If Firestore returns `failed-precondition`, create index:
- Collection: `readings`
- Fields: `sensorId` Asc, `timestamp` Asc

## Cleanup

`useEffect` MUST return unsubscribe from `onSnapshot`.

## Sensor name resolution

Lookup `sensorName` from sensors catalog:
`sensors.find(s => s.id === selectedSensorId)?.name ?? selectedSensorId`
