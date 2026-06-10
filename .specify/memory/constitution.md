<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles:
  - II. Componentes Funcionales Atómicos → añadida regla Mapper para props planas
  - IV. Mock-First RTDB → schema `demeteria.*` anidado (reemplaza `crop_sensors[]`)
Added sections: N/A
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
Follow-up TODOs: Actualizar specs históricos issue-9 si se reabre el dashboard
-->

# DemeterIA Web Dashboard Constitution

## Core Principles

### I. Despliegue Rápido y Simplicidad Modular

El Web Dashboard de DemeterIA (Agricultura de Precisión) prioriza despliegue rápido,
código modular, cero warnings y un enfoque minimalista. Cada feature MUST entregar
valor visible con la menor superficie de código posible.

**Reglas no negociables:**

- MUST mantener el proyecto libre de warnings de linter y build.
- MUST favorecer composición modular sobre monolitos de componentes.
- MUST evitar abstracciones prematuras; YAGNI aplica salvo requisito explícito.
- El backend de datos en producción es Firebase Realtime Database (RTDB); la UI MUST
  diseñarse para consumir esa fuente sin acoplar la presentación a detalles de
  implementación del cliente Firebase.

**Rationale:** Un dashboard agrotech debe iterar rápido sobre datos de sensores reales
sin deuda técnica que frene el despliegue.

### II. Componentes Funcionales Atómicos (NON-NEGOTIABLE)

Toda la UI MUST construirse con componentes React funcionales atómicos: una
responsabilidad clara por componente, props explícitas y composición jerárquica.

**Reglas no negociables:**

- MUST escribir componentes como funciones, no clases.
- MUST mantener archivos en `.jsx`; TypeScript está PROHIBIDO en este proyecto.
- MUST dividir vistas compuestas en átomos reutilizables (tarjeta de sensor, badge de
  estado, contenedor de grid, etc.) antes de ensamblar páginas.
- MUST exportar un componente principal por archivo salvo helpers locales privados al
  mismo módulo.
- MUST recibir props planas en componentes UI; los datos anidados de RTDB MUST
  transformarse mediante una capa adaptadora (Mapper) antes de inyectarse en estado
  o componentes Tremor.

**Rationale:** La atomicidad facilita el mock-first, el testing visual y la evolución
independiente de cada bloque del dashboard. El Mapper desacopla el árbol RTDB de la UI.

### III. Tailwind Exclusivo para Estilos (NON-NEGOTIABLE)

Todo el CSS MUST resolverse mediante clases de Tailwind CSS. No existen excepciones
para estilos de producción.

**Reglas no negociables:**

- PROHIBIDO usar archivos `.css` de componente, CSS Modules, styled-components,
  Emotion, inline `style={{}}` salvo valores dinámicos imposibles de expresar con
  utilidades Tailwind (caso excepcional que MUST documentarse en el PR).
- PROHIBIDO importar hojas de estilo externas para estilización de UI propia.
- MUST aplicar clases Tailwind directamente en JSX; Tremor (@tremor/react) MUST
  sobrescribirse con clases Tailwind cuando el diseño lo requiera.
- MUST usar las utilidades nativas de Tailwind para layout, color, tipografía,
  espaciado, sombras y transiciones.

**Rationale:** Un único sistema de estilos garantiza coherencia visual Premium Agrotech
y elimina conflictos de especificidad CSS.

### IV. Mock-First con Estructura RTDB Canónica (NON-NEGOTIABLE)

Antes de implementar cualquier integración real con Firebase RTDB, MUST existir un
mock que use la estructura JSON exacta definida en esta constitución.

**Reglas no negociables:**

- MUST crear mocks de datos antes de escribir lógica de fetch o suscripciones RTDB.
- MUST respetar la estructura anidada bajo `demeteria`: nodos hoja con `timestamp`
  (number, epoch ms) y `valor` (number) o `water_detected` (boolean).
- MUST tratar el mock como contrato de integración: cambios al schema requieren
  enmienda de constitución y actualización coordinada de specs/planes/tareas/mapper.
- PROHIBIDO pasar el árbol RTDB crudo a componentes UI; usar Mapper (Principio II).
- PROHIBIDO inventar campos adicionales en mocks sin especificación previa.

**Estructura JSON canónica (Mock RTDB):**

```json
{
  "demeteria": {
    "agua": {
      "ec": {
        "timestamp": 1777924150543,
        "valor": 57
      }
    },
    "ambiente": {
      "co2": {
        "timestamp": 1778185448335,
        "valor": 742
      }
    },
    "nivel_agua": {
      "sen0368": {
        "timestamp": 1775860084380,
        "valor": 0
      },
      "sen0508": {
        "timestamp": 1775181114428,
        "water_detected": false
      }
    },
    "temperatura": {
      "agua": {
        "timestamp": 1778177934537,
        "valor": 22.125
      }
    }
  }
}
```

**Rationale:** El mock canónico refleja el árbol real de Firebase RTDB; el Mapper
traduce nodos anidados a props planas consumibles por la UI.

### V. Filosofía Premium Agrotech

La UI MUST transmitir un estilo **Premium Agrotech**: moderno, sofisticado y limpio.
Huye absolutamente del diseño genérico de panel de administración. Referencia visual:
estética Apple / Stripe aplicada al dominio agrícola.

**Reglas no negociables:**

- **Layout:** MUST usar diseño tipo Bento Grid o tarjetas distribuidas uniformemente
  con `grid-cols-1 md:grid-cols-3` y `gap-6` entre elementos.
- **Fondos:** MUST emplear gradientes muy sutiles en el contenedor principal (ej.
  `bg-gradient-to-br from-slate-50 to-emerald-50/30`).
- **Tarjetas (glassmorphism):** MUST aplicar en tarjetas Tremor y contenedores propios:
  `bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm`.
- **Tipografía y A11y:** MUST garantizar alto contraste; títulos con `tracking-tight`;
  textos secundarios con `text-slate-500`.
- **Estados semánticos:** MUST usar colores nativos de Tremor (`emerald`, `amber`,
  `rose`) para estados numéricos de sensores.
- **Microinteracciones:** Todo elemento interactivo MUST incluir
  `transition-all duration-300 hover:shadow-md hover:-translate-y-0.5` en tarjetas
  clicables o hoverables.

**Rationale:** El dashboard es la cara visible de DemeterIA; la percepción de calidad
depende de coherencia visual y detalle en interacciones.

### VI. Comportamiento del Agente y Control de Alcance

Las reglas de comportamiento del agente de desarrollo (IA) son vinculantes para todo
contribuidor humano o automatizado.

**Reglas no negociables:**

- **Anti-Yapping:** MUST eliminar saludos y texto de relleno en entregables de código;
  la respuesta MUST centrarse en código y cambios concretos.
- **Cero Suposiciones:** Si falta contexto crítico, MUST pedir aclaración; PROHIBIDO
  inventar requisitos, APIs o schemas no especificados.
- **Control de Alcance:** PROHIBIDO añadir funcionalidades o librerías no solicitadas
  explícitamente en spec, plan o tarea.
- **Estandarización de UI:** Toda estilización MUST resolverse mediante Tailwind (ver
  Principio III).

**Rationale:** La disciplina anti-yapping y anti-suposiciones protege el alcance del
MVP y la velocidad de entrega.

## Stack Tecnológico Obligatorio

| Capa | Tecnología | Notas |
|------|------------|-------|
| Build | Vite | HMR, despliegue rápido |
| UI | React (JSX) | Sin TypeScript |
| Estilos | Tailwind CSS | Único sistema de estilos permitido |
| Componentes analíticos | @tremor/react | Sobrescribir estilos con Tailwind |
| Datos (prod.) | Firebase RTDB | Integración posterior a fase mock |

PROHIBIDO introducir frameworks UI alternativos (MUI, Chakra, Bootstrap) o preprocesadores
CSS (Sass/Less) sin enmienda de constitución.

## Flujo de Desarrollo Specification-Driven

1. **Especificar** (`/speckit-specify`): requisitos medibles y escenarios de aceptación.
2. **Planificar** (`/speckit-plan`): Constitution Check MUST pasar antes de diseño.
3. **Tareas** (`/speckit-tasks`): tareas atómicas con rutas de archivo explícitas.
4. **Implementar** (`/speckit-implement`): mock-first, componentes atómicos, Tailwind-only.
5. **Validar**: cero warnings, UI Premium Agrotech, mock/schema RTDB conforme.

Cada plan MUST incluir una sección **Constitution Check** que verifique cumplimiento
de los Principios I–VI antes de avanzar a implementación.

## Governance

- Esta constitución es la fuente de verdad para principios de gobernanza del proyecto;
  codifica íntegramente las reglas de `.cursorrules` en la raíz del repositorio.
- En caso de conflicto entre documentos, prevalece esta constitución; `.cursorrules`
  MUST actualizarse para reflejar cualquier enmienda ratificada aquí.
- Enmiendas MUST: (1) documentar el cambio en Sync Impact Report, (2) incrementar
  versión semántica, (3) propagar cambios a plantillas en `.specify/templates/`.
- Todo PR/revisión MUST verificar: componentes atómicos `.jsx`, Tailwind exclusivo,
  mock RTDB canónico, UI Premium Agrotech, cero warnings, sin dependencias no aprobadas.
- Complejidad adicional MUST justificarse en la tabla Complexity Tracking del plan.

**Version**: 1.1.0 | **Ratified**: 2025-06-05 | **Last Amended**: 2026-06-08
