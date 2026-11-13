import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '../../components/ui/fieldStyles'
import useLanguage from '../../i18n/useLanguage'

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await requestPasswordReset(email.trim())
    setSubmitting(false)
    if (result.error) setError(t(result.error))
    else setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout
        title={t("Check your email")}
        subtitle={t("If an account exists for that address, a link to reset your password is on its way. The link expires after a short time.")}
        footer={<Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">{t("Back to sign in")}</Link>}
      />
    )
  }

  return (
    <AuthLayout
      title={t("Reset your password")}
      subtitle={t("Enter the email address on your account and we will send you a reset link.")}
      footer={<Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">{t("Back to sign in")}</Link>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>{t("Email")}</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
          {submitting ? t('Sending link...') : t('Send reset link')}
        </button>
      </form>
    </AuthLayout>
  )
}
