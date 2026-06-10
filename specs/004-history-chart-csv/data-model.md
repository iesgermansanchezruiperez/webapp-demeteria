# Data Model: Histórico Firestore → Chart / CSV

**Feature**: `004-history-chart-csv` | **Date**: 2026-06-10

## Firestore (entrada)

### Reading (`readings/{docId}`)

| Campo | Tipo | Uso histórico |
|-------|------|---------------|
| `sensorId` | string | Filtro query `where('==', id)` |
| `value` | number | Eje Y / columna Valor |
| `timestamp` | Timestamp \| number ms | Orden `orderBy('timestamp')` |

### Sensor (`sensors/{docId}`)

| Campo | Tipo | Uso |
|-------|------|-----|
| `id` | string | Selector value |
| `name` | string | → `sensorName` en serie |
| `active` | boolean | Filtro selector |

---

## Derivados (capa mapper)

### History series point (UI / LineChart)

| Campo | Tipo | Origen |
|-------|------|--------|
| `date` | string (ISO 8601) | `toTimestampMs(timestamp)` → `toISOString()` |
| `value` | number | `readings.value` |
| `sensorName` | string | `sensors.name` |

**Orden**: ascendente por `timestamp`.

---

## CSV row (salida export)

| Columna | Tipo | Origen |
|---------|------|--------|
| `Fecha` | string | locale `es-ES` desde ISO point.date |
| `Valor` | string/number | `point.value` |
| `Sensor` | string | `point.sensorName` |

---

## Component props

### HistoryChart

```js
{
  series: HistorySeriesPoint[],  // required
  title?: string,
  emptyMessage?: string
}
```

### ExportButton

```js
{
  onExport: () => void,
  disabled?: boolean,
  label?: string  // default "Exportar CSV"
}
```

### HistorySection (contenedor)

Estado interno:
- `selectedSensorId: string`
- `series: HistorySeriesPoint[]`
- `loading: boolean`
- `error: string | null`

---

## Relaciones

```text
sensors (catálogo) ──selected──► query readings where sensorId
readings[] ──mapReadingsToHistorySeries──► series[]
series[] ──props──► HistoryChart
series[] ──exportToCSV──► archivo .csv
```
