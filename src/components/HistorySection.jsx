import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { mapReadingsToHistorySeries } from '../mappers/mapReadingsToHistorySeries'
import { exportToCSV } from '../utils/export'
import HistoryChart from './HistoryChart'
import ExportButton from './ExportButton'

export default function HistorySection({ sensors = [] }) {
  const activeSensors = useMemo(
    () => sensors.filter((s) => s.active === true),
    [sensors]
  )

  const [selectedSensorId, setSelectedSensorId] = useState(null)
  const [series, setSeries] = useState([])
  const [error, setError] = useState(null)

  const effectiveSensorId = selectedSensorId ?? activeSensors[0]?.id ?? ''

  useEffect(() => {
    if (!effectiveSensorId) return undefined

    const sensorName =
      activeSensors.find((s) => s.id === effectiveSensorId)?.name ??
      effectiveSensorId

    const historyQuery = query(
      collection(db, 'readings'),
      where('sensorId', '==', effectiveSensorId),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const readings = snapshot.docs.map((doc) => doc.data())
        setSeries(mapReadingsToHistorySeries(readings, sensorName))
        setError(null)
      },
      (err) => {
        setError(err.message)
        setSeries([])
      }
    )

    return () => unsubscribe()
  }, [effectiveSensorId, activeSensors])

  const selectedName =
    activeSensors.find((s) => s.id === effectiveSensorId)?.name ?? ''

  const loading = Boolean(effectiveSensorId) && series.length === 0 && !error

  function handleSensorChange(event) {
    setSelectedSensorId(event.target.value)
    setSeries([])
    setError(null)
  }

  return (
    <section aria-labelledby="history-title" className="mt-12">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="history-title"
            className="text-slate-900 text-2xl font-semibold tracking-tight"
          >
            Histórico
          </h2>
          <p className="text-slate-600 mt-1 text-sm">
            Serie temporal por sensor
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Sensor
            <select
              value={effectiveSensorId}
              onChange={handleSensorChange}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-slate-900 shadow-sm"
            >
              {activeSensors.map((sensor) => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.name}
                </option>
              ))}
            </select>
          </label>
          <ExportButton
            disabled={!series.length || loading}
            onExport={() =>
              exportToCSV(series, `demeteria-${effectiveSensorId}.csv`)
            }
          />
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-rose-800 text-sm"
        >
          Error al cargar histórico: {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm" role="status">
          Cargando histórico…
        </p>
      ) : (
        <HistoryChart series={series} title={selectedName || 'Histórico'} />
      )}
    </section>
  )
}
