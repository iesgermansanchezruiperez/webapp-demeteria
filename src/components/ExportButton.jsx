export default function ExportButton({
  onExport,
  disabled = false,
  label = 'Exportar CSV',
}) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={disabled}
      aria-label={label}
      className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
    >
      {label}
    </button>
  )
}
