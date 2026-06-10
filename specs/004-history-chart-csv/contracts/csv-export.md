# Contract: CSV Export (`exportToCSV`)

**Version**: 1.0.0 | **Feature**: `004-history-chart-csv`

## Module

`src/utils/export.js`

## Signature

```js
/**
 * @param {HistorySeriesPoint[]} data
 * @param {string} [filename='demeteria-lecturas.csv']
 */
export function exportToCSV(data, filename)
```

## Output format

- MIME: `text/csv;charset=utf-8`
- Encoding: UTF-8 with BOM (`\uFEFF`) for Excel compatibility
- Separator: comma `,`
- Header row: `Fecha,Valor,Sensor`

## Row mapping

| CSV column | Source | Rule |
|------------|--------|------|
| Fecha | `point.date` | `new Date(point.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })` |
| Valor | `point.value` | String conversion; preserve decimals |
| Sensor | `point.sensorName` | Escape `"` as `""`; wrap in quotes if contains `,` or `"` |

## Download mechanism

```js
const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
// createObjectURL + temporary <a download> + revokeObjectURL
```

## Edge cases

- `data.length === 0`: export header-only CSV OR no-op with console warn — implement header-only (valid empty export)
- Invalid date: skip row or use raw string — skip row
