import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { useHealthData } from '../../health/useHealthData'
import { INPUT_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from '../ui/fieldStyles'
import SettingsSection from './SettingsSection'
import useLanguage from '../../i18n/useLanguage'

export default function ProfileForm() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { profile, saveProfile } = useHealthData()
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    mission_name: profile?.mission_name ?? '',
    mission_start_date: profile?.mission_start_date ?? '',
  })
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      setFeedback({ type: 'error', text: t('Please enter your name.') })
      return
    }
    setSaving(true)
    const ok = await saveProfile({
      full_name: form.full_name.trim(),
      mission_name: form.mission_name.trim() || null,
      mission_start_date: form.mission_start_date || null,
    })
    setSaving(false)
    setFeedback(ok ? { type: 'success', text: t('Profile saved.') } : { type: 'error', text: t('We could not save your profile. Try again.') })
  }

  return (
    <SettingsSection title={t("Account")} description={t("Your name, mission details, and sign-in email.")}>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="settings-email" className={LABEL_CLASS}>{t("Email")}</label>
          <input id="settings-email" value={user?.email ?? ''} readOnly className={`${INPUT_CLASS} opacity-60`} />
        </div>
        <div>
          <label htmlFor="settings-name" className={LABEL_CLASS}>{t("Full name")}</label>
          <input id="settings-name" value={form.full_name} onChange={update('full_name')} maxLength={80} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="settings-crew" className={LABEL_CLASS}>{t("Crew ID")}</label>
          <input id="settings-crew" value={profile?.crew_id ?? ''} readOnly className={`${INPUT_CLASS} opacity-60`} />
        </div>
        <div>
          <label htmlFor="settings-mission" className={LABEL_CLASS}>{t("Mission name")}</label>
          <input id="settings-mission" value={form.mission_name} onChange={update('mission_name')} maxLength={80} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="settings-start" className={LABEL_CLASS}>{t("Mission start date")}</label>
          <input id="settings-start" type="date" value={form.mission_start_date} onChange={update('mission_start_date')} className={INPUT_CLASS} />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON_CLASS}>
            {saving ? t('Saving...') : t('Save profile')}
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
