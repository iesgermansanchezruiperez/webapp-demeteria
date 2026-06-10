import sensorData from '../mocks/sensorData.json'
import { mapDemeteriaRtdb } from '../mappers/mapDemeteriaRtdb'
import SensorCard from './SensorCard'

const sensors = mapDemeteriaRtdb(sensorData)

export default function Dashboard() {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.name} sensor={sensor} />
        ))}
      </div>
    </section>
  )
}
