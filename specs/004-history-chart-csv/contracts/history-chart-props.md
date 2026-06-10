# Contract: HistoryChart Props

**Version**: 1.0.0 | **Feature**: `004-history-chart-csv`

## Component

`src/components/HistoryChart.jsx` — **presentational only** (FR-003).

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `series` | `HistorySeriesPoint[]` | Yes | Puntos ordenados por tiempo |
| `title` | string | No | Título accesible del gráfico |
| `emptyMessage` | string | No | Mensaje si `series.length === 0` |

## HistorySeriesPoint

```js
{
  date: string,      // ISO 8601
  value: number,
  sensorName: string
}
```

## Tremor mapping

```jsx
<LineChart
  data={series}
  index="date"
  categories={['value']}
  colors={['emerald']}
  className="..."
/>
```

## Prohibitions

- MUST NOT import Firebase
- MUST NOT fetch data
- MUST NOT transform Firestore raw docs (mapper upstream)

## Styling (Premium Agrotech)

Container/card wrapper MUST include:
`bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm`
