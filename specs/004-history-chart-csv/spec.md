# Feature Specification: Gráficos Históricos y Exportación CSV (Firestore)

**Feature Branch**: `004-history-chart-csv`

**Created**: 2026-06-10

**Status**: Draft

**Input**: Issue #11 — Gráficos Históricos y Exportación CSV (Firestore)

**Issue**: [#11 — Gráficos Históricos y Exportación CSV](https://github.com/iesgermansanchezruiperez/webapp-demeteria/issues/11)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar serie temporal histórica (Priority: P1)

Como operador del invernadero, quiero ver un gráfico de línea con las lecturas
históricas de un sensor para analizar tendencias en el tiempo.

**Why this priority**: Es el requisito central de la memoria del proyecto; sin
visualización histórica no se cumple el panel web exigido.

**Independent Test**: Pasar un array mock de puntos `{ date, value, sensorName }`
a `HistoryChart` y verificar que Tremor `LineChart` renderiza la serie sin errores.

**Acceptance Scenarios**:

1. **Given** serie temporal mock con ≥ 2 puntos ordenados por fecha,
   **When** se renderiza `HistoryChart`, **Then** muestra `LineChart` con la curva
   visible y estilo Premium Agrotech (`bg-white/80 backdrop-blur-md`).
2. **Given** serie vacía, **When** se renderiza `HistoryChart`,
   **Then** muestra estado vacío accesible sin crashear.
3. **Given** `HistoryChart`, **When** inspecciona el componente,
   **Then** no realiza fetching; solo consume *props*.

---

### User Story 2 - Exportar lecturas a CSV (Priority: P1)

Como operador, quiero descargar las lecturas históricas en CSV para archivarlas
o analizarlas en Excel/LibreOffice.

**Why this priority**: La memoria exige datos históricos exportables; paridad
funcional con el gráfico.

**Independent Test**: Invocar `exportToCSV(formattedData)` con datos mock y
verificar descarga de archivo `.csv` con columnas Fecha, Valor, Sensor.

**Acceptance Scenarios**:

1. **Given** array formateado de lecturas, **When** pulsa botón Exportar CSV,
   **Then** descarga archivo válido vía Blob con encabezados `Fecha,Valor,Sensor`.
2. **Given** timestamps en entrada, **When** exporta,
   **Then** fechas en CSV están en ISO 8601 o formato local legible (`es-ES`).
3. **Given** valores numéricos, **When** exporta,
   **Then** columna Valor preserva el número sin corrupción.

---

### User Story 3 - Consulta Firestore de histórico por sensor (Priority: P2)

Como desarrollador, quiero obtener lecturas históricas desde Firestore filtrando
por `sensorId` y ordenando por `timestamp`, para alimentar gráfico y exportación.

**Why this priority**: Conecta UI pura con backend Firestore; depende de Issue #12.

**Independent Test**: Query mock o Firestore real para un `sensorId` devuelve
lecturas ordenadas cronológicamente.

**Acceptance Scenarios**:

1. **Given** colección `readings` con múltiples docs del mismo `sensorId`,
   **When** ejecuta query `where('sensorId','==',id)` + `orderBy('timestamp')`,
   **Then** devuelve serie ordenada ascendente por tiempo.
2. **Given** lecturas con Firestore Timestamp, **When** transforma para UI,
   **Then** normaliza fechas a formato consumible por `HistoryChart` y CSV.
3. **Given** catálogo `sensors`, **When** enriquece serie,
   **Then** incluye `sensorName` desde `sensors.name` por JOIN en `sensorId`.

---

### User Story 4 - Botón de descarga atómico (Priority: P2)

Como usuario, quiero un botón claro para exportar con microinteracciones coherentes
con el resto del dashboard Premium Agrotech.

**Why this priority**: UX de exportación; componente reutilizable.

**Independent Test**: Renderizar `ExportButton` (o `Button` atómico) con
`transition-all duration-300 hover:shadow-md` y callback `onClick`.

**Acceptance Scenarios**:

1. **Given** botón visible, **When** hover,
   **Then** aplica microinteracciones Tailwind del design system.
2. **Given** click, **When** hay datos,
   **Then** dispara `exportToCSV` sin recargar página.

---

### Edge Cases

- Sensor sin lecturas históricas: gráfico vacío + botón export deshabilitado o CSV vacío con solo headers.
- Una sola lectura: LineChart muestra punto único sin error.
- Lecturas con `timestamp` Firestore Timestamp vs number ms: normalización obligatoria.
- Nombre de sensor desconocido: CSV usa `sensorId` como fallback en columna Sensor.
- Caracteres especiales en nombre de sensor: CSV escapa comillas según RFC básico.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST crear mock `src/mocks/firestoreData.json` con estructura
  `{ sensors[], readings[] }` alineada a `.cursorrules` (puede extender
  `sensorData.json` existente con más lecturas históricas por sensor).
- **FR-002**: MUST crear `HistoryChart.jsx` usando Tremor `LineChart` con clases
  Premium Agrotech (`bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm`).
- **FR-003**: `HistoryChart` MUST ser componente puro: recibe serie temporal por
  props; PROHIBIDO fetching interno.
- **FR-004**: MUST implementar `exportToCSV(data)` en `src/utils/export.js` que
  genere columnas `Fecha`, `Valor`, `Sensor` y fuerce descarga vía Blob.
- **FR-005**: CSV MUST formatear timestamps a ISO 8601 o locale `es-ES` legible.
- **FR-006**: MUST crear componente botón atómico para exportación con
  microinteracciones Tailwind (`transition-all duration-300 hover:shadow-md`).
- **FR-007**: MUST consultar Firestore `readings` con filtro `sensorId` y
  `orderBy('timestamp')` en capa contenedora (p. ej. ampliación de `Dashboard` o
  sección dedicada); NO dentro de `HistoryChart`.
- **FR-008**: MUST enriquecer lecturas con `sensorName` desde colección `sensors`
  antes de pasar a gráfico/CSV.
- **FR-009**: MUST reutilizar `toTimestampMs` o equivalente para Timestamps Firestore.
- **FR-010**: MUST mantener cero warnings ESLint y build.

### Key Entities

- **Historical data point (UI)**: `{ date: string, value: number, sensorName: string }` — entrada gráfico/CSV.
- **Reading (Firestore)**: `{ sensorId, value, timestamp }` — fuente histórico.
- **Sensor (Firestore)**: catálogo para nombre y unidad.
- **CSV row**: `{ Fecha, Valor, Sensor }` — salida exportación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: LineChart renderiza serie mock de ≥ 10 puntos sin errores de consola.
- **SC-002**: CSV descargado abre en Excel/LibreOffice con 3 columnas correctas.
- **SC-003**: 100% props-driven: `HistoryChart` sin imports de Firebase.
- **SC-004**: Query histórica por `sensorId` devuelve lecturas ordenadas por tiempo.
- **SC-005**: `npm run lint` y `npm run build` sin errores ni warnings.

## Assumptions

- Issue #12 completado: Firestore `sensors` + `readings` operativos en local.
- Tremor `LineChart` ya disponible vía `@tremor/react` (sin deps nuevas).
- v1 muestra histórico de **un sensor seleccionado** (selector simple o primer sensor activo); multi-sensor overlay fuera de alcance.
- Netlify env vars pendientes (Issue #13); histórico funciona en local/mock sin bloquear desarrollo.
- Fetching histórico vive en contenedor padre; `HistoryChart` y botón son presentacionales.

## Out of Scope

- Autenticación / reglas Firestore.
- Exportación PDF, Excel nativo (.xlsx).
- Paginación infinita o límites de query compuestos avanzados.
- Gráficos multi-sensor superpuestos en una misma carta.
- Configuración Netlify (responsabilidad externa).
