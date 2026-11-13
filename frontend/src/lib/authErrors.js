const KNOWN_ERRORS = [
  ['Invalid login credentials', 'Email or password is incorrect.'],
  ['User already registered', 'An account with this email already exists. Try signing in instead.'],
  ['Password should be at least', 'Password must be at least 8 characters.'],
  ['Email rate limit', 'Too many attempts. Wait a few minutes and try again.'],
  ['over_email_send_rate_limit', 'Too many attempts. Wait a few minutes and try again.'],
]

const GENERIC_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_MESSAGE = 'Unable to reach AstroCare. Check your connection and try again.'

export function friendlyAuthError(error) {
  if (!error) return null
  const match = KNOWN_ERRORS.find(([needle]) => error.message?.includes(needle))
  if (match) return match[1]
  if (error.name === 'AuthRetryableFetchError' || error.message === 'Failed to fetch') return NETWORK_MESSAGE
  return GENERIC_MESSAGE
}
