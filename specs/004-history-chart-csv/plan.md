# Implementation Plan: Gráficos Históricos y Exportación CSV

**Branch**: `004-history-chart-csv` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Design**: [design.md](./design.md)

**Input**: Feature specification from `specs/004-history-chart-csv/spec.md`

## Summary

Añadir sección histórica al dashboard: query Firestore `readings` por `sensorId`
ordenada por `timestamp`, mapper a serie `{ date, value, sensorName }`, gráfico
Tremor `LineChart` puro (`HistoryChart`), exportación CSV vía Blob (`exportToCSV`)
y botón atómico Premium Agrotech.

## Technical Context

**Language/Version**: React 19 (JSX), Vite 8, Node ≥ 20.19

**Primary Dependencies**: `firebase` (Firestore query), `@tremor/react` (LineChart), Tailwind

**Storage**: Firestore colecciones `readings` (query filtrada) + `sensors` (nombre)

**Testing**: Validación manual (gráfico + CSV); mock-first con `firestoreData.json`

**Target Platform**: Web local (Netlify fuera de alcance v1)

**Constraints**:
- `HistoryChart` sin fetching (FR-003)
- Sin dependencias nuevas
- Reutilizar `toTimestampMs` para Timestamps Firestore
- Cero warnings lint/build

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.cursorrules` (Firestore mock-first, Tailwind-only, atomic JSX):

- [x] **I. Despliegue rápido:** componentes atómicos, sin libs extra
- [x] **II. Componentes atómicos + Mapper:** HistoryChart/ExportButton puros; mapper histórico separado
- [x] **III. Tailwind exclusivo:** LineChart wrapper + botón con utilidades Tailwind
- [x] **IV. Mock-first:** `firestoreData.json` antes de query live
- [x] **V. Premium Agrotech:** glassmorphism en chart card + microinteracciones botón
- [x] **VI. Control de alcance:** Tremor LineChart ya en stack; sin papaparse/chart.js

**Nota**: Constitución v1.1.0 cita RTDB; proyecto ya en Firestore (Issue #12).

## Project Structure

### Documentation (this feature)

```text
specs/004-history-chart-csv/
├── plan.md
├── design.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── history-chart-props.md
│   ├── csv-export.md
│   └── firestore-history-query.md
└── tasks.md          # (/speckit-tasks — pendiente)
```

### Source Code

```text
src/
├── components/
│   ├── Dashboard.jsx              # MODIFY
│   ├── HistorySection.jsx         # NEW
│   ├── HistoryChart.jsx           # NEW
│   └── ExportButton.jsx           # NEW
├── mappers/
│   └── mapReadingsToHistorySeries.js  # NEW
├── utils/
│   └── export.js                  # NEW
└── mocks/
    └── firestoreData.json         # NEW
```

## Phase 0 — Research

Completo en [research.md](./research.md). Sin NEEDS CLARIFICATION.

## Phase 1 — Design Artifacts

| Artefacto | Estado |
|-----------|--------|
| [design.md](./design.md) | ✅ Arquitectura contenedor/presentational |
| [data-model.md](./data-model.md) | ✅ Entidades serie + CSV |
| [contracts/history-chart-props.md](./contracts/history-chart-props.md) | ✅ |
| [contracts/csv-export.md](./contracts/csv-export.md) | ✅ |
| [contracts/firestore-history-query.md](./contracts/firestore-history-query.md) | ✅ |
| [quickstart.md](./quickstart.md) | ✅ |

## Implementation Phases (preview for /speckit-tasks)

### Phase A — Mock + mapper + export util
1. `firestoreData.json` con ≥ 10 readings históricos
2. `mapReadingsToHistorySeries.js`
3. `export.js` → `exportToCSV`

### Phase B — UI presentational
4. `HistoryChart.jsx` (LineChart)
5. `ExportButton.jsx`

### Phase C — Firestore + integración
6. `HistorySection.jsx` (query + selector)
7. Integrar en `Dashboard.jsx`

### Phase D — Validación
8. lint/build
9. Manual: gráfico + CSV + query Firestore

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Índice compuesto Firestore | Query `sensorId` + `orderBy timestamp` | Client-side filter no cumple FR-007 |
| HistorySection contenedor | Separar fetch de HistoryChart puro | Fetch en chart viola FR-003 |

## Constitution Re-check (post-design)

All gates pass. Ready for `/speckit-tasks`.
