import { useEffect, useRef, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import {
  mapFirestoreToSensors,
  resolveLatestReadings,
} from '../mappers/mapFirestoreToSensors'
import SensorCard from './SensorCard'
import SensorSkeleton from './SensorSkeleton'
import HistorySection from './HistorySection'

export default function Dashboard() {
  const [data, setData] = useState([])
  const [sensorsCatalog, setSensorsCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [skeletonCount, setSkeletonCount] = useState(5)

  const sensorsRawRef = useRef([])
  const readingsRawRef = useRef([])
  const sensorsReadyRef = useRef(false)
  const readingsReadyRef = useRef(false)

  useEffect(() => {
    function recomputeData() {
      const latest = resolveLatestReadings(readingsRawRef.current)
      setSensorsCatalog(sensorsRawRef.current)
      setData(mapFirestoreToSensors(sensorsRawRef.current, latest))

      const activeCount = sensorsRawRef.current.filter((s) => s.active === true).length
      if (activeCount > 0) {
        setSkeletonCount(activeCount)
      }

      if (sensorsReadyRef.current && readingsReadyRef.current) {
        setLoading(false)
      }
    }

    const unsubSensors = onSnapshot(
      collection(db, 'sensors'),
      (snapshot) => {
        sensorsRawRef.current = snapshot.docs.map((doc) => {
          const docData = doc.data()
          return { ...docData, id: docData.id ?? doc.id }
        })
        sensorsReadyRef.current = true
        recomputeData()
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    const unsubReadings = onSnapshot(
      collection(db, 'readings'),
      (snapshot) => {
        readingsRawRef.current = snapshot.docs.map((doc) => doc.data())
        readingsReadyRef.current = true
        recomputeData()
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => {
      unsubSensors()
      unsubReadings()
    }
  }, [])

  return (
    <section aria-labelledby="dashboard-title">
      <header className="mb-8">
        <p className="text-slate-600 text-sm font-medium uppercase tracking-wide">
          DemeterIA
        </p>
        <h1
          id="dashboard-title"
          className="text-slate-900 text-3xl font-semibold tracking-tight"
        >
          Dashboard de Sensores
        </h1>
        <p className="text-slate-600 mt-2">
          Monitorización en tiempo real del cultivo
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-rose-800 text-sm"
        >
          Error de conexión con Firebase: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: skeletonCount }, (_, i) => (
              <SensorSkeleton key={i} />
            ))
          : data.map((sensor) => (
              <SensorCard key={sensor.name} sensor={sensor} />
            ))}
      </div>

      {!loading && <HistorySection sensors={sensorsCatalog} />}
    </section>
  )
}
