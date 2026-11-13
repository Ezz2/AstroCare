/* eslint-disable react/prop-types */
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { MEASUREMENT_INSTRUCTIONS } from '../../data/measurementInstructions'
import useLanguage from '../../i18n/useLanguage'

export default function MeasurementInstructionsModal({ instructionId, onClose }) {
  const { t } = useLanguage()
  const instructions = MEASUREMENT_INSTRUCTIONS[instructionId]

  useEffect(() => {
    if (!instructions) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [instructions, onClose])

  if (!instructions) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-space-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="measurement-instructions-title"
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-space-600 bg-space-900 shadow-2xl shadow-space-950/50">
        <header className="flex items-start justify-between gap-4 border-b border-space-700 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{t("Measurement guide")}</p>
            <h2 id="measurement-instructions-title" className="mt-1 font-display text-xl font-semibold">
              {t("How to measure: {title}", { title: t(instructions.title) })}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close measurement instructions")}
            className="rounded-lg p-2 text-ink-500 transition hover:bg-space-800 hover:text-ink-100">
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          <InstructionSection title={t("Before measuring")} items={instructions.before.map((item) => t(item))} />
          <InstructionSection title={t("How to measure")} items={instructions.howTo.map((item) => t(item))} numbered />
          <InstructionSection title={t("What to record")} items={[t(instructions.record)]} />
          <InstructionSection title={t("Important notes")} items={instructions.notes.map((item) => t(item))} />
        </div>

        <footer className="flex justify-end border-t border-space-700 px-5 py-3 sm:px-6">
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-space-950 transition hover:bg-cyan-300">
            {t("Close")}
          </button>
        </footer>
      </div>
    </div>
  )
}

function InstructionSection({ title, items, numbered = false }) {
  const List = numbered ? 'ol' : 'ul'

  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 font-display text-sm font-semibold text-cyan-300">{title}</h3>
      <List className={numbered ? 'list-decimal space-y-2 pl-5 text-sm leading-6 text-ink-300' : 'list-disc space-y-2 pl-5 text-sm leading-6 text-ink-300'}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </section>
  )
}
