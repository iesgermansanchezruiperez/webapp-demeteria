# Requisitos — Issue #9: UI del Dashboard y Accesibilidad Pronisa

| Campo | Valor |
|---|---|
| **Issue** | [#9](https://github.com/iesgermansanchezruiperez/webapp-demeteria/issues/9) |
| **Fase SDD** | 1 — Especificación de requisitos |
| **Fuente** | Issue #9, `.cursorrules`, `sensorData.json` |
| **Audiencia** | Usuarios de mantenimiento agrícola de Pronisa (diversidad funcional) |

## 1. Contexto

El dashboard DemeterIA muestra lecturas de sensores de cultivo (temperatura, humedad, pH) de forma clara y accesible. Los datos provienen de un mock local con la estructura RTDB definida en `.cursorrules`. La UI usa Tremor para componentes analíticos y Tailwind para estilos.

## 2. Umbrales numéricos propuestos (lógica de negocio)

> El issue no define umbrales. Se proponen rangos realistas para cultivo general en invernadero/campo abierto templado.

### 2.1 Temperatura (°C)

| Estado | Rango |
|---|---|
| `optimal` | 18 ≤ valor ≤ 30 |
| `warning` | (15 ≤ valor < 18) OR (30 < valor ≤ 35) |
| `critical` | valor < 15 OR valor > 35 |

### 2.2 Humedad (%)

| Estado | Rango |
|---|---|
| `optimal` | 40 ≤ valor ≤ 70 |
| `warning` | (30 ≤ valor < 40) OR (70 < valor ≤ 80) |
| `critical` | valor < 30 OR valor > 80 |

### 2.3 pH

| Estado | Rango |
|---|---|
| `optimal` | 5.5 ≤ valor ≤ 7.0 |
| `warning` | (5.0 ≤ valor < 5.5) OR (7.0 < valor ≤ 7.5) |
| `critical` | valor < 5.0 OR valor > 7.5 |

### 2.4 Validación con mock actual

| Sensor | Valor mock | Estado esperado |
|---|---|---|
| Temperatura | 26.10 °C | `optimal` |
| Humedad | 50.00 % | `optimal` |
| pH | 6.10 | `optimal` |

## 3. Requisitos EARS

### 3.1 Requisitos ubicuos (Ubiquitous)

- **REQ-U-001:** El sistema **deberá** renderizar exactamente tres tarjetas de sensor correspondientes a Temperatura, Humedad y pH.
- **REQ-U-002:** El sistema **deberá** leer los datos desde el mock local `sensorData.json` con la estructura `crop_sensors[]` definida en `.cursorrules`.
- **REQ-U-003:** El sistema **deberá** utilizar los componentes Tremor `Card`, `Metric` y `BadgeDelta` de `@tremor/react` en cada tarjeta de sensor.
- **REQ-U-004:** El sistema **deberá** mostrar en cada tarjeta: nombre del sensor, valor actual con unidad (`value_type`), fecha/hora de lectura y estado semántico.
- **REQ-U-005:** El sistema **deberá** calcular el estado de cada sensor como `optimal`, `warning` o `critical` aplicando los umbrales de la sección 2.
- **REQ-U-006:** El sistema **deberá** asignar color verde (`emerald`) al estado `optimal`, amarillo (`amber`) al estado `warning` y rojo (`rose`) al estado `critical`.
- **REQ-U-007:** El sistema **deberá** aplicar la paleta de colores mediante clases Tailwind, sin CSS personalizado fuera de utilidades base.
- **REQ-U-008:** El sistema **deberá** garantizar un ratio de contraste mínimo de **4.5:1** entre texto normal y su fondo en todos los elementos legibles del dashboard.
- **REQ-U-009:** El sistema **deberá** mostrar las etiquetas de estado en español: `Óptimo`, `Advertencia`, `Crítico`.
- **REQ-U-010:** El sistema **deberá** organizar las tarjetas en un layout tipo Bento Grid: `grid-cols-1 md:grid-cols-3` con `gap-6`.
- **REQ-U-011:** El sistema **deberá** aplicar estética Premium Agrotech: fondo con gradiente sutil, tarjetas con glassmorphism (`bg-white/80 backdrop-blur-md`) y microinteracción en hover.
- **REQ-U-012:** El sistema **deberá** mantener archivos en JSX (sin TypeScript) y componentes funcionales atómicos.

### 3.2 Requisitos dirigidos por eventos (Event-driven)

- **REQ-E-001:** **Cuando** el dashboard se carga, el sistema **deberá** mapear cada elemento de `crop_sensors` a una tarjeta Tremor independiente.
- **REQ-E-002:** **Cuando** se renderiza el valor de un sensor, el sistema **deberá** parsear `current` como número de punto flotante antes de evaluar umbrales.
- **REQ-E-003:** **Cuando** se determina el estado de un sensor, el sistema **deberá** propagar ese estado al borde de la tarjeta, al acento del valor métrico y al `BadgeDelta`.
- **REQ-E-004:** **Cuando** se muestra la fecha de lectura, el sistema **deberá** formatearla en locale `es-ES` con fecha y hora cortas.

### 3.3 Requisitos dirigidos por estado (State-driven)

- **REQ-S-001:** **Mientras** el estado del sensor sea `optimal`, el sistema **deberá** usar `BadgeDelta` con `deltaType="moderateIncrease"` y clases Tailwind en tonos `emerald`.
- **REQ-S-002:** **Mientras** el estado del sensor sea `warning`, el sistema **deberá** usar `BadgeDelta` con `deltaType="unchanged"` y clases Tailwind en tonos `amber`.
- **REQ-S-003:** **Mientras** el estado del sensor sea `critical`, el sistema **deberá** usar `BadgeDelta` con `deltaType="decrease"` y clases Tailwind en tonos `rose`.

### 3.4 Requisitos de comportamiento no deseado (Unwanted behaviour)

- **REQ-UW-001:** **Si** el nombre del sensor no coincide con temperatura, humedad ni pH, entonces el sistema **deberá** asignar estado `warning` como fallback seguro.
- **REQ-UW-002:** **Si** `current` no es un número válido, entonces el sistema **deberá** tratar el valor como indeterminado y asignar estado `warning`.
- **REQ-UW-003:** **Si** el contraste texto/fondo de cualquier elemento legible es inferior a 4.5:1, entonces el sistema **no deberá** desplegarse como cumplimiento del DoD del issue.

### 3.5 Requisitos opcionales (Optional)

- **REQ-O-001:** **Donde** se implemente semántica A11y avanzada, el sistema **deberá** usar `<article>` por tarjeta con `aria-labelledby` y `aria-describedby`.
- **REQ-O-002:** **Donde** se exponga el valor a lectores de pantalla, el sistema **deberá** incluir `aria-label` con valor, unidad y estado en español.
- **REQ-O-003:** **Donde** existan elementos interactivos, el sistema **deberá** mostrar anillo de foco visible (`focus-visible`) conforme a `.cursorrules`.

### 3.6 Requisitos complejos (Complex)

- **REQ-C-001:** **Donde** se renderice una tarjeta Tremor, **cuando** el estado calculado cambie entre `optimal`, `warning` o `critical`, **si** el valor numérico cae dentro de los umbrales de la sección 2, entonces el sistema **deberá** actualizar de forma coherente el color del borde, el acento métrico y el `BadgeDelta` sin inconsistencias visuales entre los tres indicadores.

## 4. Paleta de contraste (referencia de implementación)

Combinaciones mínimas aceptables (ratio ≥ 4.5:1):

| Elemento | Texto | Fondo |
|---|---|---|
| Título / métrica principal | `text-slate-900` | `bg-white/80` |
| Texto secundario (fecha) | `text-slate-600` | `bg-white/80` |
| Badge `optimal` | `text-emerald-900` | `bg-emerald-100` |
| Badge `warning` | `text-amber-900` | `bg-amber-100` |
| Badge `critical` | `text-rose-900` | `bg-rose-100` |
| Acento métrica por estado | `text-emerald-700` / `text-amber-800` / `text-rose-800` | — |

## 5. Criterios de aceptación (trazabilidad al DoD)

| DoD Issue #9 | Requisitos |
|---|---|
| 3 métricas desde JSON local | REQ-U-001, REQ-U-002, REQ-E-001 |
| Colores reactivos al estado | REQ-U-006, REQ-E-003, REQ-S-001..003, REQ-C-001 |
| Contraste ≥ 4.5:1 | REQ-U-008, REQ-UW-003, Sección 4 |

## 6. Out of scope

Queda **explícitamente fuera de alcance** de este issue:

- Conexión a Firebase Realtime Database o cualquier backend en tiempo real
- Autenticación, autorización o gestión de usuarios
- Histórico de lecturas, gráficas temporales o tendencias
- Alertas push, notificaciones o sonidos
- Configuración de umbrales por el usuario final
- Internacionalización (i18n) más allá de español
- Tests automatizados de accesibilidad (axe, pa11y) o E2E
- Nuevas dependencias npm (librerías de A11y, charts, state management)
- Rutas adicionales, navegación o páginas secundarias
- Soporte offline, PWA o service workers
- Refactor del mock `sensorData.json` o ampliación de tipos de sensor
- Despliegue, CI/CD o documentación de usuario final
