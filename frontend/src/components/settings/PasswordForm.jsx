import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '../ui/fieldStyles'
import SettingsSection from './SettingsSection'
import useLanguage from '../../i18n/useLanguage'

const MIN_PASSWORD_LENGTH = 8

export default function PasswordForm() {
  const { t } = useLanguage()
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFeedback({ type: 'error', text: t("Use at least {count} characters.", { count: MIN_PASSWORD_LENGTH }) })
      return
    }
    if (password !== confirm) {
      setFeedback({ type: 'error', text: t('The two passwords do not match.') })
      return
    }
    setSaving(true)
    const { error } = await updatePassword(password)
    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', text: t(error) })
      return
    }
    setPassword('')
    setConfirm('')
    setFeedback({ type: 'success', text: t('Your password has been updated.') })
  }

  return (
    <SettingsSection title={t("Security")} description={t("Change the password you use to sign in.")}>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="settings-password" className={LABEL_CLASS}>{t("New password")}</label>
          <input
            id="settings-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="settings-confirm" className={LABEL_CLASS}>{t("Confirm password")}</label>
          <input
            id="settings-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON_CLASS}>
            {saving ? t('Updating...') : t('Update password')}
          </button>
          {feedback && (
            <p role="status" className={`text-sm ${feedback.type === 'success' ? 'text-teal-400' : 'text-rose-400'}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </SettingsSection>
  )
}
