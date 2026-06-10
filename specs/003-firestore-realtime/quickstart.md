# Quickstart: Validación Firestore Realtime + JOIN

**Feature**: `003-firestore-realtime` | **Date**: 2026-06-10

## Prerequisites

- Node ≥ 20.19 (`nvm use 22`)
- `.env` con vars `VITE_FIREBASE_*` (copiar de `.env.example`)
- Acceso al proyecto Firebase configurado en `VITE_FIREBASE_PROJECT_ID` (Firestore habilitado)
- Colecciones `sensors` y `readings` con datos

## 1. Validar mock + mapper (sin Firestore)

```bash
cp .env.example .env   # si no existe
npm run dev            # opcional; mapper se valida offline
```

Tras implementar `mapFirestoreToSensors`:

1. Abrir `src/mocks/sensorData.json` — debe tener `sensors[]` y `readings[]`.
2. Verificar manualmente que el mapper produce objetos con exactamente:
   `{ name, current, value_type, date }`.
3. Confirmar FR-004: con dos readings del mismo `sensorId`, gana el de mayor `timestamp`.
4. Confirmar FR-006: `unit` → `value_type`, `value` → `current` (string).

Contrato detallado: [contracts/mapper-join.md](./contracts/mapper-join.md)

## 2. Arrancar dashboard con Firestore

```bash
nvm use 22
npm run dev
```

Abrir http://localhost:5173/

**Esperado**:
- Skeleton Tailwind durante carga inicial (SC-004)
- Tarjetas por cada sensor `active: true` con lectura en `readings` (SC-006)
- Sin errores en consola del navegador

## 3. Prueba tiempo real (SC-001)

1. Firebase Console → Firestore → colección `readings`
2. **Agregar documento**:
   - `sensorId`: `sensor_humedad_01` (o sensor activo existente)
   - `value`: número distinto al actual (ej. `62`)
   - `timestamp`: epoch ms actual (ej. `Date.now()` en consola del navegador)
3. **Sin recargar** la página, la tarjeta correspondiente MUST actualizar `current` en < 1 s.

## 4. Prueba JOIN (FR-004 + FR-006)

| Acción | Resultado esperado |
|--------|-------------------|
| Insert reading con `sensorId` inexistente en `sensors` | No nueva tarjeta |
| Sensor `active: false` en `sensors` | No aparece en grid |
| Sensor activo sin readings | No aparece en grid |
| Cambiar `name`/`unit` en doc `sensors` | Tarjeta refleja nuevo name/value_type |
| Dos readings mismo sensor, timestamps distintos | Muestra valor del timestamp mayor |

## 5. Prueba error

1. Renombrar temporalmente `VITE_FIREBASE_PROJECT_ID` en `.env` a valor inválido
2. Reiniciar `npm run dev`
3. **Esperado**: banner error accesible, app no crashea

## 6. Build y lint (FR-015)

```bash
npm run lint
npm run build
```

**Esperado**: exit code 0, cero warnings.

## Referencias

- Diseño JOIN: [design.md §4](./design.md)
- Modelo de datos: [data-model.md](./data-model.md)
- Servicio Firebase: [contracts/firebase-service.md](./contracts/firebase-service.md)
