# Implementation Plan: Conexión Realtime con Firestore SDK y Mapeo Combinado

**Branch**: `003-firestore-realtime` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-firestore-realtime/spec.md`

**Design**: [design.md](./design.md) — JOIN FR-004 / FR-006

## Summary

Migrar el dashboard de RTDB legacy a **Cloud Firestore** con dos colecciones (`sensors`,
`readings`). El mapper `mapFirestoreToSensors` ejecuta un JOIN por `sensors.id =
readings.sensorId`, resuelve la lectura más reciente por `timestamp` (FR-004) y emite
props planas `{ name, current, value_type, date }` (FR-006). `Dashboard.jsx` usa dual
`onSnapshot` con recomputación reactiva (FR-010).

## Technical Context

**Language/Version**: React 19 (JSX), Vite 8, Node ≥ 20.19

**Primary Dependencies**: `firebase` (Firestore), `@tremor/react`, Tailwind

**Storage**: Cloud Firestore — colecciones `sensors`, `readings`

**Testing**: Validación manual (insert en `readings`); lint/build; mock JSON

**Target Platform**: Web (local + Netlify)

**Performance Goals**: Actualización UI < 1 s tras nuevo reading (SC-001)

**Constraints**:
- Mapper MUST implement FR-004 + FR-006 exactly
- SensorCard sin cambios
- Tailwind-only skeleton/error
- Cero warnings ESLint/build

**Scale/Scope**: ~7 sensores activos; lecturas append-only moderadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md` + `.cursorrules` (Firestore):

- [x] **I. Despliegue rápido:** reutiliza `firebase` instalado; elimina código RTDB
- [x] **II. Componentes atómicos + Mapper:** props planas; JOIN en mapper
- [x] **III. Tailwind exclusivo:** skeleton/error existentes
- [x] **IV. Mock-first:** mock `{ sensors[], readings[] }` antes de live (`.cursorrules`)
- [x] **V. Premium Agrotech:** grid/skeleton sin cambios de estilo
- [x] **VI. Control de alcance:** sin libs extra

**Nota de gobernanza**: Constitución v1.1.0 aún cita RTDB en Principios I/IV. Esta
feature sigue `.cursorrules` actualizado (Firestore). Enmienda de constitución
recomendada en PR separado — no bloquea implementación.

## Project Structure

### Documentation (this feature)

```text
specs/003-firestore-realtime/
├── plan.md              # This file
├── design.md            # Diseño técnico JOIN (FR-004, FR-006)
├── research.md          # Decisiones Phase 0
├── data-model.md        # Entidades Firestore + flat props
├── quickstart.md        # Validación manual
├── contracts/
│   ├── firebase-service.md
│   └── mapper-join.md
└── tasks.md             # (/speckit-tasks — pendiente)
```

### Source Code (repository root)

```text
src/
├── services/
│   └── firebase.js              # MODIFY — getFirestore
├── mappers/
│   └── mapFirestoreToSensors.js # NEW — resolveLatestReadings + JOIN
├── components/
│   ├── Dashboard.jsx            # MODIFY — dual onSnapshot, state `data`
│   ├── SensorCard.jsx           # NO CHANGE
│   └── SensorSkeleton.jsx       # NO CHANGE
└── mocks/
    └── sensorData.json          # MODIFY — Firestore mock
```

**Structure Decision**: Single Vite app; servicio Firestore aislado; mapper como capa
de dominio entre colecciones y UI.

## Phase 0 — Research

Completo en [research.md](./research.md). Sin NEEDS CLARIFICATION pendientes.

## Phase 1 — Design Artifacts

| Artefacto | Estado |
|-----------|--------|
| [design.md](./design.md) | ✅ JOIN FR-004/FR-006, flujo dual listener |
| [data-model.md](./data-model.md) | ✅ Entidades + relaciones |
| [contracts/mapper-join.md](./contracts/mapper-join.md) | ✅ Contrato mapper |
| [contracts/firebase-service.md](./contracts/firebase-service.md) | ✅ Contrato servicio |
| [quickstart.md](./quickstart.md) | ✅ Guía validación |

## Implementation Phases (preview for /speckit-tasks)

### Phase A — Mock + Mapper (mock-first)

1. Actualizar `sensorData.json` al schema Firestore canónico.
2. Implementar `resolveLatestReadings` + `mapFirestoreToSensors` según [design.md §4](./design.md).
3. Validar salida: 4 claves, tipos string en `current`/`date`.

### Phase B — Firebase service

4. Refactor `firebase.js`: `getFirestore(app)`, eliminar RTDB exports.

### Phase C — Dashboard reactivo

5. Dual `onSnapshot` + refs + `recomputeData` (design §5).
6. Renombrar estado `sensors` → `data` (FR-009).
7. Eliminar `mapFirebaseToSensors.js`.

### Phase D — Validación

8. `npm run lint` + `npm run build` (FR-015).
9. Prueba manual SC-001: insert reading en consola.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitución cita RTDB | `.cursorrules` ya migrado a Firestore | Retener RTDB contradice Issue #12 y backend real |
| Dual listener vs. uno | FR-008 + FR-010 | Un listener no detecta cambios en ambas colecciones |

## Constitution Re-check (post-design)

Todos los gates pasan respecto a `.cursorrules` Firestore. Pendiente sync constitución
v1.2.0 (RTDB → Firestore en Principios I, IV, Stack table).
