const CSV_HEADER = 'Fecha,Valor,Sensor'

function formatCsvDate(isoDate) {
  return new Date(isoDate).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function escapeCsvCell(value) {
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * @param {{ date: string, value: number, sensorName: string }[]} data
 * @returns {string}
 */
export function buildCsvContent(data) {
  const rows = (data ?? []).map((point) =>
    [
      escapeCsvCell(formatCsvDate(point.date)),
      escapeCsvCell(point.value),
      escapeCsvCell(point.sensorName),
    ].join(',')
  )

  return `\uFEFF${CSV_HEADER}\n${rows.join('\n')}\n`
}

/**
 * @param {{ date: string, value: number, sensorName: string }[]} data
 * @param {string} [filename='demeteria-lecturas.csv']
 */
export function exportToCSV(data, filename = 'demeteria-lecturas.csv') {
  const content = buildCsvContent(data)
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
