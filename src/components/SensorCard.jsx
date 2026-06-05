import { BadgeDelta, Card, Metric, Text } from '@tremor/react'
import { getSensorStatus } from '../utils/getSensorStatus'
import { statusConfig } from '../utils/statusConfig'

const CARD_BASE_CLASSES =
  'bg-white/80 backdrop-blur-md border rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5'

function getSensorSlug(name) {
  return name
    .toLowerCase()
    .replace(/^sensor de\s+/, '')
    .replace(/\s+/g, '-')
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function SensorCard({ sensor }) {
  const value = parseFloat(sensor.current)
  const status = getSensorStatus(sensor.name, value)
  const config = statusConfig[status] ?? statusConfig.warning

  const slug = getSensorSlug(sensor.name)
  const titleId = `sensor-${slug}-title`
  const descId = `sensor-${slug}-desc`

  return (
    <article aria-labelledby={titleId} aria-describedby={descId}>
      <Card className={`${CARD_BASE_CLASSES} ${config.cardBorder}`}>
        <h2
          id={titleId}
          className="text-slate-900 font-medium tracking-tight"
        >
          {sensor.name}
        </h2>
        <Metric
          className={`text-slate-900 tracking-tight ${config.metricAccent}`}
          aria-label={`Valor actual: ${sensor.current} ${sensor.value_type}`}
        >
          {sensor.current} {sensor.value_type}
        </Metric>
        <div
          id={descId}
          className="mt-4 flex items-center justify-between gap-4"
        >
          <time dateTime={sensor.date}>
            <Text className="text-slate-600 text-sm">
              {formatDate(sensor.date)}
            </Text>
          </time>
          <BadgeDelta
            deltaType={config.deltaType}
            className={config.badgeClasses}
            aria-label={`Estado: ${config.label}`}
          >
            {config.label}
          </BadgeDelta>
        </div>
      </Card>
    </article>
  )
}
