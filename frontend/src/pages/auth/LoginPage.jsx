import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '../../components/ui/fieldStyles'
import useLanguage from '../../i18n/useLanguage'

export default function LoginPage() {
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    setSubmitting(false)
    if (result.error) setError(t(result.error))
  }

  return (
    <AuthLayout
      title={t("Welcome back")}
      subtitle={t("Sign in to reach your personal health overview.")}
      footer={
        <>
          {t("New astronaut?")}{' '}
          <Link to="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
            {t("Create an account")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>{t("Email")}</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
            disabled={submitting}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-ink-300">{t("Password")}</label>
            <Link to="/forgot-password" className="text-xs text-cyan-300 hover:text-cyan-200">{t("Forgot password?")}</Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
            disabled={submitting}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
          {submitting ? t('Signing in...') : t('Sign in')}
        </button>
      </form>
    </AuthLayout>
  )
}
