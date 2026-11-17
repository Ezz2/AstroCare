
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, UserRound } from 'lucide-react'
import ProfileForm from './ProfileForm'
import useLanguage from '../../i18n/useLanguage'

export default function UserSettingsModal({ onClose }) {
  const { t } = useLanguage()
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-settings-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-space-700 bg-space-900 p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <UserRound size={20} />
            </div>

            <div>
              <h2 id="user-settings-title" className="text-lg font-semibold text-ink-100">
                {t("Astronaut Settings")}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close user settings")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 transition hover:bg-space-800 hover:text-ink-100"
          >
            <X size={20} />
          </button>
        </div>

        <ProfileForm onClose={onClose} />
      </div>
    </div>,
    document.body
  )
}
