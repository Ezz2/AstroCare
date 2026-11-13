import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '../../components/ui/fieldStyles'

const MIN_PASSWORD_LENGTH = 8

export default function SignUpPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    const result = await signUp(email.trim(), password, fullName.trim())
    setSubmitting(false)
    if (result.error) setError(result.error)
    else if (result.needsConfirmation) setPendingConfirmation(true)
  }

  if (pendingConfirmation) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`We created your account. Confirm ${email} to continue, then sign in.`}
        footer={<Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">Back to sign in</Link>}
      />
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Your health history is private to you. New accounts start with simulated demonstration readings, clearly labelled."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="fullName" className={LABEL_CLASS}>Full name</label>
          <input id="fullName" type="text" autoComplete="name" required value={fullName}
            onChange={(e) => setFullName(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>Email</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>
        <div>
          <label htmlFor="password" className={LABEL_CLASS}>Password</label>
          <input id="password" type="password" autoComplete="new-password" required value={password}
            onChange={(e) => setPassword(e.target.value)} className={INPUT_CLASS} disabled={submitting}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={LABEL_CLASS}>Confirm password</label>
          <input id="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} className={INPUT_CLASS} disabled={submitting} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
