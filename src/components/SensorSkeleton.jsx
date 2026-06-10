import { Card } from '@tremor/react'

const SKELETON_CLASSES =
  'bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm animate-pulse'

export default function SensorSkeleton() {
  return (
    <article aria-hidden="true">
      <Card className={SKELETON_CLASSES}>
        <div className="h-5 w-32 bg-slate-200 rounded" />
        <div className="h-10 w-24 bg-slate-200 rounded mt-4" />
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
        </div>
      </Card>
    </article>
  )
}
