---
description: "Task list for Firestore Realtime + JOIN — Issue #12"
---

# Tasks: Conexión Realtime con Firestore SDK y Mapeo Combinado

**Input**: Design documents from `specs/003-firestore-realtime/`

**Prerequisites**: spec.md, plan.md, design.md, data-model.md, contracts/

**Tests**: Validación manual (Issue #12 DoD); sin suite automatizada

**Organization**: Tasks grouped by user story (US1–US4)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3, US4

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar rama y dependencia Firebase

- [x] T001 Verify current git branch is `003-firestore-realtime` in project root
- [x] T002 Verify `firebase` is listed in `package.json`; run `npm install` only if missing

**Checkpoint**: Rama correcta; paquete `firebase` disponible

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mock Firestore, servicio Firestore y mapper MUST existir antes del listener en Dashboard

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Update `src/mocks/sensorData.json` to canonical Firestore schema `{ sensors[], readings[] }` per `.cursorrules`
- [x] T004 [P] Create `src/mappers/mapFirestoreToSensors.js` with `resolveLatestReadings` + `mapFirestoreToSensors` implementing FR-004 and FR-006 per `specs/003-firestore-realtime/design.md` §4
- [x] T005 Refactor `src/services/firebase.js` to export Firestore via `getFirestore(app)` and remove all RTDB (`getDatabase`) imports per `specs/003-firestore-realtime/contracts/firebase-service.md`

**Checkpoint**: Mock + mapper + servicio Firestore listos; RTDB eliminado del servicio

---

## Phase 3: User Story 2 — Mapper JOIN y contrato SensorCard (Priority: P1) 🎯

**Goal**: Cruzar `sensors` + `readings` por ID y emitir `{ name, current, value_type, date }`

**Independent Test**: `mapFirestoreToSensors(mock.sensors, mock.readings)` returns objects each with exactly 4 string keys; `current` and `date` are strings

### Implementation for User Story 2

- [x] T006 [US2] Validate mapper against `src/mocks/sensorData.json` — each output item has exactly `{ name, current, value_type, date }`
- [x] T007 [US2] Verify FR-004 in `src/mappers/mapFirestoreToSensors.js`: two readings with same `sensorId` → output uses highest `timestamp`
- [x] T008 [US2] Verify FR-006 mapping in `src/mappers/mapFirestoreToSensors.js`: `name`←`sensors.name`, `value_type`←`sensors.unit`, `current`←`String(readings.value)`, `date`←ISO from `readings.timestamp`
- [x] T009 [US2] Verify edge cases in `src/mappers/mapFirestoreToSensors.js`: omit `active: false`, omit sensor without reading, omit invalid `timestamp`; no prohibited keys in output (FR-007)

**Checkpoint**: Mapper PASS; SensorCard requires zero field renaming

---

## Phase 4: User Story 1 — Lecturas en vivo desde Firestore (Priority: P1) 🎯 MVP

**Goal**: Dual `onSnapshot` en `sensors` + `readings` actualiza tarjetas en < 1 s

**Independent Test**: Insert new document in Firestore `readings` collection → corresponding card `current` updates without page reload

### Implementation for User Story 1

- [x] T010 [US1] Refactor `src/components/Dashboard.jsx`: rename state `sensors` → `data`; keep `loading` (initial `true`) and `error` per FR-009
- [x] T011 [US1] Replace RTDB imports in `src/components/Dashboard.jsx` with Firestore `collection`, `onSnapshot` from `firebase/firestore` and `db` from `src/services/firebase.js`
- [x] T012 [US1] Implement dual `onSnapshot` on collections `sensors` and `readings` with `useRef` buffers and `recomputeData()` per `specs/003-firestore-realtime/design.md` §5
- [x] T013 [US1] Wire `recomputeData()` in `src/components/Dashboard.jsx` to call `resolveLatestReadings` + `mapFirestoreToSensors` on every snapshot from either collection (FR-010)
- [x] T014 [US1] Add cleanup unsubscribes for both listeners in `useEffect` return in `src/components/Dashboard.jsx` (FR-008)
- [x] T015 [US1] Pass mapper output directly to `<SensorCard sensor={...} />` in `src/components/Dashboard.jsx` — zero Firestore field access in JSX (FR-013)

**Checkpoint**: Live Firestore data flows; new reading reflects in UI

---

## Phase 5: User Story 3 — Estados loading y error (Priority: P2)

**Goal**: Skeleton en carga inicial; mensaje accesible si Firestore falla

**Independent Test**: On first load skeleton visible; with invalid credentials error banner shows without crash

### Implementation for User Story 3

- [x] T016 [US3] Keep `loading === true` in `src/components/Dashboard.jsx` until first snapshot received from BOTH `sensors` and `readings` (FR-012)
- [x] T017 [US3] Render Tailwind `SensorSkeleton` grid during loading in `src/components/Dashboard.jsx` (count from active sensors or default 5)
- [x] T018 [US3] Show accessible error banner (`role="alert"`) on Firestore listener failure in `src/components/Dashboard.jsx` without crashing the app

**Checkpoint**: Loading and error UX complete per spec US3

---

## Phase 6: User Story 4 — Configuración segura (Priority: P2)

**Goal**: Firebase init solo via `VITE_*` env vars; credenciales fuera del repo

**Independent Test**: `firebase.js` has no hardcoded keys; `.env` is gitignored

### Implementation for User Story 4

- [x] T019 [US4] Confirm `src/services/firebase.js` reads only `import.meta.env.VITE_FIREBASE_*` with no hardcoded credentials
- [x] T020 [US4] Confirm `.gitignore` ignores `.env` and `.env.example` contains empty `VITE_FIREBASE_*` placeholders only

**Checkpoint**: Secure config verified; Netlify parity with `.env.example`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Eliminar legacy RTDB; validar lint/build y DoD manual

- [x] T021 Remove obsolete `src/mappers/mapFirebaseToSensors.js` and any remaining RTDB imports (`firebase/database`, `onValue`, `ref`) from `src/`
- [x] T022 Run `npm run lint` — zero warnings (FR-015)
- [x] T023 Run `npm run build` — zero errors (FR-015)
- [x] T024 Manual validation per `specs/003-firestore-realtime/quickstart.md`: insert reading in Firebase Console → UI updates in < 1 s (SC-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **US2 (Phase 3)**: Depends on Foundational — mapper validation before live wiring
- **US1 (Phase 4)**: Depends on Phase 3 checkpoint — needs validated mapper
- **US3 (Phase 5)**: Depends on US1 Dashboard refactor (T010–T015)
- **US4 (Phase 6)**: Can run in parallel with US3 after Foundational (T005)
- **Polish (Phase 7)**: Depends on US1–US4 complete

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US2 (P1) | Phase 2 | Mock arrays → mapper output 4 keys |
| US1 (P1) | US2 checkpoint | Insert reading → card updates < 1 s |
| US3 (P2) | US1 Dashboard | Skeleton on load; error banner |
| US4 (P2) | Phase 2 T005 | No hardcoded creds in `firebase.js` |

### Parallel Opportunities

- **Phase 2**: T004 `[P]` (mapper) parallel with T003 (mock) — different files
- **Phase 6 + 5**: T019–T020 `[US4]` parallel with T16–T18 `[US3]` after US1
- **Phase 7**: T022 `[P]` lint parallel prep while doing T024 manual test

### Parallel Example: Foundational

```bash
# Different files — can run together after T001–T002:
Task T003: Update src/mocks/sensorData.json
Task T004: Create src/mappers/mapFirestoreToSensors.js
# Then sequentially:
Task T005: Refactor src/services/firebase.js (depends on knowing Firestore surface)
```

### Parallel Example: Post-US1

```bash
# After T015 checkpoint:
Developer A: T016–T018 (US3 loading/error in Dashboard.jsx)
Developer B: T019–T020 (US4 env audit)
```

---

## Implementation Strategy

### MVP First (US2 + US1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (mock + mapper + Firestore service)
3. Complete Phase 3: US2 — validate mapper against mock
4. Complete Phase 4: US1 — dual `onSnapshot` + live grid
5. **STOP and VALIDATE**: Insert reading in Firebase Console (T024 partial)
6. Add US3 → US4 → Polish

### Incremental Delivery

1. Setup + Foundational → mock-first mapper ready
2. US2 validated → JOIN contract proven offline
3. US1 live → MVP dashboard on Firestore
4. US3 → loading/error polish
5. US4 → security audit
6. Polish → remove RTDB legacy, lint/build, full quickstart

### Migration Note

Existing RTDB code (`mapFirebaseToSensors.js`, `onValue` in `Dashboard.jsx`, `getDatabase` in `firebase.js`) MUST be replaced — not extended. See `specs/003-firestore-realtime/design.md` §1.1.

---

## Notes

- `[P]` tasks = different files, no incomplete dependencies
- `[Story]` maps to spec.md user stories US1–US4
- `SensorCard.jsx` and `SensorSkeleton.jsx` require NO changes unless bug found
- Node ≥ 20.19 required for Vite 8 (`nvm use 22`)
- Constitution v1.1.0 still references RTDB; this feature follows updated `.cursorrules` (Firestore)
