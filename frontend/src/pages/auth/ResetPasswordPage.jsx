import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '../../components/ui/fieldStyles'
import useLanguage from '../../i18n/useLanguage'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const { session, updatePassword } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!session) {
    return (
      <AuthLayout
        title={t("Link no longer valid")}
        subtitle={t("This reset link has expired or was already used. Request a new one to continue.")}
        footer={<Link to="/forgot-password" className="font-medium text-cyan-300 hover:text-cyan-200">{t("Request a new link")}</Link>}
      />
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("Use at least {count} characters.", { count: MIN_PASSWORD_LENGTH }))
      return
    }
    if (password !== confirmPassword) {
      setError(t('The two passwords do not match.'))
      return
    }
    setSubmitting(true)
    const result = await updatePassword(password)
    setSubmitting(false)
    if (result.error) setError(t(result.error))
    else navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout title={t("Choose a new password")} subtitle={t("Enter a new password for your AstroCare account.")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="password" className={LABEL_CLASS}>{t("New password")}</label>
          <input id="password" type="password" autoComplete="new-password" required value={password}
            onChange={(e) => setPassword(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={LABEL_CLASS}>{t("Confirm new password")}</label>
          <input id="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
          {submitting ? t('Saving...') : t('Save new password')}
        </button>
      </form>
    </AuthLayout>
  )
}
