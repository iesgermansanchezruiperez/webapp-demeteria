# Quickstart: Histórico + CSV — Issue #11

**Feature**: `004-history-chart-csv` | **Date**: 2026-06-10

## Prerequisites

- Issue #12 mergeado en `main` (Firestore operativo)
- Node ≥ 20.19 (`nvm use`)
- `.env` con `VITE_FIREBASE_*`

## 1. Mock-first (sin Firestore)

Tras implementar mapper + chart + export:

```bash
nvm use 22
npm run dev
```

Validar offline con `src/mocks/firestoreData.json`:
- `mapReadingsToHistorySeries(readings, 'Sensor Humedad Ambiente')` → ≥ 10 puntos
- `HistoryChart` renderiza LineChart
- Click Exportar → descarga `.csv` con columnas Fecha, Valor, Sensor

## 2. Firestore query

1. Abrir dashboard local
2. Sección histórico visible bajo tarjetas en vivo
3. Seleccionar sensor en `<select>` (ej. `sensor_humedad_01`)
4. Gráfico muestra lecturas ordenadas por tiempo

**Si error de índice**: Firebase Console → enlace del error → Create index (`sensorId` + `timestamp`).

## 3. Export CSV manual (SC-002)

1. Con serie visible, pulsar **Exportar CSV**
2. Abrir archivo en Excel/LibreOffice
3. Verificar 3 columnas y fechas legibles en español

## 4. Pure component check (SC-003)

```bash
grep -L firebase src/components/HistoryChart.jsx
# HistoryChart MUST NOT import firebase
```

## 5. Build

```bash
npm run lint
npm run build
```

## Referencias

- [design.md](./design.md)
- [contracts/firestore-history-query.md](./contracts/firestore-history-query.md)
- [contracts/csv-export.md](./contracts/csv-export.md)
