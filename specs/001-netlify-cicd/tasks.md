---
description: "Task list for CI/CD Netlify — Issue #13 (artefactos de repositorio)"
---

# Tasks: CI/CD en Netlify y Protección de Variables de Entorno

**Input**: Design documents from `specs/001-netlify-cicd/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test suite requested — validation via manual checks in quickstart.md

**Organization**: Tasks grouped by user story. **Prohibido modificar `src/**`** en esta feature.

**Constraints** (plan.md): solo 3 artefactos de repo — `public/_redirects`, `.gitignore`, `.env.example`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3 — maps to spec.md user stories
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm branch, baseline build, and contract review before file edits

- [x] T001 Verify current git branch is `001-netlify-cicd` in project root
- [x] T002 Run `npm install` and confirm baseline `npm run build` succeeds before any file changes
- [x] T003 Review `specs/001-netlify-cicd/contracts/spa-redirects.md` and `specs/001-netlify-cicd/contracts/env-variables.md` for exact content requirements

**Checkpoint**: Branch correct, build green, contracts understood

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking code infrastructure beyond existing Vite setup — proceed directly to user story phases after Setup

**⚠️ CRITICAL**: All three repo artifacts (Phase 3–5) are independent file edits; no Foundational code tasks required

**Checkpoint**: Foundation ready — user story file tasks can begin in parallel

---

## Phase 3: User Story 3 — Credenciales Firebase protegidas (Priority: P1) 🎯

**Goal**: Blindar secretos locales y documentar variables Firebase sin commitear credenciales reales

**Independent Test**: `touch .env .env.local .env.production && git check-ignore -v .env .env.local .env.production` — los tres MUST aparecer ignorados; `.env.example` MUST NOT estar ignorado

### Implementation for User Story 3

- [x] T004 [P] [US3] Add dedicated Environment variables section with explicit entries `.env`, `.env.local`, `.env.production` to `.gitignore` at repo root (preserve existing `*.local` line)
- [x] T005 [P] [US3] Create `.env.example` at repo root with 7 empty `VITE_FIREBASE_*` keys and Spanish header comments per `specs/001-netlify-cicd/plan.md`
- [x] T006 [US3] Validate ignore contract: run `git check-ignore -v .env .env.local .env.production` (all matched) and `git check-ignore .env.example` (must exit 1 — not ignored) per `specs/001-netlify-cicd/quickstart.md` §3.2–3.3

**Checkpoint**: US3 complete — credenciales locales protegidas, plantilla commiteable lista

---

## Phase 4: User Story 2 — Navegación SPA sin errores 404 (Priority: P2)

**Goal**: Garantizar regla de reescritura SPA en artefacto de build para Netlify

**Independent Test**: `npm run build && grep -Fx '/* /index.html 200' dist/_redirects` — exit 0

### Implementation for User Story 2

- [x] T007 [P] [US2] Create `public/_redirects` (no file extension) with exact single line `/* /index.html 200` per `specs/001-netlify-cicd/contracts/spa-redirects.md`
- [x] T008 [US2] Run `npm run build` and verify `dist/_redirects` exists with exact content `/* /index.html 200` per `specs/001-netlify-cicd/quickstart.md` §3.1

**Checkpoint**: US2 complete — SPA rewrite rule present in deploy artifact

---

## Phase 5: User Story 1 — Despliegue automático en cada cambio a main (Priority: P1) 🎯

**Goal**: Confirmar que el repositorio produce un artefacto `dist/` compatible con Netlify auto-detect Vite (`npm run build`, publish `dist`)

**Independent Test**: Push a `main` con site Netlify vinculado dispara build exitoso; validación local previa: `npm run lint && npm run build` sin errores

### Implementation for User Story 1

- [x] T009 [US1] Run `npm run lint` and `npm run build` with zero errors to confirm Netlify build compatibility per constitution (cero warnings)
- [x] T010 [US1] Execute full local validation from `specs/001-netlify-cicd/quickstart.md` sections 3.1 through 3.4 (build, gitignore, env template, lint/build)

**Checkpoint**: US1 repo-side complete — artefacto listo para CI/CD; pendiente config manual Netlify

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Scope guard, manual Netlify checklist, issue closure

- [x] T011 Confirm zero modifications under `src/` directory (plan.md constraint — only config files changed)
- [ ] T012 [P] Complete manual Netlify setup per `specs/001-netlify-cicd/quickstart.md` §5: link site to repo, set build `npm run build`, publish `dist`, add 7 `VITE_FIREBASE_*` env vars, verify deploy on push to `main` *(pendiente — acción manual en panel Netlify)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Informational only — no blocking tasks
- **US3 (Phase 3)**: Depends on T001–T003 — can run parallel with US2 file tasks
- **US2 (Phase 4)**: Depends on T001–T003 — independent of US3 (different files)
- **US1 (Phase 5)**: Depends on T004–T008 (all repo artifacts must exist before final build validation)
- **Polish (Phase 6)**: Depends on T009–T010

### User Story Dependencies

- **US3 (P1)**: Independent — `.gitignore` + `.env.example` only
- **US2 (P2)**: Independent — `public/_redirects` only
- **US1 (P1)**: Depends on US2 + US3 repo artifacts for meaningful build validation

### Within Each User Story

- File creation before validation tasks (T004/T005 before T006; T007 before T008)
- US1 validation (T009–T010) after all file tasks complete

### Parallel Opportunities

- **T004 + T005 + T007**: Three different files — run simultaneously after Setup
- **T011 + T012**: Scope check parallel with manual Netlify work (different actors)

---

## Parallel Example: Core file edits (after T001–T003)

```bash
# Launch all three repo artifacts together:
Task T004: "Add env section to .gitignore"
Task T005: "Create .env.example at repo root"
Task T007: "Create public/_redirects"
```

---

## Implementation Strategy

### MVP First (US3 + US2 — minimum repo deliverable)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 3: US3 — `.gitignore` + `.env.example` (T004–T006)
3. Complete Phase 4: US2 — `public/_redirects` (T007–T008)
4. **STOP and VALIDATE**: quickstart §3.1–3.3
5. US1 local validation (T009–T010) before merge

### Full delivery (includes Netlify manual)

1. MVP steps above
2. Merge to `main`
3. Polish T012 — Netlify panel configuration
4. Verify Issue #13 Definition of Done (spec.md SC-001 through SC-004)

### Suggested commit grouping

| Commit | Tasks | Files |
|--------|-------|-------|
| 1 | T004, T005, T007 | `.gitignore`, `.env.example`, `public/_redirects` |
| 2 | T006, T008, T009, T010, T011 | validations only (no new files) |

---

## Task Summary

| Story | Priority | Tasks | Parallel tasks |
|-------|----------|-------|----------------|
| Setup | — | T001–T003 (3) | — |
| US3 | P1 | T004–T006 (3) | T004, T005 |
| US2 | P2 | T007–T008 (2) | T007 |
| US1 | P1 | T009–T010 (2) | — |
| Polish | — | T011–T012 (2) | T012 |
| **Total** | | **12** | **4 parallelizable file tasks** |

## Notes

- Do NOT modify `src/**`, `vite.config.js`, or add npm dependencies
- Do NOT create `netlify.toml` (out of scope per plan.md)
- T012 is manual — performed in Netlify UI, not in repo
- `.env.example` MUST remain tracked; never add it to `.gitignore`
- Refer to `specs/001-netlify-cicd/plan.md` for exact file contents
