---
description: "Task list for History Chart + CSV Export — Issue #11"
---

# Tasks: Gráficos Históricos y Exportación CSV (Firestore)

**Input**: Design documents from `specs/004-history-chart-csv/`

**Prerequisites**: spec.md, plan.md, design.md, contracts/

**Tests**: Validación manual (Issue #11 DoD); sin suite automatizada

**Organization**: Tasks grouped by user story (US1–US4)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3, US4

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar rama de trabajo

- [x] T001 Verify current git branch is `004-history-chart-csv` in project root

**Checkpoint**: Rama correcta

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mock histórico, mapper y util CSV MUST existir antes de componentes UI

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create `src/mocks/firestoreData.json` with `{ sensors[], readings[] }` and ≥ 10 historical readings for at least one sensor per FR-001 / SC-001
- [x] T003 [P] Create `src/mappers/mapReadingsToHistorySeries.js` reusing `toTimestampMs` from `src/mappers/mapFirestoreToSensors.js` per `specs/004-history-chart-csv/contracts/firestore-history-query.md`
- [x] T004 [P] Implement `exportToCSV(data, filename)` in `src/utils/export.js` with columns `Fecha,Valor,Sensor`, Blob download, UTF-8 BOM, and `es-ES` date formatting per `specs/004-history-chart-csv/contracts/csv-export.md`

**Checkpoint**: Mock + mapper + export util validables offline

---

## Phase 3: User Story 1 — Visualizar serie temporal histórica (Priority: P1) 🎯

**Goal**: `HistoryChart` renderiza Tremor `LineChart` con estilo Premium Agrotech; componente puro

**Independent Test**: Pass mock `series[]` to `HistoryChart` → LineChart visible without console errors

### Implementation for User Story 1

- [x] T005 [US1] Create `src/components/HistoryChart.jsx` with Tremor `LineChart` (`index="date"`, `categories={['value']}`) and glassmorphism wrapper per `specs/004-history-chart-csv/contracts/history-chart-props.md`
- [x] T006 [US1] Add accessible empty state in `src/components/HistoryChart.jsx` when `series.length === 0`
- [x] T007 [US1] Verify `src/components/HistoryChart.jsx` has zero Firebase imports and accepts only props (FR-003, SC-003)
- [x] T008 [US1] Validate `HistoryChart` against mock from `src/mocks/firestoreData.json` via `mapReadingsToHistorySeries` — ≥ 10 points render (SC-001)

**Checkpoint**: Gráfico puro funcional con mock

---

## Phase 4: User Story 2 — Exportar lecturas a CSV (Priority: P1) 🎯

**Goal**: Descarga CSV válida con fechas legibles y valores numéricos correctos

**Independent Test**: `exportToCSV(mockSeries)` downloads file openable in Excel with 3 columns

### Implementation for User Story 2

- [x] T009 [US2] Validate `exportToCSV` output headers `Fecha,Valor,Sensor` and row count matches input in `src/utils/export.js`
- [x] T010 [US2] Verify CSV dates use `es-ES` locale and numeric `value` preserved without corruption (FR-005)
- [x] T011 [US2] Verify CSV escapes commas/quotes in `sensorName` per edge case in spec

**Checkpoint**: Export util PASS independent of UI

---

## Phase 5: User Story 4 — Botón de descarga atómico (Priority: P2)

**Goal**: Botón reutilizable con microinteracciones Premium Agrotech

**Independent Test**: Render `ExportButton` with `onClick` callback; hover classes applied

### Implementation for User Story 4

- [x] T012 [US4] Create `src/components/ExportButton.jsx` with Tailwind microinteractions `transition-all duration-300 hover:shadow-md hover:-translate-y-0.5` (FR-006)
- [x] T013 [US4] Support `disabled` prop when no data; accessible label for export action

**Checkpoint**: Botón atómico listo para integración

---

## Phase 6: User Story 3 — Consulta Firestore histórica por sensor (Priority: P2) 🎯 MVP live

**Goal**: Query filtrada `readings` + selector sensor + integración dashboard

**Independent Test**: Select sensor in UI → chart shows ordered historical readings from Firestore

### Implementation for User Story 3

- [x] T014 [US3] Create `src/components/HistorySection.jsx` with native `<select>` for active sensors and state `selectedSensorId`, `series`, `loading`, `error`
- [x] T015 [US3] Implement Firestore query `where('sensorId','==', id)` + `orderBy('timestamp','asc')` with `onSnapshot` and cleanup in `src/components/HistorySection.jsx` (FR-007)
- [x] T016 [US3] Map snapshot docs through `mapReadingsToHistorySeries` enriching `sensorName` from `sensors.name` (FR-008, FR-009)
- [x] T017 [US3] Compose `HistorySection` with `HistoryChart`, `ExportButton`, and `onExport={() => exportToCSV(series, ...)}` in `src/components/HistorySection.jsx`
- [x] T018 [US3] Refactor `src/components/Dashboard.jsx` to expose `sensorsCatalog` state and render `<HistorySection sensors={sensorsCatalog} />` below live grid when `!loading`

**Checkpoint**: Histórico en vivo desde Firestore; export desde UI

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Lint/build y validación manual completa

- [x] T019 Run `npm run lint` — zero warnings (FR-010)
- [x] T020 Run `npm run build` — zero errors (FR-010)
- [x] T021 Manual validation per `specs/004-history-chart-csv/quickstart.md`: chart + CSV + Firestore query + composite index if needed (SC-002, SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 (mapper + mock)
- **US2 (Phase 4)**: Depends on T004 (`export.js`); parallel with US1 after Phase 2
- **US4 (Phase 5)**: Can start after Phase 2; integrates in US3 (T017)
- **US3 (Phase 6)**: Depends on US1 + US2 + US4 checkpoints
- **Polish (Phase 7)**: Depends on US3 complete

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US1 (P1) | Phase 2 | Mock series → LineChart renders |
| US2 (P1) | T004 | exportToCSV → valid CSV file |
| US4 (P2) | Phase 2 | ExportButton renders + hover |
| US3 (P2) | US1, US2, US4 | Firestore query → chart updates on sensor change |

### Parallel Opportunities

- **Phase 2**: T003 `[P]` mapper ∥ T004 `[P]` export.js (different files)
- **Post Phase 2**: US1 (HistoryChart) ∥ US2 validation (export) ∥ US4 (ExportButton)
- **Phase 7**: T019 `[P]` lint while preparing T021 manual test

### Parallel Example: Foundational

```bash
Task T002: src/mocks/firestoreData.json
Task T003: src/mappers/mapReadingsToHistorySeries.js  # parallel after T002 readings exist
Task T004: src/utils/export.js                        # parallel with T003
```

### Parallel Example: Post-Foundational

```bash
Developer A: T005–T008 (HistoryChart + mock validation)
Developer B: T009–T011 (exportToCSV validation)
Developer C: T012–T013 (ExportButton)
# Then sequentially: T014–T018 (HistorySection + Dashboard)
```

---

## Implementation Strategy

### MVP First (mock-only chart + CSV)

1. Phase 1 + Phase 2
2. Phase 3 (US1) + Phase 4 (US2) + Phase 5 (US4)
3. Wire chart + button with mock data in temporary dev harness or Story-less manual test
4. **STOP and VALIDATE** offline

### Full delivery (+ Firestore)

5. Phase 6 (US3) — HistorySection + Dashboard
6. Phase 7 — lint/build/manual

### Incremental Delivery

1. Foundational → mapper + CSV util ready
2. US1 → chart visible with mock
3. US2 + US4 → export button downloads CSV
4. US3 → live Firestore historical query
5. Polish → production-ready

---

## Notes

- `[P]` tasks = different files, no incomplete dependencies
- `HistoryChart` MUST remain Firebase-free (SC-003)
- Firestore composite index (`sensorId` + `timestamp`) may be required on first query — see quickstart.md
- Netlify env vars out of scope (boss handles Issue #13 prod deploy)
- Do not add npm dependencies (papaparse, chart.js, etc.)
