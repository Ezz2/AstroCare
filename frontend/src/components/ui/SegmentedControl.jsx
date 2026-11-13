export default function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex w-fit flex-wrap rounded-xl border border-space-700 bg-space-900/70 p-1">
      {options.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
              active ? 'bg-cyan-400/15 text-cyan-200' : 'text-ink-300 hover:text-ink-100'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
