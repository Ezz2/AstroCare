import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { friendlyAuthError } from '../lib/authErrors'

export const AuthContext = createContext(null)

const DUPLICATE_ACCOUNT = 'An account with this email already exists. Try signing in instead.'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      (async () => {
        if (!active) return
        setSession(nextSession)
        setRecovering(event === 'PASSWORD_RECOVERY')
        setLoading(false)
      })()
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: friendlyAuthError(error) }
  }, [])

  const signUp = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error: friendlyAuthError(error), needsConfirmation: false }
    if (data.user && data.user.identities?.length === 0) {
      return { error: DUPLICATE_ACCOUNT, needsConfirmation: false }
    }
    return { error: null, needsConfirmation: !data.session }
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: friendlyAuthError(error) }
  }, [])

  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (!error) setRecovering(false)
    return { error: friendlyAuthError(error) }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      recovering,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      signOut,
    }),
    [session, loading, recovering, signIn, signUp, requestPasswordReset, updatePassword, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
