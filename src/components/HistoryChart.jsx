import { Card, LineChart, Title } from '@tremor/react'

const CARD_CLASSES =
  'bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm'

export default function HistoryChart({
  series,
  title = 'Histórico de lecturas',
  emptyMessage = 'Sin datos históricos para este sensor.',
}) {
  if (!series?.length) {
    return (
      <p className="text-slate-500 text-sm" role="status">
        {emptyMessage}
      </p>
    )
  }

  const chartData = series.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
  }))

  return (
    <Card className={CARD_CLASSES}>
      <Title className="text-slate-900 tracking-tight">{title}</Title>
      <LineChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['value']}
        colors={['emerald']}
        yAxisWidth={48}
        showAnimation
      />
    </Card>
  )
}
