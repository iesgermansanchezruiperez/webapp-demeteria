export function getSensorStatus(name, value) {
  if (Number.isNaN(value)) return 'warning'

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
