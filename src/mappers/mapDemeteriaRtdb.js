/**
 * Adapta el árbol anidado de RTDB (`demeteria.*`) a props planas para SensorCard.
 * Contrato canónico: `.cursorrules` / constitution v1.1.0
 */
export function mapDemeteriaRtdb(rtdb) {
  const d = rtdb.demeteria ?? {}

  const sensors = []

  if (d.agua?.ec) {
    sensors.push(toNumericSensor('EC Agua', 'µS/cm', d.agua.ec))
  }

  if (d.ambiente?.co2) {
    sensors.push(toNumericSensor('CO₂ Ambiente', 'ppm', d.ambiente.co2))
  }

  if (d.nivel_agua?.sen0368) {
    sensors.push(toNumericSensor('Nivel agua SEN0368', '%', d.nivel_agua.sen0368))
  }

  if (d.nivel_agua?.sen0508) {
    const node = d.nivel_agua.sen0508
    sensors.push({
      name: 'Detección agua SEN0508',
      value_type: '',
      date: new Date(node.timestamp).toISOString(),
      current: node.water_detected ? '1' : '0',
    })
  }

  if (d.temperatura?.agua) {
    sensors.push(toNumericSensor('Temperatura agua', '°C', d.temperatura.agua))
  }

  return sensors
}

function toNumericSensor(name, valueType, node) {
  return {
    name,
    value_type: valueType,
    date: new Date(node.timestamp).toISOString(),
    current: String(node.valor),
  }
}
