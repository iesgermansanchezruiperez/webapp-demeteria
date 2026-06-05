export const statusConfig = {
  optimal: {
    label: 'Óptimo',
    deltaType: 'moderateIncrease',
    cardBorder: 'border-emerald-200',
    metricAccent: 'text-emerald-700',
    badgeClasses: 'text-emerald-900 bg-emerald-100 ring-1 ring-emerald-300',
  },
  warning: {
    label: 'Advertencia',
    deltaType: 'unchanged',
    cardBorder: 'border-amber-300',
    metricAccent: 'text-amber-800',
    badgeClasses: 'text-amber-900 bg-amber-100 ring-1 ring-amber-400',
  },
  critical: {
    label: 'Crítico',
    deltaType: 'decrease',
    cardBorder: 'border-rose-300',
    metricAccent: 'text-rose-800',
    badgeClasses: 'text-rose-900 bg-rose-100 ring-1 ring-rose-400',
  },
}
