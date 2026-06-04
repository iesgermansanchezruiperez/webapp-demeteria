import { BadgeDelta, Card, Metric, Text } from '@tremor/react'
import sensorData from '../mocks/sensorData.json'

const STATUS_LABELS = {
  optimal: 'Optimal',
  warning: 'Warning',
  critical: 'Critical',
}

const STATUS_DELTA = {
  optimal: 'moderateIncrease',
  warning: 'unchanged',
  critical: 'decrease',
}

function getSensorStatus(name, value) {
  const normalizedName = name.toLowerCase()

  if (normalizedName.includes('temperatura')) {
    if (value >= 18 && value <= 30) return 'optimal'
    if ((value >= 15 && value < 18) || (value > 30 && value <= 35)) return 'warning'
    return 'critical'
  }

  if (normalizedName.includes('humedad')) {
    if (value >= 40 && value <= 70) return 'optimal'
    if ((value >= 30 && value < 40) || (value > 70 && value <= 80)) return 'warning'
    return 'critical'
  }

  if (normalizedName.includes('ph')) {
    if (value >= 5.5 && value <= 7.0) return 'optimal'
    if ((value >= 5.0 && value < 5.5) || (value > 7.0 && value <= 7.5)) return 'warning'
    return 'critical'
  }

  return 'warning'
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function SensorCard({ sensor }) {
  const value = parseFloat(sensor.current)
  const status = getSensorStatus(sensor.name, value)

  return (
    <Card className="max-w-xs">
      <Text>{sensor.name}</Text>
      <Metric>
        {sensor.current} {sensor.value_type}
      </Metric>
      <div className="mt-4 flex items-center justify-between">
        <Text className="text-tremor-content-subtle">
          {formatDate(sensor.date)}
        </Text>
        <BadgeDelta deltaType={STATUS_DELTA[status]}>
          {STATUS_LABELS[status]}
        </BadgeDelta>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <section>
      <div className="mb-6">
        <Text className="text-tremor-content-subtle">DemeterIA</Text>
        <Metric>Dashboard de Sensores</Metric>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sensorData.crop_sensors.map((sensor) => (
          <SensorCard key={sensor.name} sensor={sensor} />
        ))}
      </div>
    </section>
  )
}
