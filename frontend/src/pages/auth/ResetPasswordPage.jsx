import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '../../components/ui/fieldStyles'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const { session, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!session) {
    return (
      <AuthLayout
        title="Link no longer valid"
        subtitle="This reset link has expired or was already used. Request a new one to continue."
        footer={<Link to="/forgot-password" className="font-medium text-cyan-300 hover:text-cyan-200">Request a new link</Link>}
      />
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError('The two passwords do not match.')
      return
    }
    setSubmitting(true)
    const result = await updatePassword(password)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Enter a new password for your AstroCare account.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="password" className={LABEL_CLASS}>New password</label>
          <input id="password" type="password" autoComplete="new-password" required value={password}
            onChange={(e) => setPassword(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={LABEL_CLASS}>Confirm new password</label>
          <input id="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
          {submitting ? 'Saving...' : 'Save new password'}
        </button>
      </form>
    </AuthLayout>
  )
}
